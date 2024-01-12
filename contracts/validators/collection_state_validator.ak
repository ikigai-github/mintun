use aiken/dict
use aiken/string
use aiken/transaction.{Input, ScriptContext, Spend, Transaction}
use aiken/transaction/value.{MintedValue, PolicyId}
use mintun/cip68
use mintun/collection.{CollectionState}
use mintun/common
use mintun/input as in
use mintun/output as out

/// Endpoints available to be called on the batch mint spending validator
type Endpoint {
  /// Indicates the transaction is for minting or burning 
  EndpointMint

  /// Indicates the transaction is to lock the policy so that no more mints may occur
  EndpointLock
}

validator(mint_policy_id: PolicyId) {
  /// Validates changes to mutable parts of state datum: current nfts, sequence, and locked.
  /// Allows spending anything that is not a state token.
  fn spend(_datum, endpoint: Endpoint, context: ScriptContext) {
    let ScriptContext { transaction, purpose } = context

    expect Spend(output_reference) = purpose
    expect Some(state_input) =
      transaction.find_input(transaction.inputs, output_reference)
    trace @"Confirmed this is being invoked as a spending validator"

    let spends_state =
      value.quantity_of(
        state_input.output.value,
        mint_policy_id,
        collection.state_asset_name,
      ) == 1

    // Only validate spend if it is the state token. If it is anything else we
    // don't care and let it be spent.
    when spends_state is {
      True -> validate_spend(endpoint, transaction, mint_policy_id, state_input)
      False -> True
    }
  }
}

fn validate_spend(
  endpoint: Endpoint,
  transaction: Transaction,
  mint_policy_id: PolicyId,
  state_input: Input,
) {
  let Transaction { inputs, outputs, mint, .. } = transaction
  // Make sure the (111)(Management)Collection token for that minting policy is also spent 
  let spends_owner_token =
    in.has_nft(inputs, mint_policy_id, collection.owner_asset_name)
  expect spends_owner_token?
  // Previous state should be stored on the datum of the state reference input
  let input_data =
    collection.state_from_datum(transaction, state_input.output.datum)

  // Ensure that the state tokens validity range constraint is met, if that constraint exists.
  let mint_window_valid =
    common.time_contains(transaction.validity_range, input_data.mint_window)

  // If the contract is locked you can no longer spend the reference token (which means you can't update the datum)
  let contract_is_not_locked = input_data.force_locked == False

  // Get the output utxo where the reference token is spent
  expect [spent_utxo_output] =
    out.find_by_asset(outputs, mint_policy_id, collection.reference_asset_name)

  // Verify it is spent back to this spending validator
  let spends_back_to_validator =
    state_input.output.address == spent_utxo_output.address

  // Finally we can verify the datum
  let output_data =
    collection.state_from_datum(transaction, spent_utxo_output.datum)

  expect and {
      spends_owner_token?,
      mint_window_valid?,
      contract_is_not_locked?,
      spends_back_to_validator,
    }
  when endpoint is {
    EndpointMint -> validate_mint(mint, mint_policy_id, input_data, output_data)
    EndpointLock -> validate_lock(mint, input_data, output_data)
  }
}

fn validate_lock(
  mint: MintedValue,
  input_data: CollectionState,
  output_data: CollectionState,
) {
  let nothing_minted = mint |> value.from_minted_value() |> value.is_zero()
  let immutable_unchanged = validate_immutable_parts(input_data, output_data)
  let lock_enabled = output_data.force_locked == True
  let count_unchanged = output_data.current_nfts == input_data.current_nfts
  let sequence_unchanged = output_data.next_sequence == input_data.next_sequence

  and {
    nothing_minted?,
    immutable_unchanged?,
    lock_enabled?,
    count_unchanged?,
    sequence_unchanged?,
  }
}

/// This function confirms that only the stateful count and sequence values are updated and nothing else.
/// The count and sequence values are also checked to make sure they align with number of assets minted/burned.
fn validate_mint(
  mint: MintedValue,
  mint_policy_id: PolicyId,
  input_data: CollectionState,
  output_data: CollectionState,
) {
  let (mints, burns) = count_mints(mint, mint_policy_id)
  trace string.concat(@"Mint count is ", string.from_int(mints))
  trace string.concat(@"Burn count is ", string.from_int(burns))

  let current_nfts = input_data.current_nfts + mints - burns
  let next_sequence = input_data.next_sequence + mints

  // Make sure the mints will not cause the sequence number to overflow its max value
  let sequence_has_not_overflowed = next_sequence < collection.overflow_sequence
  expect sequence_has_not_overflowed?
  // Check that the output count hasn't exceeded max token count
  expect
    when input_data.max_nfts is {
      Some(max_nfts) -> current_nfts <= max_nfts
      None -> True
    }
  // Give each validation a name for easier tracing
  let immutable_unchanged = validate_immutable_parts(input_data, output_data)

  let lock_unchanged = output_data.force_locked == input_data.force_locked
  let updated_nft_count_correct = output_data.current_nfts == current_nfts
  let updated_sequence_correct = output_data.next_sequence == next_sequence

  // Validate the output state has only mutated the token count and updated the next sequence
  and {
    immutable_unchanged?,
    lock_unchanged?,
    updated_nft_count_correct?,
    updated_sequence_correct?,
  }
}

/// Count the number of tokens minted or burned at the batch mint policy_id
fn count_mints(mint: MintedValue, mint_policy_id: PolicyId) {
  let values = value.from_minted_value(mint)
  let tokens = value.tokens(values, mint_policy_id)

  // Must mint at least one token with the batch mint policy
  expect dict.is_empty(tokens) |> not()
  // Tally the minted and burned NFTs (just counting user token mints/burns)
  dict.foldl(
    tokens,
    (0, 0),
    fn(asset_name, quantity, sums) {
      let (mints, burns) = sums
      if cip68.has_label(asset_name, cip68.nft_user_token_label) {
        if quantity == 1 {
          (mints + 1, burns)
        } else if quantity == -1 {
          (mints, burns + 1)
        } else {
          // Should never be the case mint or burn is not +/- 1
          fail
        }
      } else {
        (mints, burns)
      }
    },
  )
}

/// Make certain the parts of the state datum that should never change remain unchanged in new state
fn validate_immutable_parts(prev: CollectionState, next: CollectionState) {
  // Note: Might be less work to replace next mutable fields with the prev value and then check equality.
  // Give each validation a name for easier tracing
  let group_unchanged = prev.group == next.group
  let mint_window_unchanged = prev.mint_window == next.mint_window
  let max_nfts_unchanged = prev.max_nfts == next.max_nfts
  let reference_address_unchanged =
    prev.reference_address == next.reference_address
  // Validate the output state has only mutated the token count and updated the next sequence
  and {
    group_unchanged?,
    mint_window_unchanged?,
    max_nfts_unchanged?,
    reference_address_unchanged?,
  }
}
