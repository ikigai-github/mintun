use aiken/transaction/value.{PolicyId}

/// Spending validator that doesn't allow spends.
/// It is parameterized by a policy id to give it a unique script address
validator(_mint_policy_id: PolicyId) {
  fn spend(_datum, _redeemer, _context) {
    False
  }
}
