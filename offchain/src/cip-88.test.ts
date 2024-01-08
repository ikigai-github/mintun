import { assert } from 'std/assert/assert.ts';
import {
  Cip88Builder,
  FEATURE_DETAIL_FIELD,
  FEATURE_VERSION_FIELD,
  RegistrationMetadataField,
  RegistrationPayloadField,
  RoyaltyDetail,
  RoyaltyDetailField,
  TokenProjectDetail,
  TokenProjectDetailField,
} from './cip-88.ts';
import { TEST_COLLECTION_INFO } from './fixtures.test.ts';
import { paramaterizeMintingPolicy } from './mintun.ts';
import { createEmulatorLucid } from './support.test.ts';

Deno.test('Build CIP-88 metadata', async () => {
  const { lucid, seedUtxo } = await createEmulatorLucid();

  const mintingPolicy = paramaterizeMintingPolicy(lucid, seedUtxo.txHash, seedUtxo.outputIndex);
  const address = await lucid.wallet.address();
  const projectName = 'Test Name';
  const info = TEST_COLLECTION_INFO;
  const royalty = { address, percentFee: 1.2 };
  const assetName = '';
  const oracleUri = 'https://www.whatever.com';

  const metadata = await Cip88Builder.register(mintingPolicy.script)
    .cip68Info(projectName, info)
    .cip27Royalty(royalty)
    .oracle(oracleUri)
    .validateWithbeacon(mintingPolicy.policyId)
    .build(lucid);

  assert(metadata[RegistrationMetadataField.VERSION] === 1, 'CIP 88 Version 1');
  assert(metadata[RegistrationMetadataField.WITNESS][0].length === 0, 'Beacon has empty witness set');

  const payload = metadata[RegistrationMetadataField.PAYLOAD];
  const scope = payload[RegistrationPayloadField.SCOPE];

  assert(scope[0] === 0, 'Scope is native script');
  assert(scope[1][0] === mintingPolicy.policyId, 'Scope Minting policy matches supplied script');
  assert(scope[1][1].join('') === mintingPolicy.script.script, 'Scoped script is array chunks of script');

  const featureSet = payload[RegistrationPayloadField.FEATURE_SET];

  assert(featureSet.length === 2, 'Exactly two features selected');
  assert(featureSet.includes(27), 'Feature set include CIP-27');
  assert(featureSet.includes(68), 'Feature set includes CIP-68');

  const validationMethod = payload[RegistrationPayloadField.VALIDATION_METHOD];

  assert(validationMethod[0] === 1, 'Validation method is beacon token');
  assert(
    validationMethod[1][0] === mintingPolicy.policyId,
    'Validation Method Beacon Token Policy matches minting policy',
  );
  assert(validationMethod[1][1] === assetName, 'Beacon token asset name is null (can be other things)');

  const nonce = payload[RegistrationPayloadField.NONCE];
  assert(nonce > 0, 'Nonce is a positive integer');

  const oracle = payload[RegistrationPayloadField.ORACLE_URI];
  assert(oracle[0] === 'https://', 'Oracle uri scheme is https://');
  assert(oracle.join('') === oracleUri, 'Oracle uri chunks rejoined matches full uri');

  const features = payload[RegistrationPayloadField.FEATURE_DETAILS];

  const detailWrapper = features[68] as TokenProjectDetail;
  assert(detailWrapper[FEATURE_VERSION_FIELD] === 1, 'CIP-68 feature version field is 1');

  const tokenDetail = detailWrapper[FEATURE_DETAIL_FIELD];
  assert(tokenDetail[TokenProjectDetailField.NAME] === projectName, `Token detail name is ${projectName}`);
  assert(
    tokenDetail[TokenProjectDetailField.DESCRIPTION]?.join('') === info.description,
    'Token detail description chunks rejoin into original description',
  );
  // Some other fields I could check here

  const royaltyWrapper = features[27] as RoyaltyDetail;
  assert(royaltyWrapper[FEATURE_VERSION_FIELD] === 1, 'CIP-27 feature version field 1');

  const royaltyDetail = royaltyWrapper[FEATURE_DETAIL_FIELD];
  assert(
    royaltyDetail[RoyaltyDetailField.RATE] === `${royalty.percentFee}`,
    'Royalty fee is string form of percentage',
  );
  assert(
    royaltyDetail[RoyaltyDetailField.RECIPIENT].join('') === address,
    'Rejoined royalty detail address matches original',
  );
});
