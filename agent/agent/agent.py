"""
Main Agent Module

This is the refactored main agent module that uses modular components
for better organization and maintainability.
"""

from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.protocols.ag_ui.router import get_ag_ui_workflow_router

# Load environment variables early to support local development via .env
load_dotenv()

# Import our modular components
from .config import SYSTEM_PROMPT, INITIAL_STATE, get_openai_model
from .frontend_tools import FRONTEND_TOOLS
from .backend_tools import create_backend_tools


def create_agent():
    """Create and configure the LlamaIndex agent."""
    
    # Load backend tools
    backend_tools = create_backend_tools()
    print(f"Backend tools loaded: {len(backend_tools)} tools")
    
    # Create the agent router
    agent_router = get_ag_ui_workflow_router(
        llm=OpenAI(model=get_openai_model()),
        frontend_tools=FRONTEND_TOOLS,
        backend_tools=backend_tools,
        system_prompt=SYSTEM_PROMPT,
        initial_state=INITIAL_STATE,
    )
    
    return agent_router


# Create the main agent instance
agentic_chat_router = create_agent()