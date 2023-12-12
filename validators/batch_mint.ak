use aiken/transaction.{OutputReference, ScriptContext}

type Action {
  Mint
  Burn
}

// CIP-68 Time windowed minting policy - Batch mint
//  - Time Windowed can only mint until time X
//  - Can burn anytime 
//  - Must mint two tokens 100 and 222
//  - 500 Token can only be minted once and before all other tokens
//     - Must go to either owner or a script address (spending validator for mutation royalties)
//     - Can only mint on the 0th transaction
//  - 100 token must be output to specific address: 
//     - Same as 222 token (user holds reference)
//     - Script Address (spending validator for mutating reference)
//  - 100 token must have a datum (inline or not)
//  - 100 Datum must structurally match the standard with required fields and matching types for optional
// Initial Data:
//  Total Mints: 0
//  Total Transactions: 0

validator {
  fn mint(redeemer: Action, _reference: OutputReference) {
    when redeemer is {
      Mint -> True
      Burn -> True
    }
  }
}

validator {
  fn modify(_d: Data, _r: Data, _context: ScriptContext) {
    True
  }
}