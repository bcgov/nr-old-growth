import { PartialType } from '@nestjs/swagger';
import { EmailEntity } from '../model/email.entity';

export class CreateEmailDto extends PartialType(EmailEntity) {}
