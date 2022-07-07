import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CutblockSubmissionDetailsEntity } from 'src/cutblocksubmissiondetails/entities/cutblockSubmissionDetails.entity';
import { SubmissionEntity } from 'src/submission/entities/submission.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    private dataSource: DataSource,
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

  //@Cron("*/5 * * * * *") //Runs every 5 seconds
  async postData(): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newSubmissionEntity = new SubmissionEntity();
      newSubmissionEntity.submitterId = 7;
      newSubmissionEntity.licenseeName = 'Test';
      newSubmissionEntity.firstName = 'Test 2';
      newSubmissionEntity.lastName = 'Test 3';
      newSubmissionEntity.phoneNumber = '(604)';
      newSubmissionEntity.emailAddress = 'm@m.com';
      newSubmissionEntity.nrdc = 'DCC';
      newSubmissionEntity.submissionDate = new Date();
      newSubmissionEntity.createUser = 'Test 4';

      const submission = await queryRunner.manager.save(newSubmissionEntity);

      const newCutblockSubmissionDetailsEntity = new CutblockSubmissionDetailsEntity();
      newCutblockSubmissionDetailsEntity.submissionEntity = submission;
      newCutblockSubmissionDetailsEntity.cutBlockId = 'Test 11';
      newCutblockSubmissionDetailsEntity.totalBlockHa = 4.33;
      newCutblockSubmissionDetailsEntity.haOrgMappedDefArea = 33.44;
      newCutblockSubmissionDetailsEntity.createUser = 'Test 4';
      newCutblockSubmissionDetailsEntity.createTimestamp = new Date();

      await queryRunner.manager.save(newCutblockSubmissionDetailsEntity);
      await queryRunner.commitTransaction();
    } 
    catch (err) {
      this.logger.error("\nFailed to write into db: \n" + err + "." +
                        "\nThe transaction has been rollbacked.");
      await queryRunner.rollbackTransaction();
    } 
    finally {
      await queryRunner.release();
    }
  }
}
