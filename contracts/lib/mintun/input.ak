//// Utils for searching through inputs for various use cases.

use aiken/dict
use aiken/list
use aiken/option
use aiken/transaction.{Input}
use aiken/transaction/value.{AssetName, PolicyId}

/// Find all inputs that include the given asset name
pub fn find_by_asset(
  self: List<Input>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> List<Input> {
  trace @"Finding inputs by asset name"
  list.filter(
    self,
    fn(input) {
      value.quantity_of(input.output.value, policy_id, asset_name) > 0
    },
  )
}

/// Find all policies that matches the given asset name and have quantity > 0
pub fn find_policies(self: List<Input>, asset_name: AssetName) -> List<PolicyId> {
  list.flat_map(
    self,
    fn(input) {
      value.flatten_with(
        input.output.value,
        fn(policy_id, name, quantity) {
          if name == asset_name && quantity > 0 {
            Some(policy_id)
          } else {
            None
          }
        },
      )
    },
  )
}

/// Searches given inputs for a specific NFT. Because it is an 
/// NFT there should only be one in all of the inputs.  If this
/// is not the case or none are found then this returns None.
pub fn find_nft(
  self: List<Input>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> Option<Input> {
  trace @"Finding NFT by unit"
  let matches =
    list.filter(
      self,
      fn(input) {
        value.quantity_of(input.output.value, policy_id, asset_name) == 1
      },
    )

  // Must be exactly one match otherwise no input is returned
  when matches is {
    [input] -> Some(input)
    _ -> None
  }
}

/// Check if the given input list has specified NFT. It will be false if 
/// anything other than exactly 1 input with exactly 1 quantity is found.
pub fn has_nft(
  self: List<Input>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> Bool {
  let input = find_nft(self, policy_id, asset_name)
  option.is_some(input)
}

/// Match all inputs that include a token with the given policy_id, if any.
pub fn match_policy(self: List<Input>, policy_id: ByteArray) -> List<Input> {
  trace @"Finding asset inputs"
  list.filter(
    self,
    fn(input) {
      value.tokens(input.output.value, policy_id)
        |> dict.is_empty()
        |> not()
    },
  )
}
