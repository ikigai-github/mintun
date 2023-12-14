use aiken/interval.{Interval}
use aiken/time.{PosixTime}
use aiken/transaction.{Datum, InlineDatum}
use aiken/transaction/value.{PolicyId}
use mintun/mint/cip68.{ReferenceToken}

/// Mint State token name and datum used by stateful minting contracts to track mint count
/// (100)state reference token asset name
pub const state_reference_asset_name = #"000643b07374617465"

/// (111)state user token asset name
/// Picked 111 to indicate non-standard user token (vs 222, 444, 333, 500)
pub const state_user_asset_name = #"0006f0a07374617465"

/// State datum used by non-oneshot NFT minting policies to configure the contract and track mints.
/// max tokens - If set the contract must enforce a limited number of tokens be minted
/// valid - If set the contract must enforce minting only occurs inside the valid time window
/// tokens - A count of tokens minted minus any burned. Contract must ensure count is always updated correctly.
/// has_minted_royalty - A flag indicating if royalty was minted for the collection.
pub type MintState {
  max_tokens: Option<Int>,
  validity_window: Option<Interval<PosixTime>>,
  reference_token_output_policy_id: Option<PolicyId>,
  tokens: Int,
  has_minted_royalty: Bool,
}

/// Assures the datum is inline cip-68 reference token shape.
/// Then it takes the metadata of the reference token datum and assures it matches MintState shape. 
/// Finally, if all is well, it returns the mint state.
pub fn from_datum(datum: Datum) {
  expect InlineDatum(maybe_reference_token_data) = datum
  trace @"Found data on reference token output datum"

  expect reference_token_data: ReferenceToken = maybe_reference_token_data
  trace @"Reference token data matches reference token shape"

  expect mint_state_data: MintState = reference_token_data.metadata
  trace @"Metadata on reference token data matches mint state shape"

  mint_state_data
}
