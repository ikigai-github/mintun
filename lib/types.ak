
// How to do union types in Aiken like ByteArray | [ByteArray]
// Also not sure if it is not encoded to put as a string
pub type Uri = ByteArray;

pub type ReferenceTokenDatum {
  metadata: Dict<Data, Data>,
  version: Int,
  extra: Data
}

pub type MediaFileDetails {
  name: Option<ByteArray>,
  mediaType: ByteArray,
  src: Uri
}

pub type MediaMetadata {
  name: ByteArray,
  image: Uri,
  files: Option<List<MediaFileDetails>>,
  description: Option<ByteArray>
  mediaType: Option<ByteArray>
}

pub type MintState {
  maxTokens: Option<int>,
  validUntil: Option<PosixTime>,
  tokens: Int,
  tx: Int
}