import { ApiProperty } from '@nestjs/swagger';

export class Record {
  @ApiProperty({
    description: 'The unique identity number of the request',
    example: '1',
  })
  id: number;

  @ApiProperty({
    description: 'The username who submits the request',
    example: 'Peter Greem',
  })
  username: string;

  @ApiProperty({
    description: 'Current status of the request',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Submittion date of the request',
    example: new Date(),
  })
  submission_date: Date;

  @ApiProperty({
    description: 'The file uploaded with the request',
    example: 'map file',
  })
  file: string;
}
