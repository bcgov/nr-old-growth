import { Injectable } from '@nestjs/common';
import { EmailEntity } from '../model/email.entity';
import { ChesService } from '../../ches/services/ches.service';

@Injectable()
export class EmailService {
  constructor(private chesService: ChesService) { }

  sendEmail(email: EmailEntity) {
    return this.chesService.sendEmail(email);
  }
}
