import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordsService } from './records.service';
import { Records } from './entities/records.entity';

describe('RecordsService', () => {
  let service: RecordsService;
  let repo: Repository<Records>;

  const oneUserName = 'Test Numone';
  const oneUserFile = 'Fileone';
  const oneRecord = new Records(oneUserName, oneUserFile);
  const updateRecord = {
    status: 'pending',
  };

  const twoRecord = new Records('Test Numtwo', 'Filetwo');

  const threeUserName = 'Test Numthree';
  const threeUserFile = 'FileThree';
  const newRecord = {
    username: threeUserName,
    file: threeUserFile,
  };
  const threeRecord = new Records(threeUserName, threeUserFile);

  const recordArray = [oneRecord, twoRecord];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: getRepositoryToken(Records),
          useValue: {
            // mock repository functions for testing
            find: jest.fn().mockResolvedValue(recordArray),
            findOneOrFail: jest.fn().mockResolvedValue(oneRecord),
            create: jest.fn().mockReturnValue(threeRecord),
            save: jest.fn(),
            // as these do not actually use their return values in our sample
            // we just make sure that their resolve is true to not crash
            update: jest.fn().mockResolvedValue(true),
            // as these do not actually use their return values in our sample
            // we just make sure that their resolve is true to not crash
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    repo = module.get<Repository<Records>>(getRepositoryToken(Records));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should successfully add a record', () => {
      expect(service.create(newRecord)).resolves.toEqual(threeRecord);
      expect(repo.create).toBeCalledTimes(1);
      // expect(repo.create).toBeCalledWith({
      //   ...newRecord,
      //   status: 'pending',
      //   submission_date: new Date(),
      // });
      expect(repo.save).toBeCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of records', async () => {
      const records = await service.findAll();
      expect(records).toEqual(recordArray);
    });
  });

  describe('findOne', () => {
    it('should get a single record', () => {
      const repoSpy = jest.spyOn(repo, 'findOneOrFail');
      expect(service.findOne(1)).resolves.toEqual(oneRecord);
      expect(repoSpy).toBeCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call the update method', async () => {
      const record = await service.update(1, updateRecord);
      expect(record).toEqual(oneRecord);
      expect(repo.update).toBeCalledTimes(1);
      expect(repo.update).toBeCalledWith({ id: 1 }, updateRecord);
    });
  });

  describe('remove', () => {
    it('should return {deleted: true}', () => {
      expect(service.remove(2)).resolves.toEqual({ deleted: true });
    });
    it('should return {deleted: false, message: err.message}', () => {
      const repoSpy = jest
        .spyOn(repo, 'delete')
        .mockRejectedValueOnce(new Error('Bad Delete Method.'));
      expect(service.remove(-1)).resolves.toEqual({
        deleted: false,
        message: 'Bad Delete Method.',
      });
      expect(repoSpy).toBeCalledWith(-1);
      expect(repoSpy).toBeCalledTimes(1);
    });
  });
});
