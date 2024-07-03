import 'server-only';

import { fstat } from 'fs';
import { readFile } from 'fs/promises';
import { CarReader } from '@ipld/car';
import * as DID from '@ipld/dag-ucan/did';
import { Client, create } from '@web3-storage/w3up-client';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';
import * as Proof from '@web3-storage/w3up-client/proof';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';

export async function createServerClient() {
  const key = process.env.W3_STORAGE_KEY;
  let proof = process.env.W3_STORAGE_PROOF;

  if (!key) {
    throw new Error('key and proof must be set to create a server client to web3.storage');
  }

  if (!proof) {
    try {
      const result = await readFile('.proof');
      proof = result.toString();
    } catch (e) {
      throw new Error('Failed to load proof cannot create w3 storage client');
    }
  }

  const principal = Signer.parse(key);
  const store = new StoreMemory();
  const client = await create({ principal, store });
  const parsed = await Proof.parse(proof);
  const space = await client.addSpace(parsed);
  await client.setCurrentSpace(space.did());

  return client;
}

export async function createDelegation(client: Client, did: string) {
  // Create a delegation for a specific DID
  const audience = DID.parse(did);
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 1; // 1 hour from now
  const delegation = await client.createDelegation(
    audience,
    ['space/blob/add', 'space/index/add', 'filecoin/offer', 'upload/add'],
    {
      expiration,
    }
  );

  // Serialize the delegation and send it to the client
  const archive = await delegation.archive();
  return archive.ok;
}
