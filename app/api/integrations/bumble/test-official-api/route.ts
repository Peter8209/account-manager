import { NextResponse } from 'next/server';
import { testBumbleOfficialApi } from '@/lib/integrations/bumbleOfficialConnector';

export async function GET() {
  const result = await testBumbleOfficialApi();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}