import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormService } from '../services/form.service';

@ApiTags('form')
@Controller('form')
export class FormController {
  constructor(private formService: FormService) {}

  @Get(':emailTo')
  get(@Param('emailTo') emailTo: string) {
    return this.formService.handleIDIRForm(emailTo);
  }
}
