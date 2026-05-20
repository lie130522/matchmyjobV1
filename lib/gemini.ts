import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Returns a Gemini model instance (lazy — ne s'initialise pas au build).
 */
export function getModel(modelName = 'gemini-2.5-flash') {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables')
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName })
}

/**
 * Generate text from a prompt and return the plain text response.
 * Throws if Gemini doesn't respond within `timeoutMs` (default 30s).
 */
export async function generateText(
  prompt: string,
  modelName?: string,
  timeoutMs = 30_000,
): Promise<string> {
  const model = getModel(modelName)

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini timeout after ${timeoutMs}ms`)), timeoutMs),
  )

  const result = await Promise.race([
    model.generateContent(prompt),
    timeoutPromise,
  ])

  return result.response.text()
}
