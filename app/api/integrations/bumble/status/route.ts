import { NextResponse } from 'next/server';
import { getBumbleConnectorStatus } from '../../../../../lib/integrations/bumbleOfficialConnector';

export async function GET() {
  return NextResponse.json({
    ok: true,
    integration: getBumbleConnectorStatus(),
  });
}