import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Client } from '../model/client.interface';
import { ClientService } from '../services/client.service';

@ApiTags('record')
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
