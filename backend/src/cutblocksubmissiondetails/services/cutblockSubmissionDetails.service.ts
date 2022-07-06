import { Injectable } from '@nestjs/common';

@Injectable()
export class CutblockSubmissionDetailsService {

  findAll() {
    return `This action returns all cutblockSubmissionDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cutblocksubmissiondetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} cutblocksubmissiondetail`;
  }
  
}
