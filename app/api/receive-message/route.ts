import { NextResponse } from 'next/server'
import { WhatsAppRequestBody } from '@/types/chat'
import { AGENT_NUMBER } from '@/lib/chat-config'
import { generateAgentResponse } from '@/lib/openai-service'
import { sendWhatsAppMessage } from '@/lib/whatsapp-service'

// In-memory storage (Note: This will reset on server restart)
const messagesByThread = new Map()

function saveMessage(threadId: string, message: any) {
  const threadMessages = messagesByThread.get(threadId) || []
  threadMessages.push(message)
  messagesByThread.set(threadId, threadMessages)
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as WhatsAppRequestBody
    let { thread_id, message_id, content, sender_number, sender_name, timestamp } = body
    sender_number = "+" + sender_number

    // Store message
    saveMessage(thread_id, {
      message_id,
      content,
      sender_number,
      sender_name,
      timestamp,
    })

    // Only respond to user messages
    if (sender_number !== AGENT_NUMBER) {
      try {
        const threadMessages = messagesByThread.get(thread_id) || []
        const aiResponse = await generateAgentResponse(threadMessages)
        await sendWhatsAppMessage(sender_number, aiResponse)
      } catch (error) {
        console.error("[Chat] Error:", error)
        await sendWhatsAppMessage(
          sender_number,
          "Sorry, I encountered an error processing your message"
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
} 