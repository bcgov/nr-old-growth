import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FormService } from './services/form.service';
import { FormController } from './controllers/form.controller';
import { EmailModule } from '../email/email.module';
import { EmailSubmissionLogEntity } from './entities/emailSubmissionLog.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([EmailSubmissionLogEntity]),
    EmailModule,
  ],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
