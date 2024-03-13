import 'server-only';

import { CarReader } from '@ipld/car';
import * as DID from '@ipld/dag-ucan/did';
import { importDAG } from '@ucanto/core/delegation';
import * as Signer from '@ucanto/principal/ed25519';
import { Client, create } from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';

export async function createServerClient() {
  const key = process.env.W3_STORAGE_KEY;
  const proof = process.env.W3_STORAGE_PROOF;

  if (!key || !proof) {
    throw new Error('key and proof must be set to create a server client to web3.storage');
  }

  const principal = Signer.parse(key);
  const store = new StoreMemory();
  const client = await create({ principal, store });
  const parsed = await parseProof(proof);
  const space = await client.addSpace(parsed);
  await client.setCurrentSpace(space.did());

  return client;
}

export async function createDelegation(client: Client, did: string) {
  // Create a delegation for a specific DID
  const audience = DID.parse(did);
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 1; // 1 hour from now
  const delegation = await client.createDelegation(audience, ['store/add', 'upload/add'], { expiration });

  // Serialize the delegation and send it to the client
  const archive = await delegation.archive();
  return archive.ok;
}

/** @param {string} data Base64 encoded CAR file */
async function parseProof(data: string) {
  const blocks = [];
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
  for await (const block of reader.blocks()) {
    blocks.push(block);
  }
  return importDAG(blocks as Iterable<Signer.Block<unknown, number, number, 1>>);
}
