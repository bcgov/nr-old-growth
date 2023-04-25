import { Injectable } from '@nestjs/common';
import { ChesService } from './ches/services/ches.service';

@Injectable()
export class AppService {
  constructor(private chesService: ChesService) { }
  getHello(): string {
    return 'Ok';
  }

  getToken() {
    return this.chesService.getToken().then((response) => {
      console.log(response);
      return 'Ok';
    });
  }
}
