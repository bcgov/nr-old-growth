import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Persistence entity for `email_submission_log` and, at the HTTP boundary,
 * the request-body contract for `/form/postLog` and `/form/updateLog`.
 *
 * Fields WITHOUT class-validator decorators (`id`, `createTimestamp`) are
 * deliberately server/DB-controlled: the global ValidationPipe whitelist
 * strips them from incoming request bodies, so callers cannot forge a
 * primary key or overwrite audit timestamps.
 */
@Entity({ name: 'email_submission_log' })
export class EmailSubmissionLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'email_submission_log_id' })
  id: number;

  @ApiPropertyOptional({
    example: 'DELIVERED',
    description: 'The code indicates if the email sent out successfully',
  })
  @Column({ name: 'code' })
  @IsOptional()
  @IsIn(['DELIVERED', 'FAILED'])
  code: string;

  @ApiPropertyOptional({
    example: '',
    description: 'The error messages',
  })
  @Column({ name: 'exception_log' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  exceptionLog: string;

  @ApiPropertyOptional({
    example: '23F86A29',
    description: 'The confirmation id of a form submission',
  })
  @Column({ name: 'confirmation_id' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  confirmationId: string;

  @Column({ name: 'form_id' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  formId: string;

  @Column({ name: 'form_version_id' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  formVersionId: string;

  @Column({ name: 'create_timestamp' })
  createTimestamp: Date;

  @ApiPropertyOptional({
    example: 'NEW or UPDATE',
    description:
      'The code indicates if the email sent out for a new submission or for an update submission',
  })
  @Column({ name: 'email_type' })
  @IsOptional()
  @IsIn(['NEW', 'UPDATE'])
  emailType: string;

  @ApiPropertyOptional({
    description: 'The updatedAt time for this submission',
  })
  @Column({ name: 'submission_update_timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  submissionUpdatedAt: Date;
}
