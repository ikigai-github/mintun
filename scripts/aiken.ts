// Type definitons for aiken std lib types
import { Data } from "https://deno.land/x/lucid@0.10.7/mod.ts";

const PosixTimeIntervalBoundTypeSchema = Data.Enum([
  Data.Literal('NegativeInfinity'), 
  Data.Object({ 'Finite': Data.Tuple([Data.Integer()]) }), 
  Data.Literal('PositiveInfinity')
]);

const PosixTimeIntervalBoundSchema = Data.Object({
  bound_type: PosixTimeIntervalBoundTypeSchema,
  is_inclusive: Data.Boolean()
})

export const PosixTimeIntervalSchema = Data.Object({
  lower_bound: PosixTimeIntervalBoundSchema,
  uppper_bound: PosixTimeIntervalBoundSchema
});

