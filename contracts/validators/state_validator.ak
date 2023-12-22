use aiken/dict
use aiken/list
use aiken/string
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/value.{
  MintedValue, PolicyId, from_minted_value, quantity_of,
}
use mintun/cip68.{has_label, reference_token_label, royalty_token_asset_name}
use mintun/state.{
  MintState, find_state_inputs, from_datum, state_reference_asset_name,
  state_user_asset_name,
}
use mintun/util.{bool_to_string, find_asset_outputs, tx_in_interval}

validator(state_mint_policy_id: PolicyId) {
  fn validate(_datum, _redeemer, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    expect Spend(_spent_utxo_reference) = purpose
    trace @"Confirmed this is being invoked as a spending validator"

    let Transaction { inputs, outputs, mint, .. } = transaction

    // Verifies both tokens are included in the input (is this the case if we are burning to state mint?)
    let (_, state_reference_input) =
      find_state_inputs(inputs, state_mint_policy_id)

    // Previous state should be stored on the datum of the state reference input
    let input_state =
      from_datum(transaction, state_reference_input.output.datum)

    // Ensure that the state tokens validity range constraint is met, if that constraint exists.
    expect
      tx_in_interval(transaction.validity_range, input_state.validity_range)
    // Check if we are spending this back the validator address or burning
    let reference_outputs =
      find_asset_outputs(
        outputs,
        state_mint_policy_id,
        state_reference_asset_name,
      )

    let reference_output_count = list.length(reference_outputs)
    // Check if we are burning the reference token (otherwise must be minting from batch mint policy)
    if reference_output_count == 0 {
      trace @"This should be a burn of the reference token"
      let values = from_minted_value(mint) |> value.to_dict()

      // Only should be minting to the state burn address
      expect dict.size(values) == 1
      expect Some(tokens) = dict.get(values, state_mint_policy_id)

      // Should burn both the user and reference token
      expect Some(user_token_quantity) = dict.get(tokens, state_user_asset_name)
      expect Some(reference_token_quantity) =
        dict.get(tokens, state_reference_asset_name)

      and {
        user_token_quantity == -1,
        reference_token_quantity == -1,
      }
    } else {
      trace @"This spend should include a mint from the associated minting policy"
      expect reference_output_count == 1
      expect [state_reference_output] = reference_outputs
      let output_state = from_datum(transaction, state_reference_output.datum)

      // Check if the royalty mint state update is valid
      let royalty_mint_quantity =
        from_minted_value(mint)
          |> quantity_of(input_state.mint_policy_id, royalty_token_asset_name)

      // Either the royalty wasn't minted or if it was then the state should have been updated
      expect or {
          and {
            royalty_mint_quantity == 0,
            input_state.has_minted_royalty == output_state.has_minted_royalty,
          },
          and {
            royalty_mint_quantity == 1,
            input_state.has_minted_royalty == False,
            output_state.has_minted_royalty == True,
            input_state.tokens == 0,
          },
        }
      trace @"Royalty token state validated"

      let output_count = count_mints(mint, input_state)
      trace string.concat(@"Mint count is ", string.from_int(output_count))

      // Check that the output count hasn't exceeded max token count
      expect
        when input_state.max_tokens is {
          Some(max_tokens) -> output_count <= max_tokens
          None -> True
        }
      // Validate the output state has only mutated the token count to the correct amount
      and {
        output_state.max_tokens == input_state.max_tokens,
        output_state.validity_range == input_state.validity_range,
        output_state.reference_address == input_state.reference_address,
        output_state.state_policy_id == input_state.state_policy_id,
        output_state.mint_policy_id == input_state.mint_policy_id,
        output_state.tokens == output_count,
      }
    }
  }
}

/// Count the number of tokens minted or burned at the batch mint policy_id
fn count_mints(mint: MintedValue, state: MintState) {
  let values = from_minted_value(mint)

  trace string.concat(@"Value is zero? ", bool_to_string(value.is_zero(values)))
  let tokens = value.tokens(values, state.mint_policy_id)

  trace string.concat(
    @"Mint tokens dict is empty? ",
    bool_to_string(dict.is_empty(tokens)),
  )

  // Must mint at least one token with the batch mint policy
  expect dict.is_empty(tokens) |> not()
  // Sum the minted quantity of just the reference tokens minted
  dict.foldl(
    tokens,
    state.tokens,
    fn(asset_name, quantity, count) {
      if has_label(asset_name, reference_token_label) {
        count + quantity
      } else {
        count
      }
    },
  )
}
