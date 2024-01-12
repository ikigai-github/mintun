use aiken/bytearray
use aiken/dict
use aiken/list
use aiken/option
use aiken/transaction.{Input, Mint, Output, OutputReference, ScriptContext, Transaction}
use aiken/transaction/value.{MintedValue, PolicyId}
use mintun/cip102
use mintun/cip68
use mintun/collection.{CollectionName, CollectionState, NFT}
use mintun/input as in
use mintun/output as out

/// The redeemer indicates if this is a genesis transaction, mint, or burn.  
type Endpoint {
  /// The genesis transaction must spend the seed UTxO to guarantee it can only be called once.
  EndpointGenesis {
    state_validator_policy_id: PolicyId,
    info_validator_policy_id: PolicyId,
  }
  /// Indicates will mint one or more (222, 100) token pairs
  EndpointMint
  /// Indicates will burn one or more tokens under policy
  EndpointBurn
}

/// Seed is used to make genesis transaction a one-shot
validator(seed: OutputReference) {
  /// Minting policy validates minted tokens are named in CIP-68 format and output to correct addresses
  /// We could also enforce constraints on datum shape but that may be overkill
  fn mint(endpoint: Endpoint, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context
    expect Mint(mint_policy_id) = purpose
    trace @"Begin minting policy validation"

    // Branch evaluation based on endpoint being called
    when endpoint is {
      EndpointGenesis(state_validator_policy_id, info_validator_policy_id) ->
        validate_genesis(
          seed,
          transaction,
          mint_policy_id,
          state_validator_policy_id,
          info_validator_policy_id,
        )
      EndpointMint -> validate_mint(transaction, mint_policy_id)
      EndpointBurn -> validate_burn(transaction, mint_policy_id)
    }
  }
}

/// Verifies that the seed UTxO is spent.
/// Verifies the minimum required state and user token are generated.
/// Verifies the initial collection state is valid
fn validate_genesis(
  seed: OutputReference,
  tx: Transaction,
  mint_policy_id: PolicyId,
  state_validator_policy_id: PolicyId,
  info_validator_policy_id: PolicyId,
) -> Bool {
  let Transaction { inputs, outputs, mint, .. } = tx
  trace @"Genesis: checking seed UTxO is spent"

  expect Some(_spent_utxo) = transaction.find_input(inputs, seed)
  let tokens = mint |> value.from_minted_value() |> value.tokens(mint_policy_id)
  // Must be exactly one (111)(Management)Collection owner token minted
  expect Some(owner_token_quantity) =
    dict.get(tokens, collection.owner_asset_name)
  let mints_owner_token = owner_token_quantity == 1

  // Must be exactly one (100)(Managment)Collection reference token minted
  expect Some(reference_token_quantity) =
    dict.get(tokens, collection.reference_asset_name)
  let mints_reference_token = reference_token_quantity == 1

  // Must be exactly one (600)State token minted
  expect Some(state_token_quantity) =
    dict.get(tokens, collection.state_asset_name)
  let mints_state_token = state_token_quantity == 1

  let cip_27_token_quantity = tokens |> dict.get("") |> option.or_else(0)

  let cip_102_token_quantity =
    tokens |> dict.get(cip102.royalty_token_asset_name) |> option.or_else(0)

  let mints_at_most_one_cip_27_token =
    cip_27_token_quantity == 0 || cip_27_token_quantity == 1

  let mints_at_most_one_cip_102_token =
    cip_102_token_quantity == 0 || cip_102_token_quantity == 1

  let total_expected_mints = 3 + cip_27_token_quantity + cip_102_token_quantity

  // Don't allow minting anything else during genesis besides the state token, management token pair, and royalty tokens
  let only_expected_mints = dict.size(tokens) == total_expected_mints

  let state_token_output =
    get_reference_token_output(
      outputs,
      state_validator_policy_id,
      collection.state_asset_name,
    )

  // Confirm the datum matches the collection state structure 
  let state = collection.state_from_datum(tx, state_token_output.datum)

  // Current NFTs and sequence number must always start at zero 
  let valid_initial_state = state.current_nfts == 0 && state.next_sequence == 0

  let info_token_output =
    get_reference_token_output(
      outputs,
      info_validator_policy_id,
      collection.reference_asset_name,
    )

  // Confirm the datum matches the collection info structure 
  let info = collection.info_from_datum(tx, info_token_output.datum)

  // Mostly just so the structure check doesn't get optimized out actually use it
  let non_empty_name = bytearray.length(info.name) > 0

  // Other collection state can be initialized to any value as far as genesis transaction is concerned.  
  // Bad states could be minted such as a validity_range in the distant past, negative max tokens, force_locked flag set to true.
  // But those will cause the spending validator to fail subsequent transactions. 
  and {
    mints_reference_token?,
    mints_owner_token?,
    mints_state_token?,
    mints_at_most_one_cip_27_token?,
    mints_at_most_one_cip_102_token?,
    only_expected_mints?,
    valid_initial_state?,
    non_empty_name?,
  }
}

/// Searches the output for a reference token.
/// Reference token has it's own datum so it must be in its own output
/// Also constrain nothing else goes to that output with the token.
fn get_reference_token_output(
  outputs: List<Output>,
  validator_policy_id: PolicyId,
  asset_name: ByteArray,
) -> Output {
  // There must be exactly one output UTxO to the reference token address
  expect [token_output] =
    transaction.find_script_outputs(outputs, validator_policy_id)

  // There should be exactly one asset sent to the validator
  expect [(_, output_asset_name, output_asset_quantity)] =
    token_output.value |> value.without_lovelace() |> value.flatten()

  // That one asset sent to the validator must be the reference token of quantity 1
  expect output_asset_name == asset_name && output_asset_quantity == 1

  token_output
}

/// Validates the management user and reference token are spent the returns the reference input
fn validate_witness_input(inputs: List<Input>, mint_policy_id: PolicyId) {
  // Make sure the (111)Collection token is spent in the inputs 
  let spends_owner_token =
    in.has_nft(inputs, mint_policy_id, collection.owner_asset_name)

  expect spends_owner_token?
  // Make sure the (600)Collection token is also spent in the inputs
  in.find_nft(inputs, mint_policy_id, collection.state_asset_name)
}

/// Flattens and groups assets into a list of tuple pairs. 
/// For example, if minting two NFTs one name A and another name B
/// would return [((100A, 1), (222A, 1)), ((100B, 1), (222B, 1))].
/// Any tokens not paired the 222 or 100 labels are returned in the remainder 
fn pair_nfts(mint: MintedValue, mint_policy_id: PolicyId) {
  let (assets, remainder) =
    mint
      |> value.from_minted_value()
      |> value.tokens(mint_policy_id)
      |> dict.to_list()
      |> list.partition(
           fn(asset) {
             cip68.has_label(asset.1st, cip68.reference_token_label) || cip68.has_label(
               asset.1st,
               cip68.nft_user_token_label,
             )
           },
         )

  // Each asset is a pair so the minted assets length should always be even and > 0
  let num_assets = list.length(assets)
  let even_number_assets = num_assets % 2 == 0
  let num_nfts = num_assets / 2
  let mints_at_least_one_nft = num_nfts > 0
  expect even_number_assets && mints_at_least_one_nft?
  // Sort so we end up with a list like [100A, 100B, 222A, 222B]
  // Then up the tokens into tuple pairs: [100A, 100B, 222A, 222B] -> [(100A, 222A), (100B, 222B)]
  let (reference_nfts, user_nfts) =
    assets
      |> list.sort(fn(l, r) { bytearray.compare(l.1st, r.1st) })
      |> list.span(num_nfts)

  // Could also check output datum for the reference_token_asset as below:
  let nfts = list.zip(reference_nfts, user_nfts)

  (nfts, remainder)
}

/// This function sorts through the minted tokens to pair user and reference tokens.  
/// Then for each pair it validates they are labeled with CIP-68 standard 100 and 222. 
fn validate_mint(transaction: Transaction, mint_policy_id: PolicyId) {
  let Transaction { mint, inputs, .. } = transaction

  expect Some(state_input) = validate_witness_input(inputs, mint_policy_id)

  // Get the next_sequence number from state datum. 
  let CollectionState { next_sequence, .. } =
    collection.state_from_datum(transaction, state_input.output.datum)

  // Can only mint (222) and (100) pairs in batch mint any other tokens must be minted during genesis
  let (nfts, remainder) = pair_nfts(mint, mint_policy_id)
  let only_mints_nfts = list.is_empty(remainder)
  expect only_mints_nfts?
  // Make sure each pair has tokens matching the patterns:
  let tokens_valid = validate_mint_recursive(nfts, next_sequence)

  trace @"Checking the datum is valid"
  // Make sure each reference token includes a datum in the 222 shape
  let datums_valid =
    list.all(
      nfts,
      fn(asset) {
        let (asset_name, _quantity) = asset.1st
        expect [reference_token_output] =
          out.find_by_asset(transaction.outputs, mint_policy_id, asset_name)
        let reference_data =
          cip68.from_222_reference_datum(
            transaction,
            reference_token_output.datum,
          )
        // Just need to check something here so the cast above doesn't get optimized out
        reference_data.version > 0
      },
    )
  tokens_valid? && datums_valid?
}

/// This function takes the first pair in the list and validates it matches CIP-68 
/// by validating the pair match the following pattern:
/// (100)(purpose)(sequence)(content) and (222)(purpose)(sequence)(content) 
/// (purpose)(sequence)(content) of be the same for both tokens
/// Purpose should always be 0x01 (Nft) for NFT mints
/// The 3 byte sequence number match the value of `sequence` argument passed to the function
/// Recursively calls this function with the remainder of the list with sequence incremented by 1
/// Returns true if this and all recursively called validates return true
fn validate_mint_recursive(
  nfts: List<((ByteArray, Int), (ByteArray, Int))>,
  sequence: Int,
) {
  when nfts is {
    [(reference_token_asset, user_token_asset), ..rest] -> {
      let reference_token_name =
        collection.parse_name(reference_token_asset.1st)
      let user_token_name = collection.parse_name(user_token_asset.1st)

      // Just for traceability we pull these each into a bool
      let mints_single_reference_token = reference_token_asset.2nd == 1
      let reference_token_has_valid_label =
        reference_token_name.label == cip68.reference_token_label
      let reference_token_has_valid_sequence =
        reference_token_name.sequence == sequence
      let reference_token_purpose_is_nft = reference_token_name.purpose == NFT
      let user_token_has_valid_label =
        user_token_name.label == cip68.nft_user_token_label
      let user_token_sequence_matches_reference =
        reference_token_name.sequence == user_token_name.sequence
      let user_token_content_matches_reference =
        reference_token_name.content == user_token_name.content
      let user_token_quantity_matches_reference = user_token_asset.2nd == 1
      let user_token_purpose_is_nft = user_token_name.purpose == NFT

      expect and {
          mints_single_reference_token?,
          reference_token_has_valid_label?,
          reference_token_has_valid_sequence?,
          reference_token_purpose_is_nft?,
          user_token_has_valid_label?,
          user_token_sequence_matches_reference?,
          user_token_content_matches_reference?,
          user_token_quantity_matches_reference?,
          user_token_purpose_is_nft?,
        }
      validate_mint_recursive(rest, sequence + 1)
    }
    [] -> True
  }
}

/// Currently only the holder of the owner token can burn because we need to update the NFT count state
/// and don't want to get weird with allowing spending of the state without the owner token present.
/// Otherwise this just makes certain the only thing included in the mints are burn
fn validate_burn(transaction: Transaction, mint_policy_id: PolicyId) {
  let Transaction { mint, inputs, .. } = transaction

  // Just verify reference input is included so that spending validator tracks state but don't need to grab anything from it for burn
  // Make sure the (111)Collection token is spent in the inputs 
  let spends_owner_token =
    in.has_nft(inputs, mint_policy_id, collection.owner_asset_name)

  // Make sure the (600)Collection token is also spent in the inputs
  let spends_state_token =
    in.has_nft(inputs, mint_policy_id, collection.state_asset_name)

  // Make sure we only have burns
  let only_burns =
    mint
      |> value.from_minted_value()
      |> value.tokens(mint_policy_id)
      |> dict.values()
      |> list.all(fn(quantity) { quantity == -1 })

  and {
    spends_owner_token?,
    spends_state_token?,
    only_burns,
  }
}
