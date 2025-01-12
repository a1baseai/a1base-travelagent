# 🤖 A1Base AI Chat Agent Template

A professional, production-ready template for building AI-powered chat agents using [A1Base](https://a1base.com) and [Next.js](https://nextjs.org). This template enables multi-channel communication through WhatsApp, Email, Slack, Teams, and SMS, with a focus on WhatsApp integration.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-Powered-blue)](https://openai.com)
[![A1Base](https://img.shields.io/badge/A1Base-Integration-green)](https://a1base.com)

</div>

## ✨ Features

- **🧠 Advanced AI Integration** - Powered by OpenAI's latest models
- **📱 Multi-Channel Support** - WhatsApp, Email, Slack, Teams, and SMS
- **💾 Persistent Chat History** - Complete message tracking and storage
- **⚡ Modern Architecture** - Built on Next.js 14 for optimal performance
- **🔐 Secure Configuration** - Environment-based security setup
- **📦 Quick Deployment** - Simple npm-based installation

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- A1Base account with API credentials
- OpenAI API key
- WhatsApp business number (via A1Base)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/a1base-ai-agent
   cd a1base-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   A1BASE_API_KEY=your_api_key            # From A1Base Dashboard
   A1BASE_API_SECRET=your_api_secret      # From A1Base Dashboard
   A1BASE_ACCOUNT_ID=your_account_id      # From A1Base Dashboard
   A1BASE_AGENT_NUMBER=your_agent_number  # From A1Base Dashboard
   A1BASE_AGENT_NAME=your_agent_name      # From A1Base Dashboard
   OPENAI_API_KEY=your_openai_key      # From OpenAI Dashboard
   ```

4. **Set up A1Base credentials**
   - Register at [A1Base Dashboard](https://dashboard.a1base.com)
   - Access Settings > API Keys for credentials
   - Locate Account ID in Dashboard overview
   - Configure WhatsApp business number

5. **Launch development server**
   ```bash
   npm run dev
   ```

Your agent will be available at `http://localhost:3000`

## 🔧 Webhook Configuration

### Setting up Message Reception

1. **Expose Local Server**
   ```bash
   ngrok http 3000
   ```

2. **Configure A1Base Webhook**
   - Navigate to Settings > Webhooks in A1Base Dashboard
   - Set Webhook URL: `https://your-ngrok-url/api/whatsapp/incoming`
   - Save configuration

3. **Verify Setup**
   - Send test message to WhatsApp business number
   - Confirm AI response
   - Review console logs for debugging

## 🔑 Environment Variables

| Variable | Purpose | Source |
|----------|---------|--------|
| `A1BASE_API_KEY` | API Authentication | A1Base Dashboard > Settings > API Keys |
| `A1BASE_API_SECRET` | API Security | A1Base Dashboard > Settings > API Keys |
| `A1BASE_ACCOUNT_ID` | Account Identification | A1Base Dashboard > Overview |
| `A1BASE_AGENT_NUMBER` | Agent Number | A1Base Dashboard > Overview |
| `A1BASE_AGENT_NAME` | Agent Name | A1Base Dashboard > Overview |
| `OPENAI_API_KEY` | AI Integration | [OpenAI Dashboard](https://platform.openai.com/api-keys) |

## 🛠️ Customization

- **AI Response Logic**: Modify `lib/agent/prompt.ts` and `lib/services/openai.ts`
- **Message Handling**: Update `lib/agent/handle-whatsapp-incoming.ts`
- **Interface**: Customize `app/page.tsx`

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **A1Base Integration**: [Documentation](https://docs.a1base.com)
- **Template Issues**: [GitHub Issues](https://github.com/yourusername/a1base-ai-agent/issues)
- **General Inquiries**: [A1Base Support](https://a1base.com/support)

---

<div align="center">
Made with ❤️ by the A1Base Community
</div>