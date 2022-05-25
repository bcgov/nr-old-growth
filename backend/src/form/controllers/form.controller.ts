import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { FormService } from '../services/form.service';

@ApiTags('form')
@Controller('form')
export class FormController {
  constructor(private formService: FormService) {}

  @Get('/idir/:idirEmailTo')
  sendIdirEmail(@Param('idirEmailTo') idirEmailTo: string) {
    return this.formService.handleIDIRForm(idirEmailTo);
  }

  @Get('/bceid/:bceidEmailTo')
  sendBceidEmail(@Param('bceidEmailTo') bceidEmailTo: string) {
    return this.formService.handleBCEIDForm(bceidEmailTo);
  }

  @Post()
  create(
    @Body() emailSubmissionLog: EmailSubmissionLog,
  ): Observable<EmailSubmissionLog> {
    return this.formService.postEmailSubmissionLog(emailSubmissionLog);
  }

  @Get()
  findAllEmailSubmissionLogs() {
    return this.formService.findAllEmailSubmissionLogs();
  }
}
