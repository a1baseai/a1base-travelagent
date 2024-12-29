import OpenAI from 'openai'
import { ThreadMessage } from '@/types/chat'
import { AGENT_NUMBER, getSystemPrompt } from './chat-config'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAgentResponse(threadMessages: ThreadMessage[]): Promise<string> {
  const messages = threadMessages.map((msg) => ({
    role: msg.sender_number === AGENT_NUMBER ? "assistant" as const : "user" as const,
    content: msg.content,
  }))

  const userName = [...threadMessages]
    .reverse()
    .find((msg) => msg.sender_number !== AGENT_NUMBER)?.sender_name || ""

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: getSystemPrompt(userName) },
      ...messages,
    ],
  })

  return completion.choices[0].message.content || "Sorry, I couldn't generate a response"
} 