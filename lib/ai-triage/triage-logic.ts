import { generateAgentResponse } from "../services/openai";
import { ThreadMessage } from "@/types/chat";
import { DefaultReplyToMessage } from "../workflows/basic_workflow";

type MessageRecord = {
  message_id: string;
  content: string;
  sender_number: string;
  sender_name: string;
  timestamp: string;
};

type TriageParams = {
  thread_id: string;
  message_id: string;
  content: string;
  sender_name: string;
  sender_number: string;
  thread_type: string;
  timestamp: string;
  messagesByThread: Map<string, MessageRecord[]>;
};

export async function triageMessage({
  thread_id,
  content,
  sender_name,
  sender_number,
  thread_type,
  messagesByThread,
}: TriageParams) {
  try {
    const threadMessages = messagesByThread.get(thread_id) || [];
    
    // Convert to ThreadMessage format
    const messages: ThreadMessage[] = threadMessages.map(msg => ({
      content: msg.content,
      sender_number: msg.sender_number,
      sender_name: msg.sender_name,
      thread_id,
      thread_type,
      timestamp: msg.timestamp,
      message_id: msg.message_id
    }));

    // Pass to DefaultResponse workflow
    await DefaultReplyToMessage(
      messages,
      thread_type as "individual" | "group",
      thread_id,
      sender_number
    );
  } catch (error) {
    console.error("[Triage] Error:", error);
    throw error;
  }
}
