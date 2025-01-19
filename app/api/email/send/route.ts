import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch(`https://api.a1base.com/v1/accounts/${process.env.A1BASE_ACCOUNT_ID}/emails/send`, {
            method: 'POST',
            headers: {
                'X-API-Key': process.env.A1BASE_API_KEY!,
                'X-API-Secret': process.env.A1BASE_API_SECRET!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender_address: body.sender_address,
                recipient_address: body.recipient_address,
                subject: body.subject,
                body: body.body,
                headers: body.headers || {},
                attachment_uri: body.attachment_uri || ""
            })
        });

        if (!response.ok) {
            throw new Error(`A1Base API error: ${response.status}`);
        }

        const result = await response.json();
        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("[API] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}