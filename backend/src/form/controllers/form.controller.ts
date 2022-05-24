import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { FormService } from '../services/form.service';

@ApiTags('form')
@Controller('form')
export class FormController {
  constructor(private formService: FormService) { }

  @Get(':emailTo')
  get(@Param('emailTo') emailTo: string) {
    return this.formService.handleIDIRForm(emailTo);
  }

  @Post()
  create(@Body() emailSubmissionLog: EmailSubmissionLog): Observable<EmailSubmissionLog> {
    return this.formService.postEmailSubmissionLog(emailSubmissionLog);
  }

}
