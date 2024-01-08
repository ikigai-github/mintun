import { Address, Data, Lucid, Script, UTxO } from 'lucid';
import { CollectionState, CollectionStateMetadataShape, SEQUENCE_MAX_VALUE } from './collection.ts';
import { createGenesisData, MintRedeemerShape, toCollectionState } from './mintun.ts';
import { checkPolicyId } from './utils.ts';
import { addCip102RoyaltyToTransaction } from './cip-102.ts';
import { addCip27RoyaltyToTransaction } from './cip-27.ts';
import { Royalty } from './royalty.ts';
import { ScriptCache } from './script.ts';
import { CollectionInfo } from './collection-info.ts';
import { Cip88Builder, CIP_88_METADATA_LABEL } from './cip-88.ts';

export class GenesisTxBuilder {
  #lucid: Lucid;
  #seed?: UTxO;
  #state: Partial<CollectionState> = {};
  #useCip27 = false;
  #useCip88 = false;
  #infoInDatum = true;
  #royalties: Record<string, Royalty> = {};
  #royaltyTokenAddress?: Address;
  #ownerAddress?: string;

  private constructor(lucid: Lucid) {
    this.#lucid = lucid;
  }

  seed(seed: UTxO) {
    this.#seed = seed;
    return this;
  }

  name(name: string) {
    if (name.length <= 64) {
      this.#state.name = name;
      return this;
    }

    throw new Error('Name length must be <= 64 characters');
  }

  group(policyId: string) {
    if (checkPolicyId(policyId)) {
      this.#state.group = policyId;
      return this;
    }

    throw new Error('Group policy id must be a 28 bytes hex string');
  }

  mintWindow(startMs: number, endMs: number) {
    if (startMs >= 0 && startMs < endMs) {
      this.#state.mintWindow = {
        startMs,
        endMs,
      };
      return this;
    }

    throw new Error('Start and End milliseconds must be positive integers with end > start');
  }

  maxNfts(maxNfts: number) {
    if (maxNfts > 0 || maxNfts < SEQUENCE_MAX_VALUE) {
      this.#state.maxNfts = maxNfts;
      return this;
    }

    throw new Error(`If using maxNfts it must be between 0 and ${SEQUENCE_MAX_VALUE}`);
  }

  nftReferenceTokenAddress(address: string) {
    if (address.startsWith('addr')) {
      this.#state.nftReferenceTokenAddress = address;
      return this;
    }

    throw new Error('reference token validator address must be bech32 encoded string');
  }

  nftReferenceValidator(validator: Script) {
    this.#state.nftReferenceTokenAddress = this.#lucid.utils.validatorToAddress(validator);
    return this;
  }

  royaltyTokenAddress(address: string) {
    if (address.startsWith('addr')) {
      this.#royaltyTokenAddress = address;
      return this;
    }

    throw new Error('royalty address must be bech32 encoded string');
  }

  royaltyTokenValidator(validator: Script) {
    this.#royaltyTokenAddress = this.#lucid.utils.validatorToAddress(validator);
    return this;
  }

  ownerAddress(address: string) {
    if (address.startsWith('addr')) {
      this.#ownerAddress = address;
      return this;
    }

    throw Error('Owner address bust be a bech32 encoded string');
  }

  state(state: Partial<CollectionState>) {
    this.#state = state;
    return this;
  }

  // Don't bother translating till build step
  info(info: CollectionInfo, includeInDatum = true) {
    this.#state.info = info;
    this.#infoInDatum = includeInDatum;
    return this;
  }

  // When called the builder will include a null token and CIP-27 transaction metadata, if royalties are set
  useCip27() {
    this.#useCip27 = true;
    return this;
  }

  // When called the builder will include CIP-88 data in transaction metadta
  useCip88() {
    this.#useCip88 = true;
    return this;
  }

  royalty(
    address: string,
    percentFee: number,
    minFee: number | undefined = undefined,
    maxFee: number | undefined = undefined,
  ) {
    if (percentFee < 0.1) {
      throw new Error(
        'Royalty percent must be greater than 0.1%. If you want a fixed fee set min fee equal to max fee and percent to any postive number',
      );
    }

    if (!address.startsWith('addr')) {
      throw new Error('This is not a valid bech32 address');
    }
    if (this.#royalties[address]) {
      throw new Error('Can only add royalties for an address once');
    }

    this.#royalties[address] = { address, percentFee, minFee, maxFee };

    const total = Object.values(this.#royalties)
      .map((royalty) => royalty.percentFee)
      .reduce(
        (acc, next) => acc + next,
        0,
      );

    if (total > 100) {
      throw new Error(
        'Total royalty percent must be less than 100',
      );
    }

    return this;
  }

  async build() {
    if (!this.#seed) {
      throw new Error('Missing required field seed. Did you forget to call `seed(utxo)`?');
    }

    // Create a script cache from seed utxo so that after build it can be reused if needed
    const seed = { hash: this.#seed.txHash, index: this.#seed.outputIndex };
    const cache = ScriptCache.cold(this.#lucid, seed);
    const mint = cache.mint();
    const spend = cache.spend();
    const unit = cache.unit();

    // Build out the genesis data given the builder collection state
    const genesisData = createGenesisData(this.#state, this.#infoInDatum); // Plutus Data
    const genesisDatum = Data.to(genesisData, CollectionStateMetadataShape); // Serialized CBOR
    const recipient = this.#ownerAddress ? this.#ownerAddress : await this.#lucid.wallet.address();

    // Declare minimum managment token assets here may add royalties depending on builder config
    const validatorAssets = { [unit.reference]: 1n };
    const recipientAssets = { [unit.owner]: 1n };
    const assets = { ...validatorAssets, ...recipientAssets };

    const redeemer = Data.to({
      'EndpointGenesis': {
        validator_policy_id: spend.policyId,
      },
    }, MintRedeemerShape);

    // Start building tx
    const tx = this.#lucid.newTx()
      .attachMintingPolicy(mint.script)
      .collectFrom([this.#seed]);

    // Add royalties to minted assets, if they are included
    const royalties = Object.values(this.#royalties);
    if (royalties.length > 0) {
      if (this.#useCip27) {
        // TODO: Maybe send this to an always fail but at least if it goes to recipient it's burnable.
        recipientAssets[mint.policyId] = 1n;

        addCip27RoyaltyToTransaction(tx, mint.policyId, royalties, redeemer);
      }

      const royaltyAddress = this.#royaltyTokenAddress ? this.#royaltyTokenAddress : await this.#lucid.wallet.address();
      addCip102RoyaltyToTransaction(tx, mint.policyId, royaltyAddress, royalties, redeemer);
    }

    // Add CIP-88 metadata to transaction
    if (this.#useCip88) {
      const builder = Cip88Builder
        .register(mint.script)
        .validateWithbeacon(unit.owner);
      if (this.#useCip27 && royalties.length === 1) {
        builder.cip27Royalty(royalties[0]);
      }

      if (this.#state.name && this.#state.info) {
        builder.cip68Info(this.#state.name, this.#state.info);
      }

      const cip88Metadata = await builder.build(this.#lucid);
      tx.attachMetadataWithConversion(CIP_88_METADATA_LABEL, cip88Metadata);
    }

    tx
      .mintAssets(assets, redeemer)
      .payToAddressWithData(spend.address, {
        inline: genesisDatum,
      }, {
        [unit.reference]: 1n,
      })
      .payToAddress(recipient, recipientAssets);

    const state = toCollectionState(this.#lucid, genesisData);
    return { cache, tx, state, recipient };
  }

  static create(lucid: Lucid) {
    return new GenesisTxBuilder(lucid);
  }
}
