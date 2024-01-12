use aiken/dict
use aiken/transaction.{ScriptContext, Spend}
use aiken/transaction/value.{PolicyId}

/// Validator that doesn't allow spend of tokens with the given minting policy
validator(mint_policy_id: PolicyId) {
  fn spend(_datum, _redeemer, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    expect Spend(output_reference) = purpose
    expect Some(info_input) =
      transaction.find_input(transaction.inputs, output_reference)

    // Don't allow spending of any tokens from the minting policy
    // Anything else we don't care about
    info_input.output.value |> value.tokens(mint_policy_id) |> dict.is_empty()
  }
}
