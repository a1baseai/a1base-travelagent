import { AGENT_NUMBER } from './chat-config'

export async function sendWhatsAppMessage(to: string, content: string): Promise<void> {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": process.env.A1BASE_API_KEY,
      "X-API-Secret": process.env.A1BASE_API_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      from: AGENT_NUMBER,
      to,
      service: "whatsapp",
    }),
  }

  const response = await fetch(
    `https://api.a1base.com/v1/messages/individual/${process.env.A1BASE_ACCOUNT_ID}/send`,
    options
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${errorText}`)
  }

  return response.json()
} 