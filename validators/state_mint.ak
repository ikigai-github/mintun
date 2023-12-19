use aiken/bytearray
use aiken/string
use aiken/transaction.{
  Mint, OutputReference, ScriptContext, Transaction, find_input,
}
use aiken/transaction/credential.{ScriptCredential, from_script}
use aiken/transaction/value.{from_minted_value, quantity_of}
use mintun/mint/state.{
  MintState, from_datum, state_reference_asset_name, state_user_asset_name,
}
use mintun/util.{find_asset_outputs}

/// This minting policy is for creating a CIP-68 user token and reference token to store the state of a batch minting policy
validator(utxo_reference: OutputReference) {
  fn state(_, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    // The purpose of this contract is minting (and burning)
    expect Mint(policy_id) = purpose
    trace string.concat(@"Minting Policy is ", bytearray.to_hex(policy_id))

    let Transaction { inputs, outputs, mint, .. } = transaction

    // Grab the minted assets in Value form since MintedValue is kinda deprectaed
    let assets = from_minted_value(mint)

    // Count how many reference tokens are minted/burned
    let reference_token_amount =
      quantity_of(assets, policy_id, state_reference_asset_name)
    trace string.concat(
      @"Reference token quantity is ",
      string.from_int(reference_token_amount),
    )

    // Count how many user tokens are minted/burned
    let user_token_amount =
      quantity_of(assets, policy_id, state_user_asset_name)
    trace string.concat(
      @"User token quantity is ",
      string.from_int(reference_token_amount),
    )

    expect reference_token_amount == user_token_amount
    trace @"Confirmed reference token and user token mint quantities match"

    when reference_token_amount is {
      // Minting the token
      1 -> {
        // Must include the reference utxo in input to make this a one-shot policy
        expect Some(_spent_utxo) = find_input(inputs, utxo_reference)
        trace @"Confirmed this tx spends the reference utxo (makes this a one-shot)"

        // There must be exactly one output for the reference token
        expect [reference_token_output] =
          find_asset_outputs(outputs, policy_id, state_reference_asset_name)
        trace @"Found utxo with reference token in outputs"

        // Grab the mint state from the datum
        let mint_state = from_datum(transaction, reference_token_output.datum)

        trace string.concat(
          @"State policy id is ",
          bytearray.to_hex(mint_state.state_policy_id),
        )

        expect ScriptCredential(state_policy_id) =
          reference_token_output.address.payment_credential

        expect state_policy_id == mint_state.state_policy_id
        trace @"Confirmed reference token is sent to state spending validator"

        and {
          user_token_amount == 1,
          mint_state.tokens == 0,
          mint_state.has_minted_royalty == False,
        }
      }
      -1 -> True
      _invalid_token_quantity -> False
    }
  }
}
