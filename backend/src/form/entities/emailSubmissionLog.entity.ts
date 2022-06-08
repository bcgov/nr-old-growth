import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'email_submission_log' })
export class EmailSubmissionLogEntity extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'email_submission_log_id' })
  id: number;

  @Column({ name: 'code' })
  code: string;

  @Column({ name: 'exception_log' })
  exceptionLog: string;

  @Column({ name: 'confirmation_id' })
  confirmationId: string;

  @Column({ name: 'form_id' })
  formId: string;

  @Column({ name: 'form_version_id' })
  formVersionId: string;

  @Column({ name: 'create_timestamp' })
  createTimestamp: Date;

}
