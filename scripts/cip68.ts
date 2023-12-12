import { Data } from "https://deno.land/x/lucid@0.10.7/mod.ts";

const ReferenceTokenSchema = Data.Object({
  metadata: Data.Any(),
  version: Data.Integer(),
  extra: Data.Any()
});


export type ReferenceTokenDatum = Data.Static<typeof ReferenceTokenSchema>;
export const ReferenceTokenShape = ReferenceTokenSchema as unknown as ReferenceTokenDatum;