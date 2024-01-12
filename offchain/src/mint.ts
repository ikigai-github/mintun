import { Address, Assets, Data, Lucid, UTxO } from 'lucid';
import { TxReference } from './utils.ts';

import { AddressedNft, MintunNft, prepareAssets } from './nft.ts';
import { fetchOwnerUtxo, fetchStateUtxo, ScriptCache } from './script.ts';
import { MintRedeemerShape, StateValidatorRedeemerShape } from './contract.ts';
import { NftMetadataWrappedShape } from './cip-68.ts';
import { toRoyaltyUnit } from './cip-102.ts';
import {
  addMintsToCollectionState,
  asChainStateData,
  CollectionState,
  CollectionStateMetadataShape,
  extractCollectionState,
} from './collection-state.ts';

// Don't have a dedicated cip-25.ts so just putting this here
export const CIP_25_METADATA_LABEL = 721;

export class MintTxBuilder {
  #lucid: Lucid;
  #seed?: TxReference;
  #cache?: ScriptCache;
  #recipient?: Address;
  #stateUtxo?: UTxO;
  #ownerUtxo?: UTxO;
  #currentState?: CollectionState;
  #nfts: AddressedNft[] = [];
  #useCip25 = false;

  private constructor(lucid: Lucid) {
    this.#lucid = lucid;
  }

  seed(seed: TxReference) {
    this.#seed = seed;
    return this;
  }

  cache(cache: ScriptCache) {
    this.#cache = cache;
    return this;
  }

  recipient(recipient: Address) {
    this.#recipient = recipient;
    return this;
  }

  stateUtxo(utxo: UTxO) {
    this.#stateUtxo = utxo;
    return this;
  }

  ownerUtxo(utxo: UTxO) {
    this.#ownerUtxo = utxo;
    return this;
  }

  state(state: CollectionState) {
    this.#currentState = state;
    return this;
  }

  nft(metadata: MintunNft, recipient: string | undefined = undefined) {
    this.#nfts.push({ metadata, recipient });
    return this;
  }

  nfts(nfts: MintunNft[], recipient: string | undefined = undefined) {
    const mapped = nfts.map((metadata) => ({
      metadata,
      recipient,
    }));

    this.#nfts = [...this.#nfts, ...mapped];
    return this;
  }

  // Note: Not sure this is a good idea may just confuse things to have both cip-25 and cip-68 metadata.
  //       Also, if NFT metadata is in any way modifiable then we shouldn't use cip-25.
  useCip25(useCip25: boolean) {
    this.#useCip25 = useCip25;
    return this;
  }

  async build() {
    const numMints = this.nfts.length;
    if (numMints === 0) {
      throw new Error('Cannot build a mint transaction with no NFTs to mint');
    }

    let cache: ScriptCache;
    if (this.#cache) {
      cache = ScriptCache.copy(this.#lucid, this.#cache);
    } else if (this.#seed) {
      cache = ScriptCache.cold(this.#lucid, this.#seed);
    } else {
      throw new Error('Must either supply a seed utxo or a script cache to build transaction');
    }

    const mint = cache.mint();
    const spend = cache.state();
    const unit = cache.unit();

    // Fetch the state token utxo
    const stateUtxo = this.#stateUtxo ? this.#stateUtxo : await fetchStateUtxo(cache);

    if (!stateUtxo) {
      throw new Error('Could not find the utxo holding state. It must be spent to mint');
    }

    // Fetch the owner UTxO, should be in the selected wallet otherwise we can't spend it.
    let ownerUtxo = this.#ownerUtxo;
    if (!ownerUtxo) {
      const { utxo, wallet } = await fetchOwnerUtxo(cache);
      if (!utxo) {
        throw new Error('Could not find the utxo holding the owner token');
      }

      if (!wallet) {
        throw new Error('Cannot spend owner token because it is not in the current selected lucid wallet');
      }

      ownerUtxo = utxo;
    }

    // Check if there is the royalty token because we need to add a royalty flag if there is one
    const royaltyUnit = toRoyaltyUnit(mint.policyId);
    const royaltyFindResult = await this.#lucid.utxoByUnit(royaltyUnit);
    const hasRoyalty = royaltyFindResult !== undefined;

    // Compute the updated state
    const currentState = this.#currentState ? this.#currentState : await extractCollectionState(this.#lucid, stateUtxo);
    const defaultRecipientAddress = this.#recipient || await this.#lucid.wallet.address();
    const referenceAddress = currentState.nftValidatorAddress;

    // Update state to reflect the new mitns
    const nextState = addMintsToCollectionState(currentState, numMints);
    const chainState = asChainStateData(nextState);

    // Get user and reference token names for each nft as well as its on chain representation
    const prepared = prepareAssets(
      this.#nfts,
      mint.policyId,
      currentState.nextSequence,
      defaultRecipientAddress,
      hasRoyalty,
      referenceAddress,
    );

    const mintRedeemer = Data.to('EndpointMint', MintRedeemerShape);
    const validatorRedeemer = Data.to('EndpointMint', StateValidatorRedeemerShape);

    const ownerAsset = { [unit.owner]: 1n };
    const stateAsset = { [unit.state]: 1n };
    const stateOutput = { inline: Data.to(chainState, CollectionStateMetadataShape) };

    // TODO: See if it is possible for genesis to output a script ref of the minting policy to leave room for minting more NFTs in a single batch
    const tx = this.#lucid.newTx()
      .collectFrom([ownerUtxo])
      .attachSpendingValidator(spend.script)
      .collectFrom([stateUtxo], validatorRedeemer)
      .attachMintingPolicy(mint.script)
      .mintAssets(prepared.mints, mintRedeemer)
      .payToAddress(defaultRecipientAddress, ownerAsset)
      .payToAddressWithData(spend.address, stateOutput, stateAsset);

    for (const payout of prepared.referencePayouts) {
      // TODO: Add flag so can choose to inline or not
      const outputData = { inline: Data.to(payout.chainData, NftMetadataWrappedShape) };
      const referenceaAsset = { [payout.unit]: 1n };
      tx.payToAddressWithData(payout.address, outputData, referenceaAsset);
    }

    for (const [address, units] of Object.entries(prepared.userPayouts)) {
      const assets: Assets = {};
      for (const unit of units) {
        assets[unit] = 1n;
      }
      tx.payToAddress(address, assets);
    }

    if (this.#useCip25) {
      tx.attachMetadata(CIP_25_METADATA_LABEL, prepared.cip25Metadata);
    }

    return { tx, cache };
  }

  static create(lucid: Lucid) {
    return new MintTxBuilder(lucid);
  }
}
