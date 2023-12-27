use aiken/dict
use aiken/string
use aiken/transaction.{Input, ScriptContext, Spend, Transaction}
use aiken/transaction/value.{MintedValue, PolicyId}
use mintun/cip68
use mintun/collection.{CollectionState}
use mintun/common
use mintun/input as in
use mintun/output as out

validator(mint_policy_id: PolicyId) {
  fn spend(_datum, _redeemer, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    expect Spend(spent_utxo_reference) = purpose
    expect Some(spent_utxo_input) =
      transaction.find_input(transaction.inputs, spent_utxo_reference)
    trace @"Confirmed this is being invoked as a spending validator"

    // Double check the input we are spending is the reference token for the minting policy
    let maybe_found_token_input =
      in.find_nft(
        transaction.inputs,
        mint_policy_id,
        collection.reference_asset_name,
      )

    // Only validate spend if it is the reference token. If it is anything else we
    // don't care just let it be spent.
    when maybe_found_token_input is {
      Some(found_token_input) ->
        spent_utxo_input == found_token_input && validate_spend(
          transaction,
          mint_policy_id,
          spent_utxo_input,
        )
      None -> True
    }
  }
}

// TODO: Allow updating of CollectionInfo object in a non-minting transaction that spends the owner token
fn validate_spend(
  transaction: Transaction,
  mint_policy_id: PolicyId,
  spent_utxo_input: Input,
) {
  let Transaction { inputs, outputs, mint, .. } = transaction
  // Make sure the (111)Collection token for that minting policy is also spent 
  expect in.has_nft(inputs, mint_policy_id, collection.owner_asset_name)?
  // Previous state should be stored on the datum of the state reference input
  let input_data =
    collection.from_datum(transaction, spent_utxo_input.output.datum)

  // Ensure that the state tokens validity range constraint is met, if that constraint exists.
  expect
    common.tx_in_interval(transaction.validity_range, input_data.mint_window)
  // Get the output utxo where the reference token is spent
  expect [spent_utxo_output] =
    out.find_by_asset(outputs, mint_policy_id, collection.reference_asset_name)

  // Verify it is spent back to this spending validator
  expect spent_utxo_input.output.address == spent_utxo_output.address
  // Finally we can verify the datum
  let output_data = collection.from_datum(transaction, spent_utxo_output.datum)

  let (mints, burns) = count_mints(mint, mint_policy_id)
  trace string.concat(@"Mint count is ", string.from_int(mints))
  trace string.concat(@"Brun count is ", string.from_int(burns))

  let current_nfts = input_data.current_nfts + mints - burns

  // Check that the output count hasn't exceeded max token count
  expect
    when input_data.max_nfts is {
      Some(max_nfts) -> current_nfts <= max_nfts
      None -> True
    }
  // Validate the output state has only mutated the token count and updated the next sequence
  and {
    output_data.name == input_data.name,
    output_data.group == input_data.group,
    output_data.mint_window == input_data.mint_window,
    output_data.max_nfts == input_data.max_nfts,
    output_data.reference_address == input_data.reference_address,
    output_data.current_nfts == current_nfts,
    output_data.next_sequence == input_data.next_sequence + mints,
    output_data.info == input_data.info,
    output_data.extra == input_data.extra,
  }
}

/// Count the number of tokens minted or burned at the batch mint policy_id
fn count_mints(mint: MintedValue, mint_policy_id: PolicyId) {
  let values = value.from_minted_value(mint)

  trace string.concat(
    @"Value is zero? ",
    common.bool_to_string(value.is_zero(values)),
  )
  let tokens = value.tokens(values, mint_policy_id)

  trace string.concat(
    @"Mint tokens dict is empty? ",
    common.bool_to_string(dict.is_empty(tokens)),
  )

  // Must mint at least one token with the batch mint policy
  expect dict.is_empty(tokens) |> not()
  // Sum the minted quantity of just the reference tokens minted
  dict.foldl(
    tokens,
    (0, 0),
    fn(asset_name, quantity, sums) {
      let (mints, burns) = sums
      if cip68.has_label(asset_name, cip68.reference_token_label) {
        if quantity == 1 {
          (mints + 1, burns)
        } else if quantity == -1 {
          (mints, burns + 1)
        } else {
          // Should never be the case mint or burn is not +/- 1
          fail
        }
      } else {
        (mints, burns)
      }
    },
  )
}
