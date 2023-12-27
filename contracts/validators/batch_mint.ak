use aiken/bytearray
use aiken/dict
use aiken/list
use aiken/transaction.{Input, Mint, OutputReference, ScriptContext, Transaction}
use aiken/transaction/credential.{ScriptCredential}
use aiken/transaction/value.{PolicyId}
use mintun/cip68
use mintun/collection.{CollectionName, CollectionState}
use mintun/input as in
use mintun/output as out

/// The redeemer indicates if this is a mint or the genesis transaction.  The genesis transaction
/// must spend the seed UTxO to guarantee it can only be called once.
type MintRedeemer {
  Genesis { validator_policy_id: PolicyId }
  BatchMint
}

validator(seed: OutputReference) {
  /// Minting policy validates minted tokens are named in CIP-68 format and output to correct addresses
  /// We could also enforce constraints on datum shape but that may be overkill
  fn mint(redeemer: MintRedeemer, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context
    expect Mint(mint_policy_id) = purpose
    trace @"Begin minting policy validation"

    when redeemer is {
      Genesis(validator_policy_id) ->
        validate_genesis(seed, transaction, mint_policy_id, validator_policy_id)
      BatchMint -> validate_batch_mint(transaction, mint_policy_id)
    }
  }
}

/// This function checks that the seed UTxO is spent, the minimum required state and user token are generated, 
/// and the initial state is valid.
fn validate_genesis(
  seed: OutputReference,
  transaction: Transaction,
  mint_policy_id: PolicyId,
  validator_policy_id: PolicyId,
) -> Bool {
  let Transaction { inputs, outputs, .. } = transaction
  trace @"Genesis: checking seed UTxO is spent"
  expect Some(_spent_utxo) = transaction.find_input(inputs, seed)
  let assets = value.from_minted_value(transaction.mint)

  // Must be exactly one (111)State token minted
  let mints_user_token =
    value.quantity_of(assets, mint_policy_id, collection.owner_asset_name) == 1

  // Must be exactly one (100)State token minted
  let mints_reference_token =
    value.quantity_of(assets, mint_policy_id, collection.reference_asset_name) == 1

  // There are a couple other tokens that could have been minted and could be validated probably just 
  //  - (500)Royalty - CIP-102 royalty token - could just verify datum shape matches spec
  //  - (null) - token for CIP-27 - Could make sure it is the 0th token in the mint
  trace @"Genesis: finding reference token output"
  // There must be exactly one output for the reference token.
  // Note: NOT using `transacton.find_script_outputs()` here because we don't know the policy id of the spending validator
  // Note: Could parameterize with state_policy_id but just kicking the can since the paramaterization happens while constructing genesis tx.
  expect [reference_token_output] =
    out.find_by_asset(outputs, mint_policy_id, collection.reference_asset_name)

  // Confirm the datum matches the mint state structure 
  let collection_state =
    collection.from_datum(transaction, reference_token_output.datum)

  // Must send the reference token to the state validator
  let reference_token_sent_to_validator =
    ScriptCredential(validator_policy_id) == reference_token_output.address.payment_credential

  // Must be in a valid inital state 
  let valid_initial_state =
    collection_state.current_nfts == 0 && collection_state.next_sequence == 0
  and {
    mints_reference_token?,
    mints_user_token?,
    reference_token_sent_to_validator?,
    valid_initial_state?,
  }
}

/// This function sorts through the minted tokens to pair user and reference tokens.  
/// Then for each pair it validates they are labelled with CIP-68 standard 100 and 222. 
fn validate_batch_mint(transaction: Transaction, mint_policy_id: PolicyId) {
  let Transaction { mint, inputs, .. } = transaction

  // Make sure the (111)Collection token is spent in the inputs 
  expect in.has_nft(inputs, mint_policy_id, collection.owner_asset_name)
  // Make sure the (100)Collection token is spent in the inputs
  expect Some(reference_input) =
    in.find_nft(inputs, mint_policy_id, collection.reference_asset_name)

  // Get the next_sequence number from input collection state the validator takes care of making sure it is updated properly
  let CollectionState { next_sequence, .. } =
    collection.from_datum(transaction, reference_input.output.datum)

  // Sort so we end up with a list like [100A, 100B, 222A, 222B]
  let assets =
    value.from_minted_value(mint)
      |> value.tokens(mint_policy_id)
      |> dict.to_list()
      |> list.sort(fn(l, r) { bytearray.compare(l.1st, r.1st) })

  let num_assets = list.length(assets)
  let mints_at_least_one_nft = num_assets > 1

  // Sanity check we are actually minting something
  expect mints_at_least_one_nft?
  // Group up the tokens into tuple pairs: [100A, 100B, 222A, 222B] -> [(100A, 222A), (100B, 222B)]
  let asset_spans = list.span(assets, num_assets / 2)
  let groups = list.zip(asset_spans.1st, asset_spans.2nd)

  // Make sure each pair has tokens matching the patterns:
  // (100)(sequence)(contentname) and (222)(sequence)(contentname) 
  validate_mint_recursive(groups, next_sequence)
}

/// This function takes the first pair in the list and validates it match CIP-68 spec. 
/// Then it recursively calls itself with the remainder of the list until every mint pair has been validated.
fn validate_mint_recursive(
  mint: List<((ByteArray, Int), (ByteArray, Int))>,
  sequence: Int,
) {
  when mint is {
    [(reference_token_asset, user_token_asset), ..rest] -> {
      let reference_token_name =
        collection.parse_name(reference_token_asset.1st)
      let user_token_name = collection.parse_name(user_token_asset.1st)

      expect and {
          reference_token_name.label == cip68.reference_token_label,
          user_token_name.label == cip68.nft_user_token_label,
          reference_token_name.sequence == sequence,
          reference_token_name.sequence == user_token_name.sequence,
          reference_token_name.content == user_token_name.content,
          reference_token_asset.2nd == user_token_asset.2nd,
          or {
            reference_token_asset.2nd == 1,
            reference_token_asset.2nd == -1,
          },
        }
      // Could check the datum shape of the reference token here but will leave that offchain for now
      trace @"Label and quantity matches for this NFT"

      // Increment sequence if this was not a burn
      let next_sequence =
        if reference_token_asset.2nd == 1 {
          sequence + 1
        } else {
          sequence
        }
      validate_mint_recursive(rest, next_sequence)
    }
    [] -> True
  }
}
