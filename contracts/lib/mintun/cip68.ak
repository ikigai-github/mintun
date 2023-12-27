// CIP-68 defined values
use aiken/bytearray.{drop, take}
use aiken/transaction/value.{AssetName}

/// CIP-68 reference token label (100)
pub const reference_token_label = #"000643b0"

/// CIP-68 NFT user token label (222)
pub const nft_user_token_label = #"000de140"

/// CIP-102 Royalty token asset_name (500)Royalty
pub const royalty_token_asset_name = #"001f4d70526f79616c7479"

/// CIP-68 Datum base shape for all types of reference tokens
pub type ReferenceToken {
  metadata: Data,
  version: Int,
  extra: Data,
}

/// The regular asset name split into label and content parts.
pub type Cip68AssetName {
  label: ByteArray,
  content: ByteArray,
}

/// Just splits the asset name into label and name without converting to int since usually just 
/// checking the full prefix with 0 pad and crc-8 is sufficient.
pub fn to_cip68_asset_name(name: AssetName) {
  Cip68AssetName { label: take(name, 4), content: drop(name, 4) }
}

/// Just checks if the given name starts with the specified label
pub fn has_label(name: AssetName, label: ByteArray) {
  take(name, 4) == label
}
