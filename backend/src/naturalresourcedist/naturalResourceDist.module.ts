import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaturalResourceDistController } from './controllers/naturalResourceDist.controller';
import { NaturalResourceDistEntity } from './entities/naturalResourceDist.entity';
import { NaturalResourceDistService } from './services/naturalResourceDist.service';

@Module({
  imports: [TypeOrmModule.forFeature([NaturalResourceDistEntity])],
  controllers: [NaturalResourceDistController],
  providers: [NaturalResourceDistService]
})
export class NaturalResourceDistModule {}
