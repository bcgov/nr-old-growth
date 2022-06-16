import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NaturalResourceDistCodeService } from '../services/naturalResourceDistCode.service';

@ApiTags('Natural Resource District Code')
@Controller('naturalResourceDistCode')
export class NaturalResourceDistController {
  constructor(private readonly naturalResourceDistCodeService: NaturalResourceDistCodeService) {}

  @Get('/findAllActive')
  findAllActive() {
      return this.naturalResourceDistCodeService.findAllActive();
  }

}
