import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { body } = await request.json()

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: body.slice(0, 1000),
          parameters: { max_length: 200, min_length: 100 },
        }),
      }
    )

    const text = await response.text()
    
    // Handle model loading
    if (text.includes('loading') || text.includes('DOCTYPE')) {
      return NextResponse.json({ 
        summary: 'Summary is being generated. Please wait a moment and refresh.' 
      })
    }

    const data = JSON.parse(text)
    const summary = data[0]?.summary_text || ''
    return NextResponse.json({ summary })
  } catch (error: any) {
    return NextResponse.json(
      { summary: '', error: error.message },
      { status: 500 }
    )
  }
}