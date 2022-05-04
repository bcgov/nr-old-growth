import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NaturalResourceDistEntity } from '../entities/naturalResourceDist.entity';
import { NaturalResourceDist } from '../entities/naturalResourceDist.interface';


@Injectable()
export class NaturalResourceDistService {
 
  constructor(
    @InjectRepository(NaturalResourceDistEntity)
    private naturalResourceRepository: Repository<NaturalResourceDistEntity>,
) { }

  findAllActive(): Promise<NaturalResourceDist[]> {
    return this.naturalResourceRepository
      .createQueryBuilder()
      .select("n")
      .from(NaturalResourceDistEntity, "n")
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
