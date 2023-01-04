import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailEntity {
  @ApiProperty({
    example: ['name@gov.bc.ca'],
    description: 'The email address send to',
  })
  emailTo: Array<string>;

  @ApiProperty({
    example: 'donotreply@gmail.com',
    description: 'The email address send from',
  })
  emailFrom?: string;

  @ApiProperty({
    example: 'Test Email',
    description: 'The email subject',
  })
  emailSubject?: string;

  @ApiPropertyOptional({
    example: 'Hello World',
    description: 'The email body',
  })
  emailBody?: string;

  @ApiProperty({
    example: 'text',
    description: 'The email body type, text or html',
  })
  emailBodyType?: string;

  @ApiPropertyOptional({
    example: [
      {
        content: 'file content as encoded data string',
        contentType: 'file type, i.e. application/pdf',
        encoding: 'base64/binary/hex',
        filename: '',
      },
    ],
    description: 'The attachments will send in the email',
  })
  emailAttachments?: Array<Object>;
}
