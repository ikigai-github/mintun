use aiken/list
use aiken/transaction.{Output}
use aiken/transaction/value

/// Find all outputs that include the given policy_id and asset name, if any. 
pub fn find_asset_outputs(
  outputs: List<Output>,
  policy_id: ByteArray,
  asset_name: ByteArray,
) -> List<Output> {
  trace @"Finding asset outputs"
  list.filter(
    outputs,
    fn(output) { value.quantity_of(output.value, policy_id, asset_name) > 0 },
  )
}
