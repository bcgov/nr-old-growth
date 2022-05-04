import { ApiProperty } from '@nestjs/swagger';

export class EmailEntity {
  @ApiProperty({
    example: 'Hello World',
    description: 'The email body',
  })
  emailBody?: string;

  @ApiProperty({
    example: [],
    description: 'The attachments will send in the email',
  })
  emailAttachments?: Array<Object>;
}
