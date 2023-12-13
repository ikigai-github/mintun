import { Data } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { TSchema } from "https://deno.land/x/typebox@0.25.13/src/typebox.ts";

export function createReferenceTokenSchema<T extends TSchema>(metadata: T) {
  return Data.Object({
    metadata,
    version: Data.Integer(),
    extra: Data.Any()
  });
}

const NftMetadataFileSchema = Data.Object({
  name: Data.Nullable(Data.Bytes()),
  mediaType: Data.Bytes(),
  src: Data.Bytes()
});


const NftMetadataSchema = Data.Object({
  name: Data.Bytes(),
  image: Data.Bytes(),
  description: Data.Nullable(Data.Any()), // Can be Data.Bytes() or Data.Array(Data.Bytes()) no way to express that
  files: Data.Nullable(NftMetadataFileSchema)
})


// Todo: Actually use this for the mints.  Add custom bit to schema for traits/attributes of the NFT
const NftReferenceMetadataSchema = createReferenceTokenSchema(NftMetadataSchema);

