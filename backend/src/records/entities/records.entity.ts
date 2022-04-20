import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Records {
  @ApiProperty({
    description: 'The unique identity number of the request',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The username who submits the request',
    example: 'Peter Greem',
  })
  @Column()
  username: string;

  @ApiProperty({
    description: 'Current status of the request',
    example: 'pending',
  })
  @Column()
  status: string;

  @ApiProperty({
    description: 'Submittion date of the request',
    example: new Date(),
  })
  @Column()
  submission_date: Date;

  @ApiProperty({
    description: 'The file uploaded with the request',
    example: 'map file',
  })
  @Column()
  file: string;

  constructor(
    username?: string,
    file?: string,
    status?: string,
    submission_date?: Date,
  ) {
    this.username = username || '';
    this.file = file || '';
    this.status = status || 'pending';
    this.submission_date = submission_date || new Date();
  }
}
