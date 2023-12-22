// CIP-68 defined values
use aiken/bytearray.{drop, take}
use aiken/transaction/value.{AssetName}

/// CIP-68 reference token label (100)
pub const reference_token_label = #"000643b0"

/// CIP-68 NFT user token label (222)
pub const nft_user_token_label = #"000de140"

/// CIP-102 Royalty token label (500)
pub const royalty_token_asset_name = #"001f4d70526f79616c7479"

/// A URI matching CIP-25 can be either a string or array of strings.  
/// Therefore it is typed as Data for type checking.  
pub type Uri =
  Data

/// A description matching CIP-25 can be either a string or array of strings.
/// Therefore it is typed as Data for type checking.  
pub type Description =
  Data

/// CIP-68 Datum base shape for all types of user tokens
pub type ReferenceToken {
  metadata: Data,
  version: Int,
  extra: Data,
}

/// CIP-68 expected reference token metadata when user token is NFT (222) following CIP-25 shape
pub type MediaMetadata {
  name: ByteArray,
  image: Uri,
  files: Option<List<MediaFileDetails>>,
  description: Option<Description>,
  mediaType: Option<ByteArray>,
}

/// When MediaMetadata contains a non-empty list of files is should follow this shape
pub type MediaFileDetails {
  name: Option<ByteArray>,
  mediaType: ByteArray,
  src: Uri,
}

pub type Cip68AssetName {
  label: ByteArray,
  name: ByteArray,
}

/// Just splits the asset name into label and name without converting to int since usually just 
/// checking the full prefix with 0 pad and crc-8 is sufficient.
pub fn to_cip68_asset_name(name: AssetName) {
  Cip68AssetName { label: take(name, 4), name: drop(name, 4) }
}

/// Just checks if the given name starts with the specified label
pub fn has_label(name: AssetName, label: ByteArray) {
  take(name, 4) == label
}
