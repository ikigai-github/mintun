use aiken/interval.{Interval}
use aiken/time.{PosixTime}
use aiken/transaction.{Datum, Input, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{PolicyId}
use mintun/mint/cip68.{ReferenceToken}
use mintun/util.{find_asset_inputs, find_policy_inputs, get_data}

/// Mint State token name and datum used by stateful minting contracts to track mint count
/// (100)state reference token asset name
pub const state_reference_asset_name = #"000643b07374617465"

/// (111)state user token asset name
/// Picked 111 to indicate non-standard user token (vs 222, 444, 333, 500)
pub const state_user_asset_name = #"0006f0a07374617465"

/// State datum used by batch minting policy to configure the contract and track mints.
/// max tokens - If set the contract must enforce a limited number of tokens be minted
/// validity_range - If set the contract must enforce minting only occurs inside the valid time window
/// reference_address - If set the address reference tokens are required to be sent to 
/// refernce_policy_id - The spending validator that should hold minted NFT reference token, if set.
/// state_policy_id - The spending validator that holds the state reference token
/// mint_policy_id - The minting policy that will mint NFTs using this state config
/// tokens - A count of tokens minted minus any burned. Contract must ensure count is always updated correctly.
/// has_minted_royalty - A flag indicating if royalty was minted for the collection.
pub type MintState {
  max_tokens: Option<Int>,
  validity_range: Option<Interval<PosixTime>>,
  reference_address: Option<Address>,
  state_policy_id: PolicyId,
  mint_policy_id: PolicyId,
  tokens: Int,
  has_minted_royalty: Bool,
}

/// Assures the datum is inline cip-68 reference token shape.
/// Then it takes the metadata of the reference token datum and assures it matches MintState shape. 
/// Finally, if all is well, it returns the mint state.
pub fn from_datum(transaction: Transaction, datum: Datum) {
  let maybe_reference_token_data = get_data(transaction, datum)
  trace @"Found data on reference token output datum"

  expect reference_token_data: ReferenceToken = maybe_reference_token_data
  trace @"Reference token data matches reference token shape"

  expect mint_state_data: MintState = reference_token_data.metadata
  trace @"Metadata on reference token data matches mint state shape"

  mint_state_data
}

pub fn find_state_inputs(inputs: List<Input>, state_policy_id: PolicyId) {
  let state_inputs = find_policy_inputs(inputs, state_policy_id)

  // Must find exactly one matching state reference token in inputs
  expect [state_reference_input] =
    find_asset_inputs(state_inputs, state_policy_id, state_reference_asset_name)
  trace @"Found the input state reference token"

  // Must find exactly one matching state user token in inputs
  expect [state_user_input] =
    find_asset_inputs(state_inputs, state_policy_id, state_user_asset_name)
  trace @"Found the input state user token"

  (state_user_input, state_reference_input)
}
