import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FormService } from './services/form.service';
import { FormController } from './controllers/form.controller';

@Module({
  imports: [HttpModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
