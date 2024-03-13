import { useEffect, useState } from 'react';
import { extract } from '@ucanto/core/delegation';
import { Client, create } from '@web3-storage/w3up-client';

export async function createWebClient() {
  const client = await create();

  // Fetch the delegation from the backend
  const apiUrl = `/api/storage/delegate/${client.agent.did()}`;
  const response = await fetch(apiUrl);
  const data = await response.arrayBuffer();

  // Deserialize the delegation
  const delegation = await extract(new Uint8Array(data));
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
