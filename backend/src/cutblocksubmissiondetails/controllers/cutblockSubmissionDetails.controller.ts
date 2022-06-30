import { Controller, Delete, Get, Param } from '@nestjs/common';
import { CutblockSubmissionDetailsService } from '../services/cutblockSubmissionDetails.service';

@Controller('cutblocksubmissiondetails')
export class CutblockSubmissionDetailsController {
  constructor(private readonly cutblockSubmissionDetailsService: CutblockSubmissionDetailsService) {}

  @Get()
  findAll() {
    return this.cutblockSubmissionDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cutblockSubmissionDetailsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cutblockSubmissionDetailsService.remove(+id);
  }
}
