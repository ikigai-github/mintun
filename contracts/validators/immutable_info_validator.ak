use aiken/transaction.{ScriptContext, Spend}
use aiken/transaction/value.{PolicyId}
use mintun/collection

/// Currently just locks the info token and doesn't let it be spent.  
/// Alows spending of anything else that happens to have landed at this script address.
validator(mint_policy_id: PolicyId) {
  fn spend(_datum, _redeemer, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    expect Spend(output_reference) = purpose
    expect Some(info_input) =
      transaction.find_input(transaction.inputs, output_reference)

    // Don't allow collection info token to be spent. Anything else we don't care about.
    value.quantity_of(
      info_input.output.value,
      mint_policy_id,
      collection.reference_asset_name,
    ) == 0
  }
}
