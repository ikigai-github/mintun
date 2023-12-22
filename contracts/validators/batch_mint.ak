use aiken/bytearray
use aiken/dict
use aiken/list
use aiken/transaction.{Mint, ScriptContext, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{PolicyId, from_minted_value}
use mintun/cip68.{
  nft_user_token_label, reference_token_label, to_cip68_asset_name,
}
use mintun/state.{MintState, find_state_inputs, from_datum}
use mintun/util.{find_outputs_by_label}

/// This minting policy is parameterized by the policy id of the state mint token which generates the initial state of the mint.
/// It expects a user token be supplied to authorize a mint.  It also requires the reference token which will update state respectively.
validator(state_mint_policy_id: PolicyId) {
  fn mint(_, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    // The purpose of this contract is minting (and burning)
    expect Mint(policy_id) = purpose
    trace @"Confirmed purpose is mint|burn"

    // Find the state inputs which is always the user token and the reference token
    let (_, state_reference_input) =
      find_state_inputs(transaction.inputs, state_mint_policy_id)

    // State should be stored on the datum of the state reference input
    let state = from_datum(transaction, state_reference_input.output.datum)

    // Check mints are all pairs of user/reference tokens and reference tokens go to
    // the reference address
    and {
      validate_mints(transaction, policy_id),
      validate_outputs(transaction, policy_id, state.reference_address),
    }
  }
}

/// This function sorts through the minted tokens to pair user and reference tokens.  
/// Then for each pair it validates they are labelled with CIP-68 standard 100 and 222. 
fn validate_mints(transaction: Transaction, policy_id: PolicyId) {
  let Transaction { mint, .. } = transaction

  // TODO: Don't allow duplicate asset names 
  //  Can enforce across multiple calls if we have a monotonically increasing value in the state that is 
  //  required to be part of the asset names to ensure the same asset name never shows up twice
  let assets =
    from_minted_value(mint)
      |> value.tokens(policy_id)
      |> dict.to_list()
      |> list.sort(fn(l, r) { bytearray.compare(l.1st, r.1st) })

  let num_assets = list.length(assets)
  let asset_spans = list.span(assets, num_assets / 2)
  let groups = list.zip(asset_spans.1st, asset_spans.2nd)

  validate_mint_recursive(groups)
}

/// This function takes the first pair in the list and validates it match CIP-68 spec. 
/// Then it recursively calls itself with the remainder of the list until every mint pair has been validated.
fn validate_mint_recursive(mint: List<((ByteArray, Int), (ByteArray, Int))>) {
  when mint is {
    [(reference_token_asset, user_token_asset), ..rest] -> {
      let reference_token_name = to_cip68_asset_name(reference_token_asset.1st)
      let user_token_name = to_cip68_asset_name(user_token_asset.1st)

      expect and {
          reference_token_name.label == reference_token_label,
          user_token_name.label == nft_user_token_label,
          reference_token_name.name == user_token_name.name,
          reference_token_asset.2nd == user_token_asset.2nd,
          or {
            reference_token_asset.2nd == 1,
            reference_token_asset.2nd == -1,
          },
        }
      trace @"Label and quantity matches for this NFT"

      validate_mint_recursive(rest)
    }

    [] -> True
  }
}

/// Additionaly validates the reference tokens are set to correct script address, if it is set.
/// It doesn't bother to check the datum of each output right now though it could but that feels like overkill.
fn validate_outputs(
  transaction: Transaction,
  mint_policy_id: PolicyId,
  mabye_reference_address: Option<Address>,
) -> Bool {
  when mabye_reference_address is {
    Some(reference_address) ->
      find_outputs_by_label(
        transaction.outputs,
        mint_policy_id,
        reference_token_label,
      )
        |> list.all(fn(output) { output.address == reference_address })
    None -> True
  }
}
