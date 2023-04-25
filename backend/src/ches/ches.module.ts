import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChesService } from './services/ches.service';

@Module({
  imports: [HttpModule],
  providers: [ChesService],
  exports: [ChesService],
})
export class ChesModule { }
