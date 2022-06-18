import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NaturalResourceDistCodeEntity } from '../entities/naturalResourceDistCode.entity';
import { NaturalResourceDistCode } from '../entities/naturalResourceDistCode.interface';


@Injectable()
export class NaturalResourceDistCodeService {
 
  constructor(
    @InjectRepository(NaturalResourceDistCodeEntity)
    private naturalResourceRepository: Repository<NaturalResourceDistCodeEntity>,
) { }

  findAllActive(): Promise<NaturalResourceDistCode[]> {
    return this.naturalResourceRepository
      .createQueryBuilder()
      .select("n")
      .from(NaturalResourceDistCodeEntity, "n")
      .where("(n.expiry_date is null or n.expiry_date > current_date) " +
             "and n.effective_date <= current_date")
      .orderBy("n.description")
      .getMany();
  }

  findByCode(code: string) {
    //TODO
    return `This action returns a #${code} naturalresourcedist`;
  }

}
