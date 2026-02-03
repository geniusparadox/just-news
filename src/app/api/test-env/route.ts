import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasCurrentsKey: !!process.env.CURRENTS_API_KEY,
    keyLength: process.env.CURRENTS_API_KEY?.length || 0,
    hasNewsKey: !!process.env.NEWS_API_KEY,
  });
}
