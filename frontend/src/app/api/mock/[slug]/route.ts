import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = await params

  if (slug === 'quote') {
    const quotes = [
      {
        quote: 'The future of finance is the internet.',
        author: 'Stellar enthusiast',
      },
      {
        quote:
          "Information is worth paying for, if it's the right information.",
        author: 'Digital Economist',
      },
      {
        quote:
          'Decentralized APIs are the building blocks of the agentic economy.',
        author: 'Heekowave Team',
      },
    ]
    return NextResponse.json(quotes[Math.floor(Math.random() * quotes.length)])
  }

  if (slug === 'weather') {
    return NextResponse.json([
      {
        city: 'Tokyo',
        temperature: '18°C',
        condition: 'Light rain and breezy',
        windSpeed: '15 km/h',
      },
      {
        city: 'Stellar City',
        temperature: '24°C',
        condition: 'Clear skies and high throughput',
        windSpeed: '5 km/h',
      },
      {
        city: 'New York',
        temperature: '12°C',
        condition: 'Overcast',
        windSpeed: '22 km/h',
      },
      {
        city: 'London',
        temperature: '9°C',
        condition: 'Heavy fog',
        windSpeed: '10 km/h',
      },
    ])
  }

  if (slug === 'generate-id') {
    return NextResponse.json({
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      entropy: Math.random(),
    })
  }

  return NextResponse.json({
    message:
      'Welcome to the Heekowave Mock API! Check the registry for monetized endpoints.',
    status: 'SYSTEM_READY',
    available_endpoints: [
      '/api/mock/quote',
      '/api/mock/weather',
      '/api/mock/generate-id',
    ],
  })
}
