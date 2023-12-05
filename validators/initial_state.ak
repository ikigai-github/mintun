
use aiken/transaction.{OutputReference, ScriptContext}
// Plan: 
// * Mint two tokens a state token and an owner token.  (preferrable CIP-67 style)
// * One-Shot by UTXO reference
// * Support burning the state token to close out a minting policy early
// Future Feature:
// * Make the owner token more useful by making it prove ownership of a collection.
// Note: This is only for policies that are multiple mints. One shots are simpler.
 
// UTXO to make the validator unique and a one-shot
validator(utxo_reference: OutputReference) {
  fn initial_state(_redeemer: Redeemer, context: ScriptContext) -> {
    let ScriptContext { transaction, purpose } = context
    let Transaction { inputs, outputs, mint, .. } = transaction

    // Must spend the reference utxo

    expect Mint(policy_id) = purpose

    // Must mint a state token
    let token_name = "MINT_STATE";

    // Must mint an owner token


    // State token datum must be inline
    // State token datum must match MintState shape
    // State token datum must be in initial state (0 mints, 0 transactions)
  }
}
