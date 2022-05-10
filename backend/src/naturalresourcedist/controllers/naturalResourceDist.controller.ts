import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NaturalResourceDistService } from '../services/naturalResourceDist.service';

@ApiTags('Natural Resource District')
@Controller('naturalResourceDist')
export class NaturalResourceDistController {
  constructor(private readonly naturalResourceDistService: NaturalResourceDistService) {}

  @Get()
  findAll() {
      return this.naturalResourceDistService.findAllActive();
  }

}
