import { PartialType } from '@nestjs/mapped-types';
import { PickType } from '@nestjs/swagger';
import { CreateRecordDto } from './create-record.dto';
import { RecordDto } from './record.dto';

// export class UpdateRecordDto extends PartialType(CreateRecordDto) {}
export class UpdateRecordDto extends PickType(RecordDto, ['status'] as const) {}
