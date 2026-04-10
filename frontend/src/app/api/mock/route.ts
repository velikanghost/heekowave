import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Welcome to the Heekowave Mock API! Check the registry for monetized endpoints.',
    status: 'SYSTEM_READY',
    available_endpoints: [
      '/api/mock/quote',
      '/api/mock/weather',
      '/api/mock/generate-id'
    ]
  });
}
