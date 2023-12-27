// Builder for creating CIP-88 metadata to be included in initial mint of a new collection
// https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088
// Goal is to make a human readable builder that produces something like:
//  {
//    version: num,
//    registration: {
//      scope: { policyId: 'blah', script: 'blah' }
//      features: [68, 102] // Added via  builder calls
//      method: [0] // Added via builder call .,
//      ... // other fields
//    },
//    witnesses: [ ]
//  }
// Maybe will just directly produce the index based structure hidden behind builder
// const token_details = cip88.tokenDetail()
//      .project(project_name) // .artist(artist_name)
//      .collection(collection_name)
//      .description(desc)
//      .image(project_image_uri)
//      .banner(project_banner_uri)
//      .nsfw()
//      .social('twitter', twitter_uri)
//      .social('discord', discord_uri)
//
// const registration = cip88.registration(policy_id, script)
//      .featureCip68Nft(token_details)
//      .validateWithBeacon(policy_id, asset_id) // OR valdiateWithSignature()
//      .addOracle(orcale_uri)
//      .addWitness(signing_key, signature)
//      .complete() // At least one feature

// Then just need to attach this metadata along with any other metadata to initial mint
// Notes:
//  * Images lack dimensional specifications or a way to provide different resolutions which sucks
//  * Valid name in socials field isn't specific.  This means everyone must decide on an implementation. For example, "Twitter", "twitter", "x", "X" which is right?

// CIP-88 Metadata Example
const example = {
  // CIP-88 Metadata label
  867: {
    // Standard version number 1
    0: 1,
    // Registration Payload
    1: {
      // Scope
      1: [
        // Native Script (Always this?)
        0,
        // Policy id
        'h\'3668b628d7bd0cbdc4b7a60fe9bd327b56a1902e89fd01251a34c8be\'',
        // CBOR hex of the minting policy broken up into 64 byte chunks
        'h\'8200581c4bdb4c5017cdcb50c001af21d2488ed2e741df55b252dd3ab2482050\'',
      ],
      // Feature Set
      2: [
        // Using CIP-68 standard
        68,
        // Using CIP-102 standard
        102,
      ],
      // Validation Method using a Beacon Token vs 3:[0] a signature key
      3: [1, 'policy_id', 'asset_id'],
      // Nonce (Just always use the block_height of the TX)
      4: 12345,
      // Oracle URI - URI to offchain extension data or just empty array if there is no oracle
      5: [
        'https://',
        'oracle.tokenproject.io/',
      ],
      // CIP specific details
      6: {
        // CIP-68 feature
        68: {
          // Version 1
          0: 1,
          // Token specific details
          1: {
            // Collection Name
            0: 'Cool NFT Project',
            // Collection Description
            1: [
              'This is a description of my project',
              'longer than 64 characters so broken up into a string array',
            ],
            // Project Image
            2: [
              'https://',
              'static.coolnftproject.io',
              '/images/icon.png',
            ],
            // Project Banner
            3: [
              'https://',
              'static.coolnftproject.io',
              '/images/banner1.jpg',
            ],

            // NSFW?
            4: 0,
            // Socials
            5: [
              [
                'twitter',
                [
                  'https://',
                  'twitter.com/spacebudzNFT',
                ],
              ],
              [
                'discord',
                [
                  'https://',
                  'discord.gg/spacebudz',
                ],
              ],
            ],
            // Project or Artist Name
            6: 'Virtua Metaverse',
          },
        },
      },
    },
    // Registration Witness Array
    2: [
      // First witness
      [
        // Public key of the signed key
        'h\'02b76ae694ce6549d4a20dce308bc7af7fa5a00c7d82b70001e044e596a35deb\'',
        // Signed Key witness
        'h\'23d0614301b0d554def300388c2e36b702a66e85432940f703a5ba93bfb1659a0717962b40d87523c507ebe24efbb12a2024bb8b14441785a93af00276a32e08\'',
      ],
    ],
  },
};
