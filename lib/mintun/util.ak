use aiken/dict.{Dict, insert_with, is_empty}
use aiken/list.{filter}
use aiken/transaction.{Input, Output}
use aiken/transaction/value.{AssetName, PolicyId, quantity_of, tokens}

/// Find all outputs that include the given policy_id and asset name, if any. 
pub fn find_asset_outputs(
  outputs: List<Output>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> List<Output> {
  trace @"Finding asset outputs"
  filter(
    outputs,
    fn(output) { quantity_of(output.value, policy_id, asset_name) > 0 },
  )
}

/// Find all inputs that include the given asset name
pub fn find_asset_inputs(
  inputs: List<Input>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> List<Input> {
  trace @"Finding asset outputs"
  filter(
    inputs,
    fn(input) { quantity_of(input.output.value, policy_id, asset_name) > 0 },
  )
}

/// Find all inputs that include a token with the given policy_id, if any.
pub fn find_policy_inputs(
  inputs: List<Input>,
  policy_id: ByteArray,
) -> List<Input> {
  trace @"Finding asset inputs"
  filter(
    inputs,
    fn(input) {
      tokens(input.output.value, policy_id)
        |> is_empty()
        |> not()
    },
  )
}

/// Insert that fails if a key already exists rather than overrides
pub fn insert_unique(
  self: Dict<key, value>,
  key: key,
  value: value,
  compare: fn(key, key) -> Ordering,
) -> Dict<key, value> {
  insert_with(self, key, value, fn(_, _, _) { fail }, compare)
}
