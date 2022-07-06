import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CutblockSubmissionDetailsEntity } from "src/cutblockSubmissionDetails/entities/cutblockSubmissionDetails.entity";
import { SubmissionEntity } from "src/submission/entities/submission.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(SubmissionEntity)
    private submissionRepository: Repository<SubmissionEntity>,

    @InjectRepository(CutblockSubmissionDetailsEntity)
    private cutblockSubmissionDetailsRepository: Repository<CutblockSubmissionDetailsEntity>,
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

  @Cron("*/5 * * * * *") //Runs every 5 seconds
  myApiTest() {
    console.log(".....");
    this.postData();
  }

  async postData(): Promise<any> {
    //TODO: Add rollback if any save fails
    const newSubmissionEntity = new SubmissionEntity();
    newSubmissionEntity.submitterId = 7;
    newSubmissionEntity.licenseeName = "Test";
    newSubmissionEntity.firstName = "Test 2";
    newSubmissionEntity.lastName = "Test 3";
    newSubmissionEntity.phoneNumber = "(604)";
    newSubmissionEntity.emailAddress = "m@m.com";
    newSubmissionEntity.nrdc = "DCC";
    newSubmissionEntity.submissionDate = new Date();
    newSubmissionEntity.createUser = "Test 4";

    try {
      const submission = 
        await this.submissionRepository.save(
          newSubmissionEntity,
        );
      console.log(JSON.stringify(submission));

      const newCutblockSubmissionDetailsEntity = new CutblockSubmissionDetailsEntity();
      newCutblockSubmissionDetailsEntity.submissionEntity = submission;
      newCutblockSubmissionDetailsEntity.cutBlockId = "Test 11";
      newCutblockSubmissionDetailsEntity.totalBlockHa = 4.33;
      newCutblockSubmissionDetailsEntity.haOrgMappedDefArea = 33.44;
      newCutblockSubmissionDetailsEntity.createUser = "Test 4";
      newCutblockSubmissionDetailsEntity.createTimestamp = new Date();

      const cutblockSubmissionDetails =
        await this.cutblockSubmissionDetailsRepository.save(
          newCutblockSubmissionDetailsEntity,
        );
      console.log(JSON.stringify(cutblockSubmissionDetails));
    } 
    catch (error) {
      this.logger.error("Failed to write into db: \n" + error);
      return null;
    }
  }
}
