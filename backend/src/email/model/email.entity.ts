import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/** A single attachment entry accepted by the CHES email API. */
export class EmailAttachment {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contentType?: string;

  @IsOptional()
  @IsIn(['base64', 'binary', 'hex'])
  encoding?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;
}

export class EmailEntity {
  @ApiProperty({
    example: ['name@gov.bc.ca'],
    description: 'The email address send to',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emailTo: Array<string>;

  @ApiProperty({
    example: 'donotreply@gmail.com',
    description: 'The email address send from',
  })
  @IsOptional()
  @IsEmail()
  emailFrom?: string;

  @ApiProperty({
    example: 'Test Email',
    description: 'The email subject',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailSubject?: string;

  @ApiPropertyOptional({
    example: 'Hello World',
    description: 'The email body',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100000)
  emailBody?: string;

  @ApiProperty({
    example: 'text',
    description: 'The email body type, text or html',
  })
  @IsOptional()
  @IsIn(['text', 'html'])
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
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => EmailAttachment)
  emailAttachments?: Array<EmailAttachment>;
}
