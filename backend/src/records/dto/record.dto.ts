import { ApiProperty } from '@nestjs/swagger';

export class RecordDto {
  @ApiProperty({
    description: 'The unique identity number of the request',
    // default: '9999',
  })
  id: number;

  @ApiProperty({
    description: 'The username who submits the request',
    // default: 'username',
  })
  username: string;

  @ApiProperty({
    description: 'Current status of the request',
    default: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Submittion date of the request',
    default: new Date(),
  })
  submission_date: Date;

  @ApiProperty({
    description: 'The file uploaded with the request',
    default: 'map file',
  })
  file: string;
}
