import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormService } from './services/form.service';
import { EmailModule } from '../email/email.module';
import { EmailSubmissionLogEntity } from './entities/emailSubmissionLog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailSubmissionLogEntity]),
    EmailModule,
  ],
  providers: [FormService],
})
export class FormModule {}
