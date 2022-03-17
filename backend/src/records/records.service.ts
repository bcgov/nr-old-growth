import { Injectable } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { Record } from './entities/record.entity';

@Injectable()
export class RecordsService {
  private records: Record[] = [];
  private totals: number = 0;

  create(record: CreateRecordDto): Record {
    // User here is the return type
    this.totals = this.totals + 1;
    const id = this.totals;
    const newRecored = {
      id,
      ...record,
      status: 'pending',
      submission_date: new Date(),
    };
    this.records.push(newRecored);
    return newRecored;
  }

  findAll() {
    return this.records;
  }

  findOne(id: number) {
    const foundRecord = this.records.filter((r) => r.id == id)[0];
    if (foundRecord)
      return `Found record id: ${id}, username: ${foundRecord.username}, status: ${foundRecord.status}, submission date: ${foundRecord.submission_date}`;
    else return `Record not found for id ${id}`;
  }

  update(id: number, updateRecordDto: UpdateRecordDto) {
    const foundIndex = this.records.findIndex((r) => r.id == id);
    this.records[foundIndex] = {
      ...this.records[foundIndex],
      ...updateRecordDto,
    };
    return `Updated record with id ${id}, new status is ${this.records[foundIndex].status}`;
  }

  remove(id: number) {
    this.records = this.records.filter((r) => {
      return r.id !== id;
    });

    return `Removed record with id ${id}`;
  }
}
