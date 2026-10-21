import { Injectable, Logger } from '@nestjs/common';
import { ChesService } from './ches/services/ches.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private chesService: ChesService) {}
  getHello(): string {
    return 'Ok';
  }

  getToken() {
    return this.chesService.getToken().then(() => {
      this.logger.debug('CHES token retrieved successfully');
      return 'Ok';
    });
  }
}

