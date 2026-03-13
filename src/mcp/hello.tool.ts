import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { AppService } from '../app.service';

@Injectable()
export class HealthTool {
  constructor(private readonly appService: AppService) {}

  @Tool({
    name: 'health',
    description:
      'Returns the current health status of the Web Services API as a JSON object.',
  })
  getHealth(): { STATUS: string } {
    // Reuse the existing health logic from AppService
    return this.appService.getStatus();
  }
}
