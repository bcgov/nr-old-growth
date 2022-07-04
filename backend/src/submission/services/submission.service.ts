import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { SubmissionEntity } from 'src/submission/entities/submission.entity';
import { Submission } from 'src/submission/entities/submission.interface';
import { Repository } from 'typeorm';

@Injectable()
export class SubmissionService {

  constructor(
    @InjectRepository(SubmissionEntity)
    private submissionRepository: Repository<SubmissionEntity>,
  ) {}

  findAll() {
    return `This action returns all submission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} submission`;
  }

  remove(id: number) {
    return `This action removes a #${id} submission`;
  }

  @Cron('*/5 * * * * *') //Runs every 5 seconds
  myApiTest() {
    console.log('.....');
    const mySubmission = this.postData();
    console.log(mySubmission);
  }

  postData(): Observable<Submission> {
    const newSubmissionEntity = new SubmissionEntity();

    return from(this.submissionRepository.save(newSubmissionEntity));
    
    // const newEmailSubmissionLogEntity = new EmailSubmissionLogEntity();
    // newEmailSubmissionLogEntity.code = emailSubmissionLog.code;
    // newEmailSubmissionLogEntity.exceptionLog = emailSubmissionLog.exceptionLog;
    // newEmailSubmissionLogEntity.confirmationId = emailSubmissionLog.confirmationId;
    // newEmailSubmissionLogEntity.formId = emailSubmissionLog.formId;
    // newEmailSubmissionLogEntity.formVersionId = emailSubmissionLog.formVersionId;

    // try {
    //   return from(
    //     this.emailSubmissionLogRepository.save(newEmailSubmissionLogEntity),
    //   );
    // } catch (e) {
    //   // todo: handle db write error
    //   this.logger.error('Failed to write into db: ');
    //   this.logger.error(e);
    //   return null;
    // }
    //return null;
  }
}
