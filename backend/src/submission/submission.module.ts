import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutblockSubmissionDetailsEntity } from 'src/cutblockSubmissionDetails/entities/cutblockSubmissionDetails.entity';
import { SubmissionController } from './controllers/submission.controller';
import { SubmissionEntity } from './entities/submission.entity';
import { SubmissionService } from './services/submission.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SubmissionEntity,
      CutblockSubmissionDetailsEntity,
    ]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
