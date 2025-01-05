import { AGENT_NUMBER } from "./chat-config";

export async function sendWhatsAppMessage(
  to: string,
  content: string
): Promise<void> {
  console.log("[WhatsApp] Sending message:", {
    to,
    content,
    from: AGENT_NUMBER,
  });

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
  };

  console.log("[WhatsApp] Request options:", {
    url: `https://api.a1base.com/v1/messages/individual/${process.env.A1BASE_ACCOUNT_ID}/send`,
    headers: options.headers,
    accountID: process.env.A1BASE_ACCOUNT_ID,
    body: JSON.parse(options.body),
  });

  const response = await fetch(
    `https://api.a1base.com/v1/messages/individual/${process.env.A1BASE_ACCOUNT_ID}/send`,
    options
  );

  console.log("[WhatsApp] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[WhatsApp] Error response:", errorText);
    throw new Error(`API request failed: ${errorText}`);
  }

  const responseData = await response.json();
  console.log("[WhatsApp] Response data:", responseData);
  return responseData;
}
