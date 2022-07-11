import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'email_submission_log' })
export class EmailSubmissionLogEntity extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'email_submission_log_id' })
  id: number;

  @ApiPropertyOptional({
    example: 'DELIVERED',
    description: 'The code indicates if the email sent out successfully',
  })
  @Column({ name: 'code' })
  code: string;

  @ApiPropertyOptional({
    example: '',
    description: 'The error messages',
  })
  @Column({ name: 'exception_log' })
  exceptionLog: string;

  @ApiPropertyOptional({
    example: '23F86A29',
    description: 'The confirmation id of a form submission',
  })
  @Column({ name: 'confirmation_id' })
  confirmationId: string;

  @Column({ name: 'form_id' })
  formId: string;

  @Column({ name: 'form_version_id' })
  formVersionId: string;

  @Column({ name: 'create_timestamp' })
  createTimestamp: Date;

}
