import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateSummary(postBody: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const result = await model.generateContent(
    `Summarize the following blog post in approximately 200 words. 
     Be clear and concise: ${postBody}`
  )
  
  return result.response.text()
}