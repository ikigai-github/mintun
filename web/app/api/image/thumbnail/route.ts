import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

// Take a given url and make a thumbnail of it.  Assumes the passed url is an image.
export async function POST(request: NextRequest) {
  const { url } = await request.json();

  const data = await fetch(url);
  const buffer = await data.arrayBuffer();

  const thumbnail = sharp(buffer).resize({ fit: sharp.fit.contain, width: 800, height: 800 }).jpeg({ quality: 80 });

  const metadata = await thumbnail.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  const blob = new Blob([await thumbnail.toBuffer()], { type: 'image/jpeg' });
  const headers = new Headers();
  headers.set('Content-Type', 'image/jpeg');
  headers.set('x-width', '' + width);
  headers.set('x-height', '' + height);

  return new NextResponse(blob, { status: 200, statusText: 'OK', headers });
}
