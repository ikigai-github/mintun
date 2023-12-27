use aiken/bytearray
use aiken/dict.{Dict}
use aiken/interval.{Interval}
use aiken/time.{PosixTime}
use aiken/transaction.{Datum, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{AssetName, PolicyId}
use mintun/cip68.{ReferenceToken}
use mintun/data
use mintun/int

/// The asset name split and parsed into it's constiuent parts.
/// label - The CIP-68 Label part of the asset name
/// sequence - The 4 byte unique sequence number for the asset 
/// content - The extra name, not strictly neccessary but can put some extra data here 
/// Ex: `(100)(123)Asset #003`
pub type CollectionName {
  label: ByteArray,
  sequence: Int,
  content: ByteArray,
}

/// Collection State token name and datum used by stateful minting contracts to track mint count
/// (100)Collection reference token asset name
pub const reference_asset_name = #"000643b07374617465"

/// (111)Collection owner/beacon token asset name
/// Note: Picked 111 to indicate non-standard user token (vs 222, 444, 333, 500)
pub const owner_asset_name = #"0006f0a07374617465"

/// Pixel width and height of an image. Can also be used at hint if for example you 
/// have two banners where one is 16x9 and another is 4x3 the marketplace can pick
/// the banner that best matches the viewers aspect ratio.
pub type ImageDimensions {
  width: Int,
  height: Int,
}

/// Hints to marketplaces how this image is intended to be used. 
pub type ImagePurpose {
  // The image is intended to be displayed as a thumbnail
  Thumbnail

  // The image is intended to be displayed as a banner
  Banner

  // The image is intended to be displayed as a Avatar
  Avatar

  // The image is intended to be displayed in a Gallery
  Gallery

  // The image has no specific purpose
  General
}

/// Slightly more robust image type that includes a hint at the purpose, dimension, and alternate text of an image
pub type CollectionImage {
  dimensions: ImageDimensions,
  purpose: ImagePurpose,
  media_type: ByteArray,
  src: List<ByteArray>,
  alt: Option<ByteArray>,
}

/// Datum containing collection information to be used by markets when displaying the collection
pub type CollectionInfo {
  description: List<ByteArray>,
  images: List<CollectionImage>,
  attributes: List<ByteArray>,
  tags: List<ByteArray>,
  website: List<ByteArray>,
  social: Option<Dict<ByteArray, List<ByteArray>>>,
  extra: Data,
}

/// NOTE: Collection group idea is pretty simple.   A two way pointer between the group and the collection make
///       it verifiable that a particular collection is part of the group.  The group minting policy includes in metadata
///       or datum a list of policy ids in the group.  The child policy genesis transaction either puts in metadta or mints a 
///       "collection" state token that includes in its datum the parent policy_id.
///       -- Could require spending a beacon token for the registry in the contract to have it verified on chain for the given collection.
/// State used by the spending validator on the reference token created by collection minting policy 
/// name - The display name of the collection
/// group - The group that this collection claims to be a part of.
/// mint_window - The time range in which mints are possible for this colleciton
/// max_nfts - The maximum number of NFTs this colleciton can contain
/// current_nfts - The current number of NFTs this collection contains
/// next_sequence - The monotonically increasing next sequence number to be used on mint. (Guarantee each NFT is unique)
/// reference_address - The address all minted reference tokens must be sent to
/// info - Details about the collection to be used by marketplaces
/// extra - Any additional data 
pub type CollectionState {
  name: ByteArray,
  group: Option<PolicyId>,
  mint_window: Option<Interval<PosixTime>>,
  max_nfts: Option<Int>,
  current_nfts: Int,
  next_sequence: Int,
  reference_address: Option<Address>,
  info: Option<CollectionInfo>,
  extra: Data,
}

/// Assures the datum is inline cip-68 reference token shape.
/// Then it takes the metadata of the reference token datum and assures it matches MintState shape. 
/// Finally, if all is well, it returns the mint state.
pub fn from_datum(transaction: Transaction, datum: Datum) {
  trace @"State: Get reference token data"
  expect Some(maybe_reference_token_data) = data.extract(transaction, datum)

  trace @"State: Validate container shape"
  expect reference_token_data: ReferenceToken = maybe_reference_token_data

  trace @"State: Validate metadata shape"
  expect mint_state_data: CollectionState = reference_token_data.metadata

  mint_state_data
}

/// Convert an asset name into its constiuent parts which are the label, sequence number, and content name
pub fn parse_name(name: AssetName) -> CollectionName {
  let label = bytearray.take(name, 4)
  let sequence = int.from_hex_bytes(bytearray.slice(name, 5, 7))
  let content = bytearray.drop(name, 7)

  CollectionName { label, sequence, content }
}
