import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { Records } from './entities/records.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Records])],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
