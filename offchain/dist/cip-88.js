import { fromUnit } from "lucid-cardano";
import { chunk } from "./utils";
import { asChainVariableFee } from "./cip-102";
import { IMAGE_PURPOSE } from "./image";
const CIP_88_METADATA_LABEL = 867;
const RegistrationMetadataField = {
  VERSION: 0,
  PAYLOAD: 1,
  WITNESS: 2
};
const SCOPE_NATIVE = 0;
const SCOPE_PLUTUS_V1 = 1;
const SCOPE_PLUTUS_V2 = 2;
const RegistrationPayloadField = {
  SCOPE: 1,
  FEATURE_SET: 2,
  VALIDATION_METHOD: 3,
  NONCE: 4,
  ORACLE_URI: 5,
  FEATURE_DETAILS: 6
};
const FEATURE_VERSION_FIELD = 0;
const FEATURE_DETAIL_FIELD = 1;
const TokenProjectDetailField = {
  NAME: 0,
  DESCRIPTION: 1,
  PROJECT_IMAGE: 2,
  PROJECT_BANNER: 3,
  NSFW_FLAG: 4,
  SOCIAL: 5,
  PROJECT_ARTIST: 6
};
const Cip27RoyaltyDetailField = {
  RATE: 0,
  RECIPIENT: 1
};
const Cip102RoyaltyDetailField = {
  ADDRESS: 0,
  VARIABLE_FEE: 1,
  MIN_FEE: 2,
  MAX_FEE: 3
};
function cip88Uri(uri) {
  const [scheme, path] = uri.split("://", 2);
  if (scheme && scheme.length > 1 && path && path.length) {
    if (path.length > 64) {
      return [`${scheme}://`, ...chunk(path)];
    } else {
      return [`${scheme}://`, path];
    }
  }
  throw new Error(`Unable to parse scheme from URI ${uri}`);
}
function mapImages(info) {
  function selectImages(images) {
    const avatar = images.find((image) => image.purpose === IMAGE_PURPOSE.Avatar);
    const banner2 = images.find((image) => image.purpose === IMAGE_PURPOSE.Banner);
    const thumbnail = images.find((image) => image.purpose === IMAGE_PURPOSE.Thumbnail);
    const general = images.find((image) => image.purpose === IMAGE_PURPOSE.General);
    const gallery = images.find((image) => image.purpose === IMAGE_PURPOSE.Gallery);
    return [
      avatar || thumbnail || general,
      banner2 || gallery || general
    ];
  }
  let profile;
  let banner;
  if (info.images) {
    const [profileImage, bannerImage] = selectImages(info.images);
    if (profileImage) {
      profile = cip88Uri(profileImage.src);
    }
    if (bannerImage) {
      banner = cip88Uri(bannerImage.src);
    }
  }
  return {
    profile,
    banner
  };
}
function mapNsfw(info) {
  if (info.nsfw !== void 0) {
    return info.nsfw ? 1 : 0;
  }
  return void 0;
}
function mapSocial(info) {
  if (info.links) {
    const mapped = {};
    for (const [label, uri] of Object.entries(info.links)) {
      mapped[label] = cip88Uri(uri);
    }
    return mapped;
  }
  return void 0;
}
function mapDescription(info) {
  if (info.description) {
    return chunk(info.description);
  }
  return void 0;
}
function toTokenProjectDetail(info) {
  const { profile, banner } = mapImages(info);
  return {
    [FEATURE_VERSION_FIELD]: 1,
    [FEATURE_DETAIL_FIELD]: {
      [TokenProjectDetailField.NAME]: info.name,
      [TokenProjectDetailField.DESCRIPTION]: mapDescription(info),
      [TokenProjectDetailField.PROJECT_IMAGE]: profile,
      [TokenProjectDetailField.PROJECT_BANNER]: banner,
      [TokenProjectDetailField.NSFW_FLAG]: mapNsfw(info),
      [TokenProjectDetailField.SOCIAL]: mapSocial(info),
      [TokenProjectDetailField.PROJECT_ARTIST]: info.project || info.artist
    }
  };
}
function toCip27RoyaltyDetail(royalty) {
  const address = chunk(royalty.address);
  return {
    [FEATURE_VERSION_FIELD]: 1,
    [FEATURE_DETAIL_FIELD]: {
      [Cip27RoyaltyDetailField.RATE]: `${royalty.variableFee / 100}`,
      [Cip27RoyaltyDetailField.RECIPIENT]: address
    }
  };
}
function toCip102RoyaltyRecipient(royalty) {
  const address = chunk(royalty.address);
  const recipient = {
    [Cip102RoyaltyDetailField.ADDRESS]: address,
    [Cip102RoyaltyDetailField.VARIABLE_FEE]: Number(asChainVariableFee(royalty.variableFee))
  };
  if (royalty.maxFee !== void 0) {
    recipient[Cip102RoyaltyDetailField.MAX_FEE] = royalty.maxFee;
  }
  if (royalty.minFee !== void 0) {
    recipient[Cip102RoyaltyDetailField.MIN_FEE] = royalty.minFee;
  }
  return recipient;
}
function toCip102RoyaltyDetail(royalties) {
  const recipients = royalties.map(toCip102RoyaltyRecipient);
  return {
    [FEATURE_VERSION_FIELD]: 1,
    [FEATURE_DETAIL_FIELD]: recipients
  };
}
class Cip88Builder {
  #script;
  #beacon;
  #features = {};
  #oracle;
  constructor(script) {
    this.#script = script;
  }
  static register(script) {
    return new Cip88Builder(script);
  }
  cip68Info(info) {
    const detail = toTokenProjectDetail(info);
    return this.tokenProject(68, detail);
  }
  cip25Info(info) {
    const detail = toTokenProjectDetail(info);
    return this.tokenProject(25, detail);
  }
  cip27Royalty(royalty) {
    const detail = toCip27RoyaltyDetail(royalty);
    this.#features[27] = detail;
    return this;
  }
  cip102Royalties(royalties) {
    const detail = toCip102RoyaltyDetail(royalties);
    this.#features[102] = detail;
    return this;
  }
  oracle(url) {
    this.#oracle = url;
    return this;
  }
  validateWithbeacon(unit) {
    this.#beacon = unit;
    return this;
  }
  async build(lucid) {
    if (!lucid.wallet) {
      throw new Error("Must provide an instance of lucide with a selected wallet");
    }
    const payload = this.buildPayload(lucid);
    let witness = [[]];
    if (!this.#beacon) {
      const address = await lucid.wallet.address();
      const result = await lucid.wallet.signMessage(address, JSON.stringify(payload));
      witness = [[result.key, result.signature]];
    }
    return {
      [RegistrationMetadataField.VERSION]: 1,
      [RegistrationMetadataField.PAYLOAD]: payload,
      [RegistrationMetadataField.WITNESS]: witness
    };
  }
  tokenProject(standard, detail) {
    if (this.#features[25] || this.#features[68]) {
      throw new Error(
        "Cannot declare a token project more than once. If your minting policy is CIP-68 but also emits CIP-25  for backward compatability just use 68"
      );
    }
    this.#features[standard] = detail;
    return this;
  }
  buildPayload(lucid) {
    const scope = this.buildScope(lucid);
    let validationMethod;
    if (this.#beacon) {
      const { policyId, assetName } = fromUnit(this.#beacon);
      const hexAssetName = assetName ? `0x${assetName}` : "";
      validationMethod = [1, [`0x${policyId}`, hexAssetName]];
    } else {
      validationMethod = [0];
    }
    const nonce = Date.now();
    const oracleUri = this.#oracle ? cip88Uri(this.#oracle) : [];
    const featureSet = Object.keys(this.#features).map((feature) => Number(feature));
    return {
      [RegistrationPayloadField.SCOPE]: scope,
      [RegistrationPayloadField.FEATURE_SET]: featureSet,
      [RegistrationPayloadField.VALIDATION_METHOD]: validationMethod,
      [RegistrationPayloadField.NONCE]: nonce,
      [RegistrationPayloadField.ORACLE_URI]: oracleUri,
      [RegistrationPayloadField.FEATURE_DETAILS]: this.#features
    };
  }
  buildScope(lucid) {
    const policyId = `0x${lucid.utils.validatorToScriptHash(this.#script)}`;
    if (this.#script.type === "Native") {
      const scriptChunks = chunk(this.#script.script, 64, "0x");
      return [SCOPE_NATIVE, [policyId, scriptChunks]];
    } else if (this.#script.type === "PlutusV1") {
      return [SCOPE_PLUTUS_V1, [policyId]];
    } else if (this.#script.type === "PlutusV2") {
      return [SCOPE_PLUTUS_V2, [policyId]];
    }
    throw Error(`Could not determine scope. Unexpected script type ${this.#script.type}`);
  }
}
async function addCip88MetadataToTransaction(lucid, tx, script, beaconUnit, config = void 0) {
  const builder = Cip88Builder.register(script).validateWithbeacon(beaconUnit);
  if (config) {
    if (config.cip27Royalty) {
      builder.cip27Royalty(config.cip27Royalty);
    }
    if (config.cip102Royalties) {
      builder.cip102Royalties(config.cip102Royalties);
    }
    if (config.info) {
      builder.cip68Info(config.info);
    }
  }
  const metadata = await builder.build(lucid);
  return tx.attachMetadataWithConversion(CIP_88_METADATA_LABEL, metadata);
}
export {
  CIP_88_METADATA_LABEL,
  Cip102RoyaltyDetailField,
  Cip27RoyaltyDetailField,
  Cip88Builder,
  FEATURE_DETAIL_FIELD,
  FEATURE_VERSION_FIELD,
  RegistrationMetadataField,
  RegistrationPayloadField,
  SCOPE_NATIVE,
  SCOPE_PLUTUS_V1,
  SCOPE_PLUTUS_V2,
  TokenProjectDetailField,
  addCip88MetadataToTransaction,
  cip88Uri,
  toCip102RoyaltyDetail,
  toCip102RoyaltyRecipient,
  toCip27RoyaltyDetail,
  toTokenProjectDetail
};
