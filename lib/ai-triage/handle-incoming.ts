import { WhatsAppIncomingData } from "a1base-node";
import { triageMessage } from "./triage-logic";

// IN-MEMORY STORAGE FOR DEMO
// (Note: This will reset on server restart)
// Please implement a more permanent data store for any projects
const messagesByThread = new Map();

function saveMessage(
  threadId: string,
  message: {
    message_id: string;
    content: string;
    sender_number: string;
    sender_name: string;
    timestamp: string;
  }
) {
  const threadMessages = messagesByThread.get(threadId) || [];
  threadMessages.push(message);
  messagesByThread.set(threadId, threadMessages);
}

export async function handleWhatsAppIncoming({
  thread_id,
  message_id,
  content,
  sender_name,
  sender_number,
  thread_type,
  timestamp,
}: WhatsAppIncomingData) {
  console.log("[Message Received]", {
    thread_id,
    message_id,
    content,
    sender_number,
    sender_name,
    thread_type,
    timestamp,
  });

  // Store message
  saveMessage(thread_id, {
    message_id,
    content,
    sender_number,
    sender_name,
    timestamp,
  });

  // Only respond to user messages
  if (sender_number === process.env.A1BASE_AGENT_NUMBER!) {
    return;
  }

  await triageMessage({
    thread_id,
    message_id,
    content,
    sender_name,
    sender_number,
    thread_type,
    timestamp,
    messagesByThread,
  });
}
