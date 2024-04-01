# Mintun Web

This tool is aimed at providing a creator friendly means of making blockchain assets and events. This includes things like creating and managing collections, collection groups, tickets, airdrops, and more. It will also include some guides to help explain some of the nomenclature in laymans terms.

A creator will be able to link to a collection view to display details of collections they created with the tool. This can be used to show customers the constraints they have applied to their constracts as well as all the assets in the collection. This tool will be publicly available and free to use with no plans for any form of monetization.

# Getting Started

To get the service running you need NodeJS 18+ and `pnpm`. We find using `nvm install --lts` to install Node and `corepack enable pnpm` to be the easiest route.

Once you have the basic environment you will need to run `pnpm install` if packages haven't been installed since last run. Then you need to run `pnpm dev` to start the project on port 3000.

## Environment variables

Gradually some environment variables are being added to support external APIs. Currently
keys for blockfrost and web3 storage client.

### Blockfrost

For Blockfrost you need to set the Preprod or Mainnet API key depending on network. If you don't already have a [blockfrost.io](https://blockfrost.io/) account then you can create one.

You may also need to add a project in the Blockfrost dashboard for the chosen network. Place the API key displayed in the dashboard into `.env.local` under the variable `NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD` or `NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET` depending on which network you chose. You can setup both if you would like to as well.

### Web3 Storage

Web3 storage is used for uploading images to IPFS. To use the API with Mintun you will need to first install the cli tool.

```
pnpm install -g @web3-storage/w3cli
```

Next you need to login. If you don't already have an account this command will create one for you. One drawback is even with free tier you need to enter credit card information. We will see if there is a better solution in the future. The good news is the free tier is plenty of space for testing.

```
w3 login alice@example.com

```

Next create a space and set the CLI to use that space

```
w3 space create
w3 space use <your-space-name>
```

Now you can generate the credentials needed to perform client side upload from mintun.

```
# The following command returns what will be your Agent private key and DID
w3 key create

# ❗️ Store the private key (starting "Mg...") in environment variable W3_STORAGE_KEY

w3 delegation create --can 'store/add' --can 'upload/add' <did_from_ucan-key_command_above> | base64

# ❗️ Store the output in environment variable W3_STORAGE_PROOF
```

Now you should be ready to upload. If you get some parse errors when uploading then something probably went wrong with generating the key. The [detailed guide](https://web3.storage/docs/how-to/upload/#using-the-cli) on web3.storage site may be of help.

## Current Task List

1. Add manage collection page for minting NFTs
2. Add a guides/blog section setup with MDX
   - Basics (common nomenclature)
   - Evolving NFTs
   - Wallets
3. Add collection viewer page
4. Add more special case validators (predetermined evolution, )
5. Add Quick Mint flow to skip the larger collection creation flow

## Other possible helper tool ideas

- NFT Layered image generator with support for trait probabilities
