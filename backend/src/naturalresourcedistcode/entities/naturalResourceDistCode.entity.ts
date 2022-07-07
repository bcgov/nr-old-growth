import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'natural_resource_dist_code' })
export class NaturalResourceDistCodeEntity extends BaseEntity {

  @PrimaryColumn({ name: 'natural_resource_dist_code' })
  code: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'effective_date' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date' })
  expiryDate: Date;

  @Column({ name: 'email_address' })
  emailAddress: string;
  
}
