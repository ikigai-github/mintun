use aiken/bytearray
use aiken/dict
use aiken/interval.{intersection}
use aiken/list
use aiken/transaction.{Mint, ScriptContext, Transaction}
use aiken/transaction/value.{PolicyId, from_minted_value}
use mintun/label.{nft_user_token_label, reference_token_label}
use mintun/mint/cip68.{to_cip68_asset_name}
use mintun/mint/state.{
  MintState, from_datum, state_reference_asset_name, state_user_asset_name,
}
use mintun/util.{find_asset_inputs, find_policy_inputs}

// CIP-68 Time windowed minting policy - Batch mint
//  - Time Windowed can only mint until time X
//  - Can burn anytime 
//  - Must mint two tokens 100 and 222
//  - 500 Token can only be minted once and before all other tokens
//     - Must go to either owner or a script address (spending validator for mutation royalties)
//     - Can only mint on the 0th transaction
//  - 100 token must be output to specific address: 
//     - Same as 222 token (user holds reference)
//     - Script Address (spending validator for mutating reference)
//  - 100 token must have a datum (inline or not)
//  - 100 Datum must structurally match the standard with required fields and matching types for optional
// Initial Data:
//  Total Mints: 0
//  Total Transactions: 0

validator(
  state_mint_policy_id: PolicyId,
  reference_spending_validator_id: Option<PolicyId>,
) {
  fn mint(_, context: ScriptContext) {
    trace @"batch_mint start"
    let ScriptContext { transaction, purpose } = context

    // The purpose of this contract is minting (and burning)
    expect Mint(policy_id) = purpose
    trace @"Confirmed purpose is mint|burn"

    // Make sure we have the requisite input state tokens and grab previous state
    let previous_mint_state =
      validate_state_input(state_mint_policy_id, transaction)

    // Validate the minted assets match requirements
    let new_token_count =
      validate_mints(transaction, policy_id, previous_mint_state.tokens)

    // TODO: Check the new state exactly matches the old state with the updated token count
    // TODO: Make sure there reference token is either returned to this address or going to the burn of the state mint policy
    False
  }
}

fn validate_mints(
  transaction: Transaction,
  policy_id: PolicyId,
  previous_token_count: Int,
) {
  // Need to increment the token count not sure if a closure type thing can work here
  //let token_count = token_count + referenceAsset.2nd
  let Transaction { mint, .. } = transaction

  let assets =
    from_minted_value(mint)
      |> value.tokens(policy_id)
      |> dict.to_list()
      |> list.sort(fn(l, r) { bytearray.compare(l.1st, r.1st) })

  let token_count = previous_token_count

  // If we only allow exlusively mints or burns in a transaction then this count is easily computed as: previoust_token_count + num_tokens / 2
  let num_assets = list.length(assets)

  expect num_assets % 2 == 0
  let asset_partition = list.span(assets, num_assets / 2)
  let groups = list.zip(asset_partition.1st, asset_partition.2nd)

  validate_mint_recursive(groups, previous_token_count)
}

fn validate_mint_recursive(
  mint: List<((ByteArray, Int), (ByteArray, Int))>,
  sum: Int,
) {
  when mint is {
    [(reference_token_asset, user_token_asset), ..rest] -> {
      let reference_token_name = to_cip68_asset_name(reference_token_asset.1st)
      let user_token_name = to_cip68_asset_name(user_token_asset.1st)

      expect
        reference_token_name.label == reference_token_label && user_token_name.label == nft_user_token_label && reference_token_name.name == user_token_name.name && reference_token_asset.2nd == user_token_asset.2nd && (
          reference_token_asset.2nd == 1 || reference_token_asset.2nd == -1
        )
      validate_mint_recursive(rest, sum) + reference_token_asset.2nd
    }
    [] -> sum
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
