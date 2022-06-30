import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { NaturalResourceDistCodeModule } from './naturalresourcedistcode/naturalResourceDistCode.module';
import { DeferralCategoryCodeModule } from './deferralcategorycode/deferralCategoryCode.module';
import { SubmissionModule } from './submission/submission.module';
import { CutblocksubmissiondetailsModule } from './cutblocksubmissiondetails/cutblocksubmissiondetails.module';

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
    ScheduleModule.forRoot(),
    EmailModule,
    NaturalResourceDistCodeModule,
    DeferralCategoryCodeModule,
    SubmissionModule,
    CutblocksubmissiondetailsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
