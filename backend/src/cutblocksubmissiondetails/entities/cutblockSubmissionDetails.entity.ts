import { Timestamp } from 'rxjs';
import { SubmissionEntity } from 'src/submission/entities/submission.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'cutblock_submission_details' })
export class CutblockSubmissionDetailsEntity extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'cutblock_submission_details_id' })
  id: number;

  @ManyToOne(
    () => SubmissionEntity,
    (SubmissionEntity) => SubmissionEntity.submissionId,
    { cascade: true },
  )
  @JoinColumn({ name: 'submission_id' })
  submissionEntity: SubmissionEntity;

  @Column({ name: 'cut_block_id' })
  cutBlockId: string;

  @Column({ name: 'total_block_ha', precision: 5, scale: 2 })
  totalBlockHa: number;

  @Column({ name: 'ha_org_mapped_def_area', precision: 5, scale: 2 })
  haOrgMappedDefArea: number;

  @Column({ name: 'create_timestamp' })
  createTimestamp: Date; 
  
  @Column({ name: 'create_user' })
  createUser: string; 

  //TODO: Add all columns

}
