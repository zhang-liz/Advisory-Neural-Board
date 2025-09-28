"""
Backend Tools

This module contains backend tools that execute on the server side,
including Composio integration and Google Sheets functionality.
"""

import os
from typing import List, Any, Annotated
from llama_index.core.tools import FunctionTool


def load_composio_tools() -> List[Any]:
    """Dynamically load Composio tools for LlamaIndex if configured.

    Reads the following environment variables:
    - COMPOSIO_TOOL_IDS: comma-separated list of tool identifiers to enable
    - COMPOSIO_USER_ID: user/entity id to scope tools (defaults to "default")
    - COMPOSIO_API_KEY: required by Composio client; read implicitly by SDK

    Returns an empty list if not configured or if dependencies are missing.
    """
    tool_ids_str = os.getenv("COMPOSIO_TOOL_IDS", "").strip()
    if not tool_ids_str:
        return []

    # Import lazily to avoid hard runtime dependency if not used
    try:
        from composio import Composio  # type: ignore
        from composio_llamaindex import LlamaIndexProvider  # type: ignore
    except Exception as e:
        print(f"Failed to import Composio: {e}")
        return []

    user_id = os.getenv("COMPOSIO_USER_ID", "default")
    tool_ids = [t.strip() for t in tool_ids_str.split(",") if t.strip()]
    if not tool_ids:
        return []
    
    try:
        print(f"Loading Composio tools: {tool_ids} for user: {user_id}")
        composio = Composio(provider=LlamaIndexProvider())
        tools = composio.tools.get(user_id=user_id, tools=tool_ids)
        print(f"Successfully loaded {len(tools) if tools else 0} tools")
        # "tools" should be a list of LlamaIndex-compatible Tool objects
        return list(tools) if tools is not None else []
    except Exception as e:
        # Fail closed; backend tools remain empty if configuration is invalid
        print(f"Failed to load Composio tools: {e}")
        return []


def list_sheet_names(
    sheet_id: Annotated[str, "Google Sheets ID to list available sheet names from."]
) -> str:
    """List all available sheet names in a Google Spreadsheet."""
    try:
        from .sheets_integration import get_sheet_names
        
        sheet_names = get_sheet_names(sheet_id)
        if not sheet_names:
            return f"Failed to get sheet names from {sheet_id}. Please check the ID and ensure the sheet is accessible."
        
        return f"Available sheets in spreadsheet:\n" + "\n".join(f"- {name}" for name in sheet_names)
        
    except Exception as e:
        return f"Error listing sheets from {sheet_id}: {str(e)}"


def create_backend_tools() -> List[Any]:
    """Create and return all backend tools."""
    tools = []
    
    # Load Composio tools
    composio_tools = load_composio_tools()
    tools.extend(composio_tools)
    
    # Add custom backend tools
    sheet_list_tool = FunctionTool.from_defaults(
        fn=list_sheet_names,
        name="list_sheet_names",
        description="List all available sheet names in a Google Spreadsheet."
    )
    tools.append(sheet_list_tool)
    
    return tools