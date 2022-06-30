import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CutblockSubmissionDetailsService {

  findAll() {
    return `This action returns all cutblocksubmissiondetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cutblocksubmissiondetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} cutblocksubmissiondetail`;
  }

  @Cron('*/5 * * * * *') //Runs every 5 seconds
  myApiTest() {
    console.log("Mayis");
  }

}
