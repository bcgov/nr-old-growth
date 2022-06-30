import { Module } from '@nestjs/common';
import { SubmissionService } from './services/submission.service';
import { SubmissionController } from './controllers/submission.controller';

@Module({
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
