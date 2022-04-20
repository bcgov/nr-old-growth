import { Body, Controller, Get, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Client } from '../model/client.interface';
import { ClientService } from '../services/client.service';

@Controller('client')
export class ClientController {

    constructor(private clientService: ClientService) {}

    @Post()
    create(@Body() client: Client): Observable<Client> {
        return this.clientService.create(client);
    }

    @Get()
    findAll() {
        return this.clientService.findAll();
    }

}
