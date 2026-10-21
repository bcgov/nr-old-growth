import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './services/email.service';
import { ChesService } from '../ches/services/ches.service';

@Module({
  imports: [HttpModule],
  providers: [EmailService, ChesService],
  exports: [EmailService],
})
export class EmailModule { }
