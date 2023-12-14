use aiken/bytearray
use aiken/dict
use aiken/interval.{intersection}
use aiken/list
use aiken/transaction.{Mint, ScriptContext, Transaction}
use aiken/transaction/credential.{from_script}
use aiken/transaction/value.{PolicyId, from_minted_value}
use mintun/label.{nft_user_token_label, reference_token_label}
use mintun/mint/cip68.{to_cip68_asset_name}
use mintun/mint/state.{
  MintState, from_datum, state_reference_asset_name, state_user_asset_name,
}
use mintun/util.{
  find_asset_inputs, find_asset_outputs, find_outputs_by_label,
  find_policy_inputs,
}

/// This minting policy is parameterized by the policy id of the state mint token which generates the initial state of the mint.
/// It expects a user token be supplied to authorize a mint.  It also requires the reference token which will update state respectively.
validator(state_mint_policy_id: PolicyId) {
  fn mint(_, context: ScriptContext) {
    trace @"batch_mint start"
    let ScriptContext { transaction, purpose } = context

    // The purpose of this contract is minting (and burning)
    expect Mint(policy_id) = purpose
    trace @"Confirmed purpose is mint|burn"

    // Make sure we have the requisite input state tokens and grab previous state
    let previous_mint_state =
      validate_state_input(state_mint_policy_id, transaction)

    // TODO: Handle special case here of minting a royalty token (previous_mint_state.tokens == 0 && previous_mint_state.has_royalty == False)
    let updated_minted_royalty = False
    // Validate the minted assets match requirements and compute new token count
    let new_token_count = validate_mints(transaction, policy_id)

    // Compute what the new token count should be
    let updated_token_count = new_token_count + previous_mint_state.tokens

    // Expect no black magic to have occurred
    expect updated_token_count >= 0
    // Enforce max token count if there is a max
    expect
      when previous_mint_state.max_tokens is {
        Some(max_count) -> updated_token_count <= max_count
        None -> True
      }
    // Finally check outputs are sent to valid addresses
    validate_outputs(
      transaction,
      policy_id,
      state_mint_policy_id,
      previous_mint_state,
      updated_token_count,
      updated_minted_royalty,
    )
  }
}

/// This function sorts through the minted tokens to pair user and reference tokens.  
/// Then for each pair it validates they are labelled with CIP-68 standard 100 and 222. 
fn validate_mints(transaction: Transaction, policy_id: PolicyId) {
  let Transaction { mint, .. } = transaction

  let assets =
    from_minted_value(mint)
      |> value.tokens(policy_id)
      |> dict.to_list()
      |> list.sort(fn(l, r) { bytearray.compare(l.1st, r.1st) })

  let num_assets = list.length(assets)

  expect num_assets % 2 == 0
  let asset_partition = list.span(assets, num_assets / 2)
  let groups = list.zip(asset_partition.1st, asset_partition.2nd)

  validate_mint_recursive(groups)
}

/// This function takes the first pair in the list and validates it match CIP-68 spec. 
/// Then it recursively calls itself with the remainder of the list until every mint pair has been validated.
fn validate_mint_recursive(mint: List<((ByteArray, Int), (ByteArray, Int))>) {
  when mint is {
    [(reference_token_asset, user_token_asset), ..rest] -> {
      let reference_token_name = to_cip68_asset_name(reference_token_asset.1st)
      let user_token_name = to_cip68_asset_name(user_token_asset.1st)

      // Check we have a token pair of single quantity that is mint or burn
      expect and {
          reference_token_name.label == reference_token_label,
          user_token_name.label == nft_user_token_label,
          reference_token_name.name == user_token_name.name,
          reference_token_asset.2nd == user_token_asset.2nd,
          or {
            reference_token_asset.2nd == 1,
            reference_token_asset.2nd == -1,
          },
        }
      // Valdate the remaining mints
      let token_count = validate_mint_recursive(rest)
      // Add this mint token count to the total token count
      token_count + reference_token_asset.2nd
    }
    [] -> 0
  }
}

/// Verifies the required state tokens are included in the inputs and
/// Pulls out the state and also check validity_window if it is set
fn validate_state_input(
  state_policy_id: PolicyId,
  transaction: Transaction,
) -> MintState {
  let Transaction { inputs, validity_range, .. } = transaction

  // Find the state inputs
  let state_inputs = find_policy_inputs(inputs, state_policy_id)

  // Must find exactly one matching state reference token in inputs
  expect [state_reference_input] =
    find_asset_inputs(state_inputs, state_policy_id, state_reference_asset_name)
  trace @"Found the input state reference token"

  // Must find exactly one matching state user token in inputs
  expect [_state_user_input] =
    find_asset_inputs(state_inputs, state_policy_id, state_user_asset_name)
  trace @"Found the input state user token"

  // Previous state should be stored on the datum of the state reference input
  let previous_mint_state = from_datum(state_reference_input.output.datum)

  // If the state data contains a validity_window 
  // then check that this transactions validity_range is within that window
  // There has to be a prettier way to write this more like an assert
  expect
    when previous_mint_state.validity_window is {
      Some(validity_window) ->
        intersection(validity_window, validity_range) == validity_window
      None -> True
    }
  previous_mint_state
}

/// Validates the state token is output with the correct datum to the correct address 
/// Additionaly validates the reference tokens are set to correct script address, if it is set.
/// It doesn't bother to check the datum of each output right now though it could but that feels like overkill.
fn validate_outputs(
  transaction: Transaction,
  policy_id: PolicyId,
  state_mint_policy_id: PolicyId,
  previous_mint_state: MintState,
  updated_token_count: Int,
  updated_minted_royalty: Bool,
) -> Bool {
  let Transaction { outputs, .. } = transaction

  // Must be exactly one reference token output
  expect [reference_token_output] =
    find_asset_outputs(outputs, policy_id, state_reference_asset_name)
  trace @"Found state reference token utxo in outputs"

  // Verify reference token outputs to this script or back to its minting script
  expect or {
      reference_token_output.address == from_script(policy_id),
      reference_token_output.address == from_script(state_mint_policy_id),
    }
  trace @"Verified reference token is output to a valid address"

  // Grab the mint state from the datum
  let updated_mint_state = from_datum(reference_token_output.datum)

  expect and {
      previous_mint_state.max_tokens == updated_mint_state.max_tokens,
      previous_mint_state.validity_window == updated_mint_state.validity_window,
      previous_mint_state.reference_token_output_policy_id == updated_mint_state.reference_token_output_policy_id,
      updated_token_count == updated_mint_state.tokens,
      updated_minted_royalty == updated_mint_state.has_minted_royalty,
    }
  trace @"Verified mint state datum is updated to correct count"

  // If the reference_token_output_policy_id is set then validate all reference tokens are sent to that script address
  // TODO: (maybe) Check the datum of each reference output contains the CIP-68 100/222 data.
  when previous_mint_state.reference_token_output_policy_id is {
    Some(output_policy_id) -> {
      let output_address = from_script(output_policy_id)
      let reference_outputs =
        find_outputs_by_label(outputs, policy_id, reference_token_label)
      list.all(
        reference_outputs,
        fn(output) { output.address == output_address },
      )
    }
    None -> True
  }
}
