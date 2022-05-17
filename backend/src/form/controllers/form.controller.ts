import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormService } from '../services/form.service';

@ApiTags('form')
@Controller('form')
export class FormController {
  constructor(private FormService: FormService) {}

  @Get()
  get() {
    return this.FormService.handleSubmission();
  }
}
