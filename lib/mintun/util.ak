use aiken/bytearray
use aiken/dict.{Dict}
use aiken/interval.{Interval}
use aiken/list
use aiken/option
use aiken/time.{PosixTime}
use aiken/transaction.{
  Datum, DatumHash, InlineDatum, Input, NoDatum, Output, Transaction,
}
use aiken/transaction/value.{AssetName, PolicyId}

/// Find all outputs that include the given policy_id and asset name, if any. 
pub fn find_asset_outputs(
  outputs: List<Output>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> List<Output> {
  trace @"Finding asset outputs"
  list.filter(
    outputs,
    fn(output) { value.quantity_of(output.value, policy_id, asset_name) > 0 },
  )
}

/// Find outputs that contain assets with the given policy_id and asset name label
pub fn find_outputs_by_label(
  outputs: List<Output>,
  policy_id: PolicyId,
  label: ByteArray,
) -> List<Output> {
  trace @"Finding asset outputs"
  list.filter(
    outputs,
    fn(output) {
      value.tokens(output.value, policy_id)
        |> dict.keys()
        |> list.find(fn(asset_name) { bytearray.take(asset_name, 4) == label })
        |> option.is_some()
    },
  )
}

/// Find all inputs that include the given asset name
pub fn find_asset_inputs(
  inputs: List<Input>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> List<Input> {
  trace @"Finding asset outputs"
  list.filter(
    inputs,
    fn(input) {
      value.quantity_of(input.output.value, policy_id, asset_name) > 0
    },
  )
}

/// Find all inputs that include a token with the given policy_id, if any.
pub fn find_policy_inputs(
  inputs: List<Input>,
  policy_id: ByteArray,
) -> List<Input> {
  trace @"Finding asset inputs"
  list.filter(
    inputs,
    fn(input) {
      value.tokens(input.output.value, policy_id)
        |> dict.is_empty()
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
  dict.insert_with(self, key, value, fn(_, _, _) { fail }, compare)
}

/// If there is contract validity range then this function checks 
/// that the transaction valditity range is completely contained within the contract validity window.
pub fn tx_in_interval(
  tx_validity_range: Interval<PosixTime>,
  maybe_contract_validity_range: Option<Interval<PosixTime>>,
) {
  when maybe_contract_validity_range is {
    Some(contract_validity_range) ->
      interval.intersection(contract_validity_range, tx_validity_range) == contract_validity_range
    None -> True
  }
}

/// Get data from datum handling case
pub fn get_data(tx: Transaction, datum: Datum) -> Data {
  when datum is {
    NoDatum -> fail
    DatumHash(hash) -> {
      expect Some(data) = dict.get(tx.datums, hash)
      data
    }
    InlineDatum(data) -> data
  }
}
