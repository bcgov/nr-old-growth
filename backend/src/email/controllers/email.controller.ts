import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { CreateEmailDto } from '../dto/create-email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private EmailService: EmailService) {}

  @Post()
  create(@Body() createEmailDto: CreateEmailDto) {
    return this.EmailService.create(createEmailDto);
  }
}
