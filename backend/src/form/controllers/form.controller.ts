import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormService } from '../services/form.service';

@ApiTags('form')
@Controller('form')
export class FormController {
  constructor(private FormService: FormService) {}

  @Get(':emailTo')
  get(@Param('emailTo') emailTo: string) {
    return this.FormService.handleSubmission(emailTo);
  }
}
