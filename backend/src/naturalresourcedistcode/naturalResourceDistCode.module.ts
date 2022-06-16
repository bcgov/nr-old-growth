import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaturalResourceDistController } from './controllers/naturalResourceDistCode.controller';
import { NaturalResourceDistCodeEntity } from './entities/naturalResourceDistCode.entity';
import { NaturalResourceDistCodeService } from './services/naturalResourceDistCode.service';

@Module({
  imports: [TypeOrmModule.forFeature([NaturalResourceDistCodeEntity])],
  controllers: [NaturalResourceDistController],
  providers: [NaturalResourceDistCodeService]
})
export class NaturalResourceDistModule {}
