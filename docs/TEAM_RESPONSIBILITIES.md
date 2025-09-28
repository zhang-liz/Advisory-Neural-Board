Team Responsibilities - Advisory Neural Board

Project Overview
Advisory Neural Board is an AI-powered canvas application that demonstrates bidirectional state synchronization between a Next.js frontend and a Python LlamaIndex agent, with external Google Sheets integration via Composio API.

Team Member Responsibilities

Team Member 1: Frontend Architecture & AI Integration
Primary Focus: Next.js Frontend, CopilotKit Integration, and User Experience

Key Responsibilities:
Frontend Framework & State Management
- Built the complete Next.js 15 application with React 19 and TypeScript
- Implemented useCoAgent hook for real-time state synchronization with the AI agent
- Created the main canvas interface in src/app/page.tsx (1,700+ lines of complex state management)
- Designed the responsive grid layout for the visual canvas

CopilotKit Integration & AI Actions
- Implemented 20+ useCopilotAction hooks for frontend tool exposure to the AI agent
- Created bidirectional communication between UI and Python agent via CopilotKit Runtime
- Built Human-in-the-Loop (HITL) system using renderAndWaitForResponse for AI disambiguation
- Developed real-time chat interface with CopilotChat and CopilotPopup components

Card System & UI Components
- Designed and implemented 4 distinct card types (Project, Entity, Note, Chart) in CardRenderer.tsx
- Created complex field schemas with different input types (text, select, date, checklist, tags)
- Built interactive components for checklist management, metric editing, and tag selection
- Implemented visual progress tracking for multi-step AI operations

Google Sheets Frontend Integration
- Created API routes in src/app/api/sheets/ for sheet operations (sync, create, import, list)
- Built frontend-to-backend communication layer for Google Sheets synchronization
- Implemented automatic state debouncing and sync triggers

Technologies Used:
- CopilotKit: @copilotkit/react-core, @copilotkit/react-ui, @copilotkit/runtime
- Next.js 15: App Router, Server Components, API Routes
- React 19: Hooks, State Management, Component Architecture
- TypeScript: Type safety and interface definitions
- Tailwind CSS + shadcn/ui: Component library and styling system

Team Member 2: Backend AI Agent & External Integrations
Primary Focus: Python LlamaIndex Agent, Composio Integration, and External APIs

Key Responsibilities:
LlamaIndex AG-UI Agent Development
- Built the complete Python agent in agent/agent/agent.py using LlamaIndex AG-UI framework
- Implemented workflow context management and event streaming with LlamaIndex Context
- Created backend tool system for plan management, progress tracking, and external integrations
- Designed the agent's field schema system for strict data validation

Composio Integration & External APIs
- Integrated Composio API for external tool orchestration in sheets_integration.py
- Implemented Google Sheets API integration with authentication and data synchronization
- Created dynamic tool loading system based on environment configuration
- Built intelligent type detection for importing data from Google Sheets

FastAPI Server & Backend Architecture
- Developed the FastAPI server in agent/agent/server.py with proper error handling
- Created RESTful endpoints for Google Sheets operations (/sync-to-sheets, /create-sheet, etc.)
- Implemented environment variable management and configuration loading
- Built the communication bridge between frontend and external services

AI Agent Logic & State Management
- Designed the shared state architecture as ground truth between frontend and agent
- Implemented loop control and idempotency patterns to prevent infinite AI loops
- Created the planning system for multi-step AI operations with status tracking
- Built intelligent disambiguation and context awareness for AI decision-making

Technologies Used:
- LlamaIndex: llama-index-core, llama-index-llms-openai, llama-index-protocols-ag-ui
- Composio: composio, composio-llamaindex for external tool integration
- FastAPI: REST API server with Pydantic models and HTTP exception handling
- OpenAI GPT-4o: LLM integration for AI agent reasoning
- Python 3.9+: Core backend language with uv package management

Shared Responsibilities & Collaboration

Architecture Design & Integration
- Both team members collaborated on the bidirectional state synchronization architecture
- Shared responsibility for the CopilotKit Runtime configuration and agent communication
- Joint design of the card type system and field schemas across frontend and backend
- Collaborative debugging of real-time state synchronization issues

Testing & Quality Assurance
- Both team members contributed to the comprehensive test suite (6/6 test categories passed)
- Shared responsibility for performance optimization and bundle size management
- Joint effort in cross-browser compatibility testing and responsive design validation
- Collaborative documentation and troubleshooting guide creation

External Tool Integration
- Team Member 1 handled frontend API routes and user interface for Google Sheets
- Team Member 2 implemented backend Composio integration and external API calls
- Shared responsibility for the complete Google Sheets synchronization workflow
- Joint effort in error handling and authentication flow management

Key Sponsor Tools & APIs Used

CopilotKit (Primary Sponsor Tool)
- Frontend Integration: @copilotkit/react-core for state management and AI actions
- UI Components: @copilotkit/react-ui for chat interface and user interactions
- Runtime: @copilotkit/runtime for bidirectional communication with Python agent
- Specific Features: Real-time state sync, HITL disambiguation, tool exposure system

LlamaIndex (Primary Sponsor Tool)
- AG-UI Framework: llama-index-protocols-ag-ui for agent workflow management
- Core Integration: llama-index-core for tool system and context management
- OpenAI Integration: llama-index-llms-openai for GPT-4o model integration
- Specific Features: Workflow context, event streaming, tool orchestration

Composio (External Integration)
- Tool Integration: composio and composio-llamaindex for external service connections
- Google Sheets API: Full CRUD operations, authentication, and data synchronization
- Dynamic Tool Loading: Environment-based tool configuration and discovery
- Specific Features: Bidirectional Google Sheets sync, intelligent data type detection

Additional APIs & Technologies
- Google Sheets API: Via Composio integration for spreadsheet operations
- OpenAI API: GPT-4o for AI agent reasoning and natural language processing
- Next.js 15: App Router, Server Components, and API Routes
- FastAPI: Python backend server with RESTful endpoints

Project Impact & Innovation

This project demonstrates a first-of-its-kind bidirectional AI synchronization system where:
- The frontend and AI agent maintain perfect state consistency through shared state architecture
- Real-time updates flow seamlessly between user interactions and AI operations
- External tool integration (Google Sheets) works transparently through the AI agent
- Human-in-the-Loop interactions provide intelligent disambiguation when needed

The architecture successfully addresses all hackathon judging criteria with concrete evidence of functionality, innovation, and real-world applicability in AI-human collaboration systems.
