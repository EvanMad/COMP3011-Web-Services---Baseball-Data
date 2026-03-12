import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

/**
 * Minimal MCP tool for infrastructure verification.
 * Expose more tools here as needed.
 */
@Injectable()
export class HealthTool {
  @Tool({
    name: 'health',
    description: 'Check MCP server health. Returns a simple status.',
    parameters: z.object({}),
  })
  async check(): Promise<string> {
    return 'ok';
  }
}
