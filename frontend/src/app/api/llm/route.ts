import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { provider, apiKey, messages } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error')
      }
      return NextResponse.json({ text: data.choices[0].message.content })
    } 
    
    if (provider === 'anthropic') {
      const systemMessage = messages.find((m: any) => m.role === 'system')?.content || ''
      const userMessages = messages.filter((m: any) => m.role !== 'system')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          system: systemMessage,
          messages: userMessages,
          max_tokens: 1024,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || 'Anthropic API error')
      }
      return NextResponse.json({ text: data.content[0].text })
    }

    return NextResponse.json(
      { error: 'Invalid provider selected' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('LLM proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
