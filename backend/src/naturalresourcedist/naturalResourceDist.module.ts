import { Module } from '@nestjs/common';
import { NaturalResourceDistController } from './controllers/naturalResourceDist.controller';
import { NaturalResourceDistService } from './services/naturalResourceDist.service';

@Module({
  controllers: [NaturalResourceDistController],
  providers: [NaturalResourceDistService]
})
export class NaturalResourceDistModule {}
