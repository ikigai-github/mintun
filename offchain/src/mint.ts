import { Address, Assets, Data, Lucid, UTxO } from 'lucid';
import { stringifyReplacer, TxReference } from './utils.ts';
import {
  addMintsToCollectionState,
  asChainState,
  CollectionState,
  CollectionStateMetadataShape,
  extractCollectionState,
} from './collection.ts';
import { AddressedNft, MintunNft, prepareAssets } from './nft.ts';
import { fetchManageOwnerUtxo, fetchManageReferenceUtxo, ScriptCache } from './script.ts';
import { MintRedeemerShape, ValidatorRedeemerShape } from './contract.ts';
import { NftMetadataWrappedShape } from './cip-68.ts';

// Don't have a dedicated cip-27.ts so just putting this here
export const CIP_25_METADATA_LABEL = 721;

export class MintTxBuilder {
  #lucid: Lucid;
  #seed?: TxReference;
  #cache?: ScriptCache;
  #recipient?: Address;
  #manageReferenceUtxo?: UTxO;
  #manageOwnerUtxo?: UTxO;
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

  manageReferenceUtxo(utxo: UTxO) {
    this.#manageReferenceUtxo = utxo;
    return this;
  }

  manageOwnerUtxo(utxo: UTxO) {
    this.#manageOwnerUtxo = utxo;
    return this;
  }

  currentState(state: CollectionState) {
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
    const spend = cache.spend();
    const unit = cache.unit();

    const manageReferenceUtxo = this.#manageReferenceUtxo
      ? this.#manageReferenceUtxo
      : await fetchManageReferenceUtxo(cache);

    if (!manageReferenceUtxo) {
      throw new Error('Could not find the management reference utxo that must be spent to mint');
    }

    let manageOwnerUtxo = this.#manageOwnerUtxo;
    if (!manageOwnerUtxo) {
      const { utxo, wallet } = await fetchManageOwnerUtxo(cache);
      if (!utxo) {
        throw new Error('Could not find the manage owner token UTxO');
      }

      if (!wallet) {
        throw new Error('Cannot spend manage owner token because it is not in the current selected lucid walllet');
      }

      manageOwnerUtxo = utxo;
    }

    const currentState = this.#currentState
      ? this.#currentState
      : await extractCollectionState(this.#lucid, manageReferenceUtxo);

    const defaultRecipientAddress = this.#recipient || await this.#lucid.wallet.address();
    const referenceAddress = currentState.nftReferenceTokenAddress;

    // Update state to reflect the new mitns
    const nextState = addMintsToCollectionState(currentState, numMints);
    const chainState = asChainState(nextState);

    // TODO: Need to check if this collection has royalties and if so add the royalty_flag to the extra data.

    // Get user and reference token names for each nft as well as its on chain representation
    const prepared = prepareAssets(
      this.#nfts,
      mint.policyId,
      currentState.nextSequence,
      defaultRecipientAddress,
      referenceAddress,
    );

    const mintRedeemer = Data.to('EndpointMint', MintRedeemerShape);
    const validatorRedeemer = Data.to('EndpointMint', ValidatorRedeemerShape);

    const managementUserAsset = { [unit.owner]: 1n };
    const managementReferenceAsset = { [unit.reference]: 1n };
    const managementOutput = { inline: Data.to(chainState, CollectionStateMetadataShape) };

    // TODO: See if it is possible for genesis to output a script ref of the minting policy to leave room for minting more NFTs in a single batch
    const tx = this.#lucid.newTx()
      .collectFrom([manageOwnerUtxo])
      .attachSpendingValidator(spend.script)
      .collectFrom([manageReferenceUtxo], validatorRedeemer)
      .attachMintingPolicy(mint.script)
      .mintAssets(prepared.mints, mintRedeemer)
      .payToAddress(defaultRecipientAddress, managementUserAsset)
      .payToAddressWithData(spend.address, managementOutput, managementReferenceAsset);

    for (const payout of prepared.referencePayouts) {
      // TODO: Add flag so can choose to inline or not
      const outputData = { inline: Data.to(payout.chainData, NftMetadataWrappedShape) };
      const asset = { [payout.unit]: 1n };
      tx.payToAddressWithData(payout.address, outputData, asset);
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
