import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.PG_HOST || "localhost",
      port: 5432,
      database: process.env.PG_DATABASE || "postgres",
      username: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD,
      autoLoadEntities: true, // Auto load all entities regiestered by typeorm forFeature method.
      synchronize: true, // This changes the DB schema to match changes to entities, which we might not want.
    }),
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
