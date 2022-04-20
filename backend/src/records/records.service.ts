import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { Records } from './entities/records.entity';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Records)
    private recordsRepository: Repository<Records>,
  ) {}

  async create(record: CreateRecordDto): Promise<Records> {
    const newRecord = this.recordsRepository.create({
      ...record,
      status: 'pending',
      submission_date: new Date(),
    });
    await this.recordsRepository.save(newRecord);
    return newRecord;
  }

  async findAll(): Promise<Records[]> {
    return this.recordsRepository.find();
  }

  async findOne(id: number): Promise<Records> {
    return this.recordsRepository.findOneOrFail(id);
  }

  async update(id: number, updateUserDto: UpdateRecordDto): Promise<Records> {
    await this.recordsRepository.update({ id }, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.recordsRepository.delete(id);
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }
}
