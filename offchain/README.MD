# MintUN Offchain

This offchain library includes utility functions for building transaction that interact with the smart contracts. The main functions
provided are `prepareStateMintTx` and `prepareBatchMintTx`. The state mint transaction is used to create the initial state of the batch
mint. The batch mint transaction is used to mint tokens using that state. The tests show examples of how both are used.
