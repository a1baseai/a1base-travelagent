import { ThreadMessage } from '@/types/chat'
import OpenAI from 'openai'
import { getSystemPrompt } from '../agent/prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAgentResponse(threadMessages: ThreadMessage[]): Promise<string> {
  const messages = threadMessages.map((msg) => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" as const : "user" as const,
    content: msg.content,
  }))

  const userName = [...threadMessages]
    .reverse()
    .find((msg) => msg.sender_number !== process.env.A1BASE_AGENT_NUMBER!)?.sender_name;

  if (!userName) {
    throw new Error("User's name not found");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: getSystemPrompt(userName) },
      ...messages,
    ],
  })

  return completion.choices[0].message.content || "Sorry, I couldn't generate a response"
}