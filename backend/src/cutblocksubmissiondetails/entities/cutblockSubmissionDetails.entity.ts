import { SubmissionEntity } from 'src/submission/entities/submission.entity';
import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'cutblock_submission_details' })
export class CutblockSubmissionDetailsEntity extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'cutblock_submission_details_id' })
  id: number;

  @ManyToOne(() => SubmissionEntity, (SubmissionEntity) => SubmissionEntity.submissionId, { cascade: true })
  @JoinColumn({name: "submission_id"})
  submissionEntity: SubmissionEntity;

}

