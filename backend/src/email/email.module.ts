import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ChesService } from '../ches/services/ches.service';

@Module({
  providers: [EmailService, ChesService],
  exports: [EmailService],
})
export class EmailModule { }
