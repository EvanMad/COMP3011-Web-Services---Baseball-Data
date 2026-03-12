import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Change return type to an object
  getStatus(): { STATUS: string } {
    return { STATUS: 'UP' };
  }
}
