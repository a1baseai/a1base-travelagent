import { ThreadMessage } from '@/types/chat'
import OpenAI from 'openai'
import { getSystemPrompt } from '../agent/system-prompt'
import { basicWorkflowsPrompt } from '../workflows/basic_workflows_prompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Triage the message intent using OpenAI.
 * This function returns one of the following responseTypes:
 *  - generateEmail
 *  - followUpResponse
 *  - simpleResponse
 */
export async function triageMessageIntent(threadMessages: ThreadMessage[]): Promise<{ responseType: "generateEmail" | "followUpResponse" | "simpleResponse" }> {
  // Combine user messages as conversation context
  const conversationContext = threadMessages.map((msg) => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" as const : "user" as const,
    content: msg.content,
  }))

  // We'll prepend a special system instruction to classify the user's intention
  // Create a triage prompt that instructs the model to respond with JSON only
  const triagePrompt = `
Based on the conversation, analyze the user's intent and respond with exactly one of these three JSON responses:
{"responseType":"generateEmail"}
{"responseType":"followUpResponse"}
{"responseType":"simpleResponse"}

Rules:
- If the user specifically requests an email or includes an email address, select "generateEmail".
- If the user asks a question or follow-up inquiry that doesn't necessarily request an email, select "followUpResponse".
- Otherwise, select "simpleResponse".

Return valid JSON with only that single key "responseType" and value as one of the three allowed strings.
`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: triagePrompt },
      ...conversationContext,
    ],
  })

  const content = completion.choices[0]?.message?.content || ""

  // Attempt to parse the returned JSON
  try {
    const parsed = JSON.parse(content)
    if (
      parsed.responseType === "generateEmail" ||
      parsed.responseType === "followUpResponse" ||
      parsed.responseType === "simpleResponse"
    ) {
      return { responseType: parsed.responseType }
    }
    return { responseType: "simpleResponse" }
  } catch {
    // If parsing fails, default to simpleResponse
    return { responseType: "simpleResponse" }
  }
}

/**
 * Generate an AI-based response to a WhatsApp thread of messages.
 * If userPrompt is provided, it will be passed as a user-level instruction in addition to the system prompt.
 */
export async function generateAgentResponse(threadMessages: ThreadMessage[], userPrompt?: string): Promise<string> {
  const messages = threadMessages.map((msg) => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" : "user",
    content: msg.content,
  }));

  // Extract the latest user's name (not the agent)
  const userName = [...threadMessages]
    .reverse()
    .find((msg) => msg.sender_number !== process.env.A1BASE_AGENT_NUMBER!)?.sender_name;

  if (!userName) {
    throw new Error("User's name not found");
  }

  // Build the conversation to pass to OpenAI
  const conversation = [
    { role: "system", content: getSystemPrompt(userName) },
  ];

  // If there's a user-level prompt from basicWorkflowsPrompt, add it as a user message
  if (userPrompt) {
    conversation.push({ role: "user", content: userPrompt });
  }

  // Then add the actual chat messages
  conversation.push(...messages);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: conversation,
  });

  const content = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response";

  // Try parsing as JSON to extract just the "message"
  try {
    const data = JSON.parse(content);
    return data.message || "No message found.";
  } catch (error) {
    // If not valid JSON, just return the entire text
    return content;
  }
}

/**
 * Generate an email (subject/body) from a series of thread messages.
 * If userPrompt is provided, it will be added as an extra instruction.
 */
export async function generateEmailFromThread(threadMessages: ThreadMessage[], userPrompt?: string): Promise<{
  recipientEmail: string;
  emailContent: {
    subject: string;
    body: string;
  } | null;
}> {
  // Find an email address in the last message
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const lastMessage = threadMessages[threadMessages.length - 1];
  const emailMatch = lastMessage.content.match(emailRegex);
  
  if (!emailMatch) {
    return {
      recipientEmail: "",
      emailContent: null
    };
  }

  const recipientEmail = emailMatch[0];
  
  // Grab a small slice of the conversation as context
  const relevantMessages = threadMessages.slice(-3).map((msg) => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" : "user",
    content: msg.content,
  }));

  // System prompt for generating a subject line and body
  const emailPrompt = `
You are a professional email composer. Generate a subject line and email body based on the conversation context provided.
The email should be professional but maintain a conversational tone.
Format your response exactly as follows:
SUBJECT: <subject line>
BODY: <email body>
`;

  // Build conversation
  const conversation = [{ role: "system", content: emailPrompt }];

  // If there's a user-level prompt from basicWorkflowsPrompt, add it
  if (userPrompt) {
    conversation.push({ role: "user", content: userPrompt });
  }

  // Add the last few relevant messages
  conversation.push(...relevantMessages);

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: conversation,
  });

  const response = completion.choices[0].message?.content;
  
  if (!response) {
    return {
      recipientEmail,
      emailContent: null
    };
  }

  // Parse out SUBJECT and BODY from the raw text
  const subjectMatch = response.match(/SUBJECT:\s*(.*)/);
  const bodyMatch = response.match(/BODY:\s*([\s\S]*)/);

  return {
    recipientEmail,
    emailContent: {
      subject: subjectMatch?.[1]?.trim() || "No subject",
      body: bodyMatch?.[1]?.trim() || "No body content",
    }
  };
}