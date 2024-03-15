import { NextRequest } from 'next/server';

import { createDelegation, createServerClient } from '@/lib/storage/server';

export const dynamic = 'force-dynamic';

// Delegate upload permissions to the requestor so that they can directly upload to IPFS
export async function POST(request: NextRequest) {
  const { did } = await request.json();
  const client = await createServerClient();
  const delegation = await createDelegation(client, did);

  return new Response(delegation);
}
