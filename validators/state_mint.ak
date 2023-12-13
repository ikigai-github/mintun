use aiken/transaction.{
  Mint, OutputReference, ScriptContext, Transaction, find_input,
}
use aiken/transaction/value.{from_minted_value, quantity_of}
use mintun/util.{find_asset_outputs}
use mintun/mint/state.{
  MintState, from_datum, state_reference_asset_name, state_user_asset_name,
}

/// This minting policy is for creating a CIP-68 user token and reference token to store the state of a minting policy
validator(utxo_reference: OutputReference) {
  fn state(_, context: ScriptContext) {
    trace @"state_mint start"
    let ScriptContext { transaction, purpose } = context

    // The purpose of this contract is minting (and burning)
    expect Mint(policy_id) = purpose
    trace @"Confirmed purpose is mint|burn"

    let Transaction { inputs, outputs, mint, .. } = transaction

    // Grab the minted assets in Value form since MintedValue is kinda deprectaed
    let assets = from_minted_value(mint)

    // TODO: Don't allow sneaky pre-created tokens in the inputs? Seems like overkill since this is already one-shot mint
    // Count how many reference tokens are minted/burned
    let reference_token_amount =
      quantity_of(assets, policy_id, state_reference_asset_name)
    // Count how many user tokens are minted/burned
    let user_token_amount =
      quantity_of(assets, policy_id, state_user_asset_name)

    when reference_token_amount is {
      // Minting the token
      1 -> {
        trace @"Minting reference token, must be a mint."
        // Must include the reference utxo in input to make this a one-shot policy
        expect Some(_spent_utxo) = find_input(inputs, utxo_reference)
        trace @"Confirmed this tx spends the reference utxo"

        // There must be exactly one output for the reference token
        expect [reference_token_output] =
          find_asset_outputs(outputs, policy_id, state_reference_asset_name)
        trace @"Found reference utxo in outputs"

        // Grab the mint state from the datum
        let mint_state = from_datum(reference_token_output.datum)

        // Must also mint a user token and the mint state must be initialized to 0
        and {
          user_token_amount == 1,
          mint_state.tokens == 0,
          mint_state.transactions == 0,
        }
      }
      -1 -> {
        trace @"Burning reference token, must be a burn."

        // In a way the user token is proof of ownership of the collection so maybe in a future edition expand on that idea
        user_token_amount == -1
      }
      _invalid_token_quantity -> False
    }
  }
}
