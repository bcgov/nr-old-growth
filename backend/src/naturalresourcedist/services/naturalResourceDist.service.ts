import { Injectable } from '@nestjs/common';


@Injectable()
export class NaturalResourceDistService {
 
  findAll() {
    return `This action returns all naturalresourcedist`;
  }

  findByCode(code: string) {
    return `This action returns a #${code} naturalresourcedist`;
  }

}
