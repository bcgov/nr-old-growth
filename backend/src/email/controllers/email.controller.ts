import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { EmailEntity } from '../model/email.entity';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post()
  create(@Body() createEmailDto: EmailEntity) {
    return this.emailService.sendEmail(createEmailDto);
  }
}
