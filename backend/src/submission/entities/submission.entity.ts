import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'submission' })
export class SubmissionEntity extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'submission_id' })
  submissionId: number;

  //TODO: Create other columns
  
}
