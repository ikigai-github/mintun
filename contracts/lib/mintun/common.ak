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

/// If there is a container range this function checks that contained range is completely within that range.
pub fn time_contains(
  contained_range: Interval<PosixTime>,
  maybe_container_range: Option<Interval<PosixTime>>,
) {
  when maybe_container_range is {
    Some(container_range) ->
      interval.intersection(container_range, contained_range) == container_range
    None -> True
  }
}
