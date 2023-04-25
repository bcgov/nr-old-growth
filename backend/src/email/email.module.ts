import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';
import { ChesService } from '../ches/services/ches.service';

@Module({
  imports: [HttpModule],
  controllers: [EmailController],
  providers: [EmailService, ChesService],
  exports: [EmailService],
})
export class EmailModule { }
