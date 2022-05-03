import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NaturalResourceDistService } from '../services/naturalResourceDist.service';

@ApiTags('naturalresourcedist')
@Controller('naturalresourcedist')
export class NaturalResourceDistController {
  constructor(private readonly naturalResourceDistService: NaturalResourceDistService) {}

  @Get()
  findAll() {
      return this.naturalResourceDistService.findAll();
  }

}
