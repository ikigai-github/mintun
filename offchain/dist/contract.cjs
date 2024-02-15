"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _script = require('./script');
var _aiken = require('./aiken');
const MintParameterSchema = _lucidcardano.Data.Tuple([_aiken.OutputReferenceSchema]);
const MintParameterShape = MintParameterSchema;
const StateValidatorParameterSchema = _lucidcardano.Data.Tuple([_aiken.PolicyIdSchema]);
const StateValidatorParameterShape = StateValidatorParameterSchema;
const MintRedeemerSchema = _lucidcardano.Data.Enum([
  _lucidcardano.Data.Object({
    "EndpointGenesis": _lucidcardano.Data.Object({
      state_validator_policy_id: _aiken.PolicyIdSchema,
      info_validator_policy_id: _aiken.PolicyIdSchema
    })
  }),
  _lucidcardano.Data.Literal("EndpointMint"),
  _lucidcardano.Data.Literal("EndpointBurn")
]);
const MintRedeemerShape = MintRedeemerSchema;
const StateValidatorRedeemerSchema = _lucidcardano.Data.Enum([
  _lucidcardano.Data.Literal("EndpointMint"),
  _lucidcardano.Data.Literal("EndpointBurn")
]);
const StateValidatorRedeemerShape = StateValidatorRedeemerSchema;
function paramaterizeMintingPolicy(lucid, hash, index) {
  const seed = {
    transaction_id: {
      hash
    },
    output_index: BigInt(index)
  };
  const script = _script.getScript.call(void 0, "batch_mint.mint");
  const paramertizedMintingPolicy = _lucidcardano.applyParamsToScript.call(void 0, 
    script.compiledCode,
    [seed],
    MintParameterShape
  );
  return _script.getScriptInfo.call(void 0, lucid, script.title, paramertizedMintingPolicy);
}
function paramaterizeStateValidator(lucid, mintingPolicyId) {
  const script = _script.getScript.call(void 0, "state_validator.spend");
  const paramertizedMintingPolicy = _lucidcardano.applyParamsToScript.call(void 0, 
    script.compiledCode,
    [mintingPolicyId],
    StateValidatorParameterShape
  );
  return _script.getScriptInfo.call(void 0, lucid, script.title, paramertizedMintingPolicy);
}
function paramaterizeImmutableInfoValidator(lucid, mintingPolicyId) {
  const script = _script.getScript.call(void 0, "immutable_info_validator.spend");
  const paramertizedMintingPolicy = _lucidcardano.applyParamsToScript.call(void 0, 
    script.compiledCode,
    [mintingPolicyId]
  );
  return _script.getScriptInfo.call(void 0, lucid, script.title, paramertizedMintingPolicy);
}
function paramaterizeImmutableNftValidator(lucid, mintingPolicyId) {
  const script = _script.getScript.call(void 0, "immutable_nft.spend");
  const paramertizedMintingPolicy = _lucidcardano.applyParamsToScript.call(void 0, 
    script.compiledCode,
    [mintingPolicyId]
  );
  return _script.getScriptInfo.call(void 0, lucid, script.title, paramertizedMintingPolicy);
}







exports.MintRedeemerShape = MintRedeemerShape; exports.StateValidatorRedeemerShape = StateValidatorRedeemerShape; exports.paramaterizeImmutableInfoValidator = paramaterizeImmutableInfoValidator; exports.paramaterizeImmutableNftValidator = paramaterizeImmutableNftValidator; exports.paramaterizeMintingPolicy = paramaterizeMintingPolicy; exports.paramaterizeStateValidator = paramaterizeStateValidator;
