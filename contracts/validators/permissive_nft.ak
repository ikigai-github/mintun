use aiken/transaction.{ScriptContext, Spend}
use aiken/transaction/value.{PolicyId}
use mintun/cip68
use mintun/collection
use mintun/input as in
use mintun/output as out

/// Validator that allows holder of collection management token to modify the datum of an NFT.
/// It fully permissive meaning they could modify the datum to anything. 
/// The only requirement is that the reference token stays at the validator address.
validator(mint_policy_id: PolicyId) {
  fn spend(_datum, _redeemer, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    expect Spend(output_reference) = purpose
    expect Some(spent_utxo_input) =
      transaction.find_input(transaction.inputs, output_reference)

    let spends_owner_token =
      in.has_nft(
        transaction.inputs,
        mint_policy_id,
        collection.owner_asset_name,
      )

    // Should only be one reference token from the policy in th transaction
    expect [spent_utxo_output] =
      out.match_label(
        transaction.outputs,
        mint_policy_id,
        cip68.reference_token_label,
      )

    let spends_back_to_validator =
      spent_utxo_input.output.address == spent_utxo_output.address

    and {
      spends_owner_token?,
      spends_back_to_validator?,
    }
  }
}
