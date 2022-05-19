import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'email_submision_log' })
export class EmailSubmissionLogEntity extends BaseEntity {

    @PrimaryGeneratedColumn({ name: "email_submision_log_id" })
    id: number;

    @Column({ name: "code" })
    code: string;

    @Column({ name: "exception_log" })
    exceptionLog: string;

    @Column({ name: "submision_id" })
    submissionId: string;

    @Column({ name: "create_timestamp" })
    createTimestamp: Date;

}
