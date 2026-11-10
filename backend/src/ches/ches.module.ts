import { Module } from '@nestjs/common';
import { ChesService } from './services/ches.service';

@Module({
  providers: [ChesService],
  exports: [ChesService],
})
export class ChesModule { }
