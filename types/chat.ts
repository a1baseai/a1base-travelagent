export interface WhatsAppRequestBody {
  thread_id: string
  message_id: string
  thread_type: string
  content: string
  sender_number: string
  sender_name: string
  a1_account_id: string
  timestamp: string
}

export interface ThreadMessage {
  message_id: string
  content: string
  sender_number: string
  sender_name: string
  timestamp: string
} 