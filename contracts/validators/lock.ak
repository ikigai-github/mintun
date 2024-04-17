use aiken/transaction/value.{PolicyId}

/// This is parameterized by a policy id to give it a unique script address
validator(_mint_policy_id: PolicyId) {
  /// A spending validator that locks all assets at its address.
  fn spend(_datum, _redeemer, _context) {
    False
  }
}
