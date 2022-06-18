import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NaturalResourceDistCodeModule } from './naturalresourcedistcode/naturalResourceDistCode.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_HOST || 'localhost',
      port: 5432,
      database: process.env.POSTGRESQL_DATABASE || 'postgres',
      username: process.env.POSTGRESQL_USER || 'postgres',
      password: process.env.POSTGRESQL_PASSWORD,
      autoLoadEntities: true, // Auto load all entities regiestered by typeorm forFeature method.
      synchronize: false, // This changes the DB schema to match changes to entities, which we might not want.
    }),
    NaturalResourceDistCodeModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
