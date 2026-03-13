# OmniAgent - Autonomous Multi-Agent AI System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com/)

> **One sentence. Five AI agents. One verified report.**

OmniAgent is an autonomous multi-agent AI system where specialized AI agents collaborate, cross-verify, and deliver expert-level structured reports with real-world actions like saving to Notion and searching the live web.

![OmniAgent Dashboard](https://placeholder-for-screenshot.png)

## Problem Statement

**AIML-I5 - Autonomous Multi-Agent AI System for End-to-End Intelligent Decision Automation**

Built for **HackJKLU v5.0**

## What Makes OmniAgent Different

| Feature | ChatGPT/Claude | OmniAgent |
|---------|---------------|-----------|
| Architecture | Single model | 5 specialized agents |
| Collaboration | None | Parallel execution with cross-verification |
| Quality Control | None | Critic agent with confidence scoring |
| Self-Healing | None | Auto-retry when quality < threshold |
| Real-World Actions | None | Notion integration, web search, file reading |
| Transparency | Black box | Live activity feed with full visibility |
| Confidence Score | None | 1-10 scoring on every output |

## System Architecture

```
User Input (Goal)
    ↓
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  Dashboard → New Task → Live Feed → Reports → Settings      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP + WebSocket
┌─────────────────────────▼───────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│         Orchestrator → Agent Manager → MCP Router           │
└──────┬──────────┬──────────┬──────────┬─────────────────────┘
       │          │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
  │Planner │ │Research│ │Analyst │ │ Writer │
  │ Agent  │ │ Agent  │ │ Agent  │ │ Agent  │
  └────────┘ └───┬────┘ └───┬────┘ └───┬────┘
                 │          │          │
          ┌──────▼──────────▼──────────▼──────┐
          │          Critic Agent              │
          │  (scores output, triggers retries) │
          └──────────────────┬─────────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │           MCP Servers               │
          │  Web Search | Notion | File System  │
          └─────────────────────────────────────┘
```

## Five Specialized Agents

### 1. Planner Agent
- **Role**: Goal Decomposer and Task Orchestrator
- **Input**: Raw user goal (plain English)
- **Output**: JSON list of 3-5 structured subtasks
- **Function**: Breaks complex goals into actionable steps

### 2. Researcher Agent
- **Role**: Real-Time Information Gatherer
- **Tools**: Serper Web Search MCP, File System MCP
- **Output**: Raw research findings with cited sources
- **Function**: Never fabricates facts, always cites URLs

### 3. Analyst Agent
- **Role**: Data Processor and Insight Extractor
- **Input**: Raw research findings
- **Output**: Structured analysis with key insights
- **Function**: Identifies patterns, risks, opportunities

### 4. Writer Agent
- **Role**: Report Generator
- **Input**: Structured analysis
- **Output**: Final markdown report
- **Function**: Generates professional reports with clear recommendations

### 5. Critic Agent
- **Role**: Quality Controller and Self-Healing Trigger
- **Input**: Final report + original goal
- **Output**: Quality score (1-10) + feedback
- **Function**: Auto-retry if score < 7, max 3 retries

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.0 | React framework |
| React | 18.3.0 | UI library |
| TypeScript | 5.4.0 | Type safety |
| Tailwind CSS | 3.4.0 | Styling |
| Framer Motion | 11.2.0 | Animations |
| Socket.IO Client | 4.7.0 | Real-time updates |
| shadcn/ui | latest | UI components |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Core language |
| FastAPI | 0.111.0 | REST API + WebSocket |
| Uvicorn | 0.30.0 | ASGI server |
| Groq | latest | Ultra-fast LLM API |
| ChromaDB | 0.5.0 | Vector memory |
| python-socketio | 5.11.0 | WebSocket server |

### External APIs
| API | Usage | Free Tier |
|-----|-------|-----------|
| Groq API | LLM backbone | 14,400 req/day |
| Serper API | Google search | 2,500 searches/month |
| Notion API | Report storage | Free |

## Project Structure

```
omni-agent/
├── app/                          # Next.js App Router
│   ├── (landing)/               # Landing page routes
│   ├── auth/                    # Authentication page
│   ├── dashboard/               # Dashboard routes
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Main dashboard
│   │   ├── new-task/           # Create new task
│   │   ├── jobs/               # Active jobs monitoring
│   │   ├── reports/            # Generated reports
│   │   └── settings/           # API keys & configuration
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── agent/                   # Agent visualization
│   │   ├── agent-pipeline.tsx  # Full pipeline view
│   │   ├── activity-feed.tsx   # Live activity feed
│   │   └── agent-network.tsx   # Network graph
│   ├── landing/                 # Landing page sections
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── utils.ts
│   └── websocket.ts            # WebSocket hook & context
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
├── styles/
├── next.config.mjs
├── package.json
├── tsconfig.json
└── .gitignore
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Git

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yugjain1212/Hackjklu-OmniAgents.git
cd Hackjklu-OmniAgents

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Backend Setup (Coming Soon)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run server
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

## Environment Variables

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

Create `.env` in the backend folder:

```env
# LLM
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Search
SERPER_API_KEY=your_serper_api_key_here

# Notion MCP
NOTION_API_KEY=your_notion_integration_token
NOTION_PAGE_ID=your_target_notion_page_id

# ChromaDB
CHROMA_PERSIST_DIR=./chroma_db

# App
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
MAX_RETRY_ATTEMPTS=3
CONFIDENCE_THRESHOLD=7.0
```

## Features

### Dashboard
- Real-time agent status monitoring
- System health indicators
- Recent activity overview
- Quick stats and metrics

### New Task
- Goal input with file upload
- Live agent pipeline visualization
- Real-time progress tracking
- Confidence scoring display

### Active Jobs
- Running job monitoring
- Agent activity feed
- Pause/resume/cancel controls
- Progress tracking

### Reports
- Searchable report history
- Confidence score filtering
- Notion integration
- Download and share

### Settings
- API key management
- Agent configuration
- Notification preferences
- System status

## WebSocket Events

The system emits these real-time events:

```typescript
// Agent starts working
{ type: "agent_start", agent: "researcher", message: "...", timestamp: "..." }

// Agent completes
{ type: "agent_complete", agent: "analyst", confidence: 8.5, message: "..." }

// Critic rejects
{ type: "critic_reject", score: 5.5, reason: "...", timestamp: "..." }

// Critic approves
{ type: "critic_approve", final_confidence: 9.1, message: "..." }

// Notion saved
{ type: "notion_saved", notion_url: "...", timestamp: "..." }

// Pipeline complete
{ type: "pipeline_complete", job_id: "...", total_time_seconds: 47 }
```

## Confidence Scoring

Each agent self-scores its output (1-10):

| Agent | Criteria | Weight |
|-------|----------|--------|
| Researcher | Sources found, data freshness, diversity | 3+2+2+3 |
| Analyst | Insights count, citations, risks flagged | 2+3+2+3 |
| Writer | Goal answered, structure, recommendation | 4+2+2+2 |
| Critic | Accuracy, completeness, relevance, clarity | 1-10 |

**Threshold**: Score >= 7.0 → Approve | Score < 7.0 → Retry

## Demo Query

Try this example query:

> "Research whether a 22-year-old should start a fintech startup in India in 2026. Analyze competitors, market opportunity, risks, and give me a go/no-go recommendation."

**Expected Output**:
- Structured report with 5 sections
- 12+ cited sources
- Clear YES/NO/MAYBE recommendation
- Confidence score: 9.0+
- Saved to Notion
- Completion time: ~60 seconds

## Development Roadmap

- [x] Landing page with 5-agent showcase
- [x] Authentication system
- [x] Dashboard with sidebar navigation
- [x] New Task page with live pipeline
- [x] Active Jobs monitoring
- [x] Reports history
- [x] Settings page
- [x] WebSocket integration
- [x] Agent visualization components
- [ ] Backend FastAPI implementation
- [ ] Real LLM integration (Groq)
- [ ] MCP server integration
- [ ] ChromaDB memory
- [ ] Production deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is built for **HackJKLU v5.0** - Problem: AIML-I5

## Team

- **GitHub**: [@yugjain1212](https://github.com/yugjain1212)
- **Project**: [Hackjklu-OmniAgents](https://github.com/yugjain1212/Hackjklu-OmniAgents)

## Acknowledgments

- [Groq](https://groq.com/) for ultra-fast LLM inference
- [CrewAI](https://crewai.com/) for multi-agent orchestration inspiration
- [MCP](https://modelcontextprotocol.io/) for context protocol
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [HackJKLU](https://hackjklu.com/) for the hackathon platform

---

**Built with ❤️ for HackJKLU v5.0**
