import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EmailSubmissionLogEntity } from '../entities/emailSubmissionLog.entity';
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

  @Get('/findOne/:confirmationId')
  findEmailSubmissionLog(@Param('confirmationId') confirmationId: string) {
    return this.formService.findEmailSubmissionLog(confirmationId);
  }

  @Post('/update')
  updateEmailSubmissionLog(
    @Body() emailSubmissionLog: EmailSubmissionLogEntity,
  ) {
    return this.formService.updateEmailSubmissionLog(
      emailSubmissionLog.confirmationId,
      emailSubmissionLog.emailType,
      emailSubmissionLog,
    );
  }

  @Post()
  create(@Body() emailSubmissionLog: EmailSubmissionLog) {
    return this.formService.postEmailSubmissionLog(emailSubmissionLog);
  }

  @Get('/getAllEmailSubmissionLogs')
  findAllEmailSubmissionLogs() {
    return this.formService.findAllEmailSubmissionLogs();
  }
}
