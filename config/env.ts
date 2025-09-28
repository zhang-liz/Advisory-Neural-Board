/**
 * Unified Environment Configuration
 * 
 * This module provides type-safe access to environment variables
 * across both frontend and backend components.
 */

// Frontend environment variables (from .env.local)
export const frontendEnv = {
  copilotCloudPublicApiKey: process.env.COPILOT_CLOUD_PUBLIC_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  nextPublicUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
} as const;

// Backend environment variables (from agent/.env)
export const backendEnv = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  composioApiKey: process.env.COMPOSIO_API_KEY || '',
  composioGoogleSheetsAuthConfigId: process.env.COMPOSIO_GOOGLESHEETS_AUTH_CONFIG_ID || '',
  composioUserId: process.env.COMPOSIO_USER_ID || 'default',
  composioToolIds: process.env.COMPOSIO_TOOL_IDS || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  agentPort: process.env.AGENT_PORT || '9000',
} as const;

// Validation functions
export function validateFrontendEnv(): string[] {
  const errors: string[] = [];
  
  // Optional validations for frontend
  if (!frontendEnv.copilotCloudPublicApiKey) {
    console.warn('COPILOT_CLOUD_PUBLIC_API_KEY is not set (optional for local development)');
  }
  
  return errors;
}

export function validateBackendEnv(): string[] {
  const errors: string[] = [];
  
  if (!backendEnv.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required but not set');
  }
  
  if (!backendEnv.composioApiKey) {
    console.warn('COMPOSIO_API_KEY is not set (required for Google Sheets integration)');
  }
  
  return errors;
}

// Utility to check if running in development
export const isDevelopment = frontendEnv.nodeEnv === 'development';
export const isProduction = frontendEnv.nodeEnv === 'production';

// Agent server URL for frontend API calls
export const agentServerUrl = `http://127.0.0.1:${backendEnv.agentPort}`;

// Export combined environment for convenience
export const env = {
  ...frontendEnv,
  ...backendEnv,
  isDevelopment,
  isProduction,
  agentServerUrl,
} as const;

// Type definitions
export type FrontendEnv = typeof frontendEnv;
export type BackendEnv = typeof backendEnv;
export type Env = typeof env;