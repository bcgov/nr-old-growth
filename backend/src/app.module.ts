import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
// import { SptialFileModule } from './spatialfile/spatialFile.module';
import { CutblockSubmissiondetailsModule } from './cutblocksubmissiondetails/cutblocksubmissiondetails.module';
import { DeferralCategoryCodeModule } from './deferralcategorycode/deferralCategoryCode.module';
import { NaturalResourceDistCodeModule } from './naturalresourcedistcode/naturalResourceDistCode.module';
import { SubmissionModule } from './submission/submission.module';

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
    CutblockSubmissiondetailsModule,
    // SptialFileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
