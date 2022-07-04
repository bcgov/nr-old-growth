import { Module } from '@nestjs/common';
import { CutblockSubmissionDetailsController } from './controllers/cutblockSubmissionDetails.controller';
import { CutblockSubmissionDetailsService } from './services/cutblockSubmissionDetails.service';

@Module({
  controllers: [CutblockSubmissionDetailsController],
  providers: [CutblockSubmissionDetailsService]
})
export class CutblockSubmissiondetailsModule {}
