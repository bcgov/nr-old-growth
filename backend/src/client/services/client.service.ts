import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { ClientEntity } from '../model/client.entity';
import { Client } from '../model/client.interface';

@Injectable()
export class ClientService {

    constructor(
        @InjectRepository(ClientEntity)
        private clientRepository: Repository<ClientEntity>,
    ) { }

    create(client: Client): Observable<Client> {
        return from(this.clientRepository.save(client));
    }

    findAll(): Promise<Client[]> {
        return this.clientRepository.find();
    }

}
