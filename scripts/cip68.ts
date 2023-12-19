// Schema for cip-68 reference token metadata
import { Data, fromText, toLabel } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { TSchema } from "https://deno.land/x/typebox@0.25.13/src/typebox.ts";

export const REFERENCE_TOKEN_LABEL = 100;
export const NFT_TOKEN_LABEL = 222;

// Uses the 100 reference token schema and adds in the supplied metadata that 
// is specific to the user token (222, 333, 444)
export function createReferenceTokenSchema<T extends TSchema>(metadata: T) {
  return Data.Object({
    metadata,
    version: Data.Integer(),
    extra: Data.Any()
  });
}

// Combines the policyId (already hex encoded), label number, and content (UTF8 string) to create a asset unit
export function makeUnit(policyId: string, label: number, content: string, ) {
  return `${policyId}${toLabel(label)}${fromText(content)}`
}

// Combines policy id and content and applies the 222 (user/owner NFT) label to create an asset unit
export function makeNftUnit(policyId: string, content: string) {
  return makeUnit(policyId, 222, content);
}

// Combines policy id and content and applies the 100 (reference NFT) label to create an asset unit
export function makeReferenceUnit(policyId: string, content: string) {
  return makeUnit(policyId, 100, content)
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
export const NftSchema = createReferenceTokenSchema(NftMetadataSchema);
export type NftDatum = Data.Static<typeof NftSchema>
export const NftShape = NftSchema as unknown as NftDatum;
