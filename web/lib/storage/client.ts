import { useEffect, useState } from 'react';
import { Client, create } from '@web3-storage/w3up-client';
import * as Delegation from '@web3-storage/w3up-client/delegation';

export async function createWebClient() {
  const client = await create();
  const did = client.agent.did();
  const apiUrl = '/api/storage/delegate';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ did }),
  });
  const data = await response.arrayBuffer();

  // Deserialize the delegation
  const delegation = await Delegation.extract(new Uint8Array(data));
  if (!delegation.ok) {
    throw new Error('Failed to extract delegation', { cause: delegation.error });
  }

  // Add proof that this agent has been delegated capabilities on the space
  const space = await client.addSpace(delegation.ok);
  client.setCurrentSpace(space.did());

  return client;
}

export function useStorageClient() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    createWebClient()
      .then((client) => {
        setClient(client);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [setClient, setLoading, setError]);

  return { client, loading, error };
}
