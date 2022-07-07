import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'submission' })
export class SubmissionEntity extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'submission_id' })
  submissionId: number;
 
  @Column({ name: 'submitter_id' })
  submitterId: number;  

  @Column({ name: 'licensee_name' })
  licenseeName: string;  

  @Column({ name: 'first_name' })
  firstName: string;  

  @Column({ name: 'last_name' })
  lastName: string;  

  @Column({ name: 'phone_number' })
  phoneNumber: string;  

  @Column({ name: 'email_address' })
  emailAddress: string; 
  
  //TODO: Change annotation and type
  @Column({ name: 'natural_resource_dist_code' })
  nrdc: string; 

  @Column({ name: 'submission_date' })
  submissionDate: Date; 
  
  @Column({ name: 'create_user' })
  createUser: string; 

}
