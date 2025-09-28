# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Advisory Neural Board is a hackathon project that appears to be focused on creating an AI-powered advisory system. This is a new repository with no existing codebase.

## Development Setup

Since this is a new project, you'll likely need to initialize the development environment based on the technology stack chosen. Common setups for AI/ML projects include:

### Python/ML Stack
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### Node.js Stack
```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

## Project Structure Guidelines

For an Advisory Neural Board project, consider organizing code into:
- `/backend` or `/api` - API server and business logic
- `/frontend` or `/web` - User interface components
- `/models` or `/ml` - Machine learning models and training scripts
- `/data` - Data processing and storage utilities
- `/config` - Configuration files and environment settings
- `/docs` - Project documentation
- `/tests` - Test files and test utilities

## Common Commands

Once the project structure is established, update this section with:
- Build commands
- Test commands
- Linting and formatting commands
- Deployment commands
- Database migration commands (if applicable)

## Architecture Notes

As the project develops, document:
- High-level system architecture
- Data flow between components
- API design patterns
- Model serving architecture
- Integration patterns with external services

## Development Workflow

Document team-specific workflows such as:
- Branch naming conventions
- Code review process
- Testing requirements
- Deployment process

---

*This WARP.md file should be updated as the project evolves and code is added to the repository.*