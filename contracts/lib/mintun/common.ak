//// More like uncategorized but common are just utils that don't logically group with any other utils.

use aiken/dict.{Dict}
use aiken/interval.{Interval}
use aiken/time.{PosixTime}

/// Dict insert that fails if a key already exists rather than overrides
pub fn insert_unique(
  self: Dict<key, value>,
  key: key,
  value: value,
  compare: fn(key, key) -> Ordering,
) -> Dict<key, value> {
  dict.insert_with(self, key, value, fn(_, _, _) { fail }, compare)
}

/// If there is contract validity range then this function checks 
/// that the transaction validity range is completely contained within the contract validity window.
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

/// Debug utility function converts a bool to a string
pub fn bool_to_string(value: Bool) {
  if value {
    @"True"
  } else {
    @"False"
  }
}
