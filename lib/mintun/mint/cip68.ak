/// CIP-68 Standard datums
///
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
