import { PickType } from '@nestjs/swagger';
import { RecordDto } from './record.dto';

export class CreateRecordDto extends PickType(RecordDto, [
  'username',
  'file',
] as const) {}
