import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardWorker } from './entities/cardworker.entity';
import { User } from '../users/entities/user.entity';
import { AwsService } from '../aws/aws.service';
import { Columns } from '../columns/entities/column.entity';
import { DataSource } from 'typeorm';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('CardsService', () => {
  let service: CardsService;
  let dataSource: DataSource;

  const mockCardRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    getMany: jest.fn(),
    orderBy: jest.fn(),
    getRepository: jest.fn().mockImplementation(),
    save: jest.fn().mockImplementation((card) => Promise.resolve({ ...card, id: 1 })),
    update: jest.fn().mockResolvedValue({}),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: 1 }),
    })),

    updateQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    })),
    orderQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnThis(),
    })),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockCardWorkerRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockColumnsRepository = {
    findOneBy: jest.fn(),
  };

  const mockAwsService = {
    imageUploadToS3: jest.fn(),
    getUUID: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === Card) {
            return mockCardRepository;
          }
          if (entity === Columns) {
            return mockColumnsRepository;
          }
          if (entity === CardWorker) {
            return mockCardWorkerRepository;
          }
          throw new Error('Unknown entity');
        }),
      },
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCardRepository.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: 1 }),
    });

    mockCardWorkerRepository.save.mockImplementation((user) => Promise.resolve({ ...user, id: 1 }));
    mockColumnsRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockAwsService.imageUploadToS3.mockResolvedValue('http://example.com/image.jpg');
    mockAwsService.getUUID.mockReturnValue('unique-id');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockCardRepository },
        { provide: getRepositoryToken(CardWorker), useValue: mockCardWorkerRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Columns), useValue: mockColumnsRepository },
        { provide: AwsService, useValue: mockAwsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createCard', () => {
    const cardInfo = {
      userId: 1,
      columnId: 1,
      title: 'testTitle',
      info: 'testInfo',
      color: 'testColor',
      deadLine: new Date(),
      file: { originalname: 'test.jpg', buffer: Buffer.from('Test') } as Express.Multer.File,
    };

    it('카드 생성 성공해야 됨', async () => {
      const result = await service.createCard(
        cardInfo.userId,
        cardInfo.columnId,
        cardInfo.title,
        cardInfo.info,
        cardInfo.color,
        cardInfo.deadLine,
        cardInfo.file,
      );

      expect(mockDataSource.createQueryRunner().manager.getRepository(Columns).findOneBy).toHaveBeenCalledWith({ id: cardInfo.columnId });
      expect(mockAwsService.imageUploadToS3).toHaveBeenCalled();
      expect(mockCardRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockCardRepository.save).toHaveBeenCalled();
      expect(mockCardWorkerRepository.save).toHaveBeenCalled();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title', cardInfo.title);
      expect(result).toHaveProperty('info', cardInfo.info);
      expect(result).toHaveProperty('color', cardInfo.color);
      expect(result).toHaveProperty('cardImage', 'http://example.com/image.jpg');
      expect(result).toHaveProperty('orderNum', 2);
    });

    it('카드 생성 실패해야 됨', async () => {
      mockCardRepository.save.mockRejectedValueOnce(new Error('디비에러'));

      await expect(
        service.createCard(
          cardInfo.userId,
          cardInfo.columnId,
          cardInfo.title,
          cardInfo.info,
          cardInfo.color,
          cardInfo.deadLine,
          cardInfo.file,
        ),
      ).rejects.toThrow('Database Error');

      expect(mockDataSource.createQueryRunner().rollbackTransaction).toHaveBeenCalled();
      expect(mockDataSource.createQueryRunner().commitTransaction).not.toHaveBeenCalled();
    });
    describe('getCardById', () => {
      const cardId = 1;
      const mockCard = {
        id: cardId,
        title: 'Test Card',
        info: 'Test Info',
        color: 'Test Color',
        deadLine: new Date(),
      };

      it('성공적으로 카드를 찾아야 됨', async () => {
        mockCardRepository.findOneBy.mockResolvedValue(mockCard);

        const result = await service.getCardById(cardId);

        expect(result).toEqual(mockCard);
        expect(mockCardRepository.findOneBy).toHaveBeenCalledWith({ id: cardId });
      });

      it('카드를 못찾으면 에러를 뱉어야 됨', async () => {
        mockCardRepository.findOneBy.mockResolvedValue(undefined);

        await expect(service.getCardById(cardId)).rejects.toThrow(NotFoundException);
        expect(mockCardRepository.findOneBy).toHaveBeenCalledWith({ id: cardId });
      });
    });
    describe('checkCardOwner', () => {
      const cardId = 1;
      const ownerId = 1;
      const nonOwnerId = 2;
      const mockCardWorker = {
        id: 1,
        cardId: cardId,
        ownerId: ownerId,
      };

      it('조회가 성공할경우', async () => {
        mockCardWorkerRepository.findOneBy.mockResolvedValue(mockCardWorker);

        await expect(service.checkCardOwner(cardId, ownerId)).resolves.toBeUndefined();
        expect(mockCardWorkerRepository.findOneBy).toHaveBeenCalledWith({ cardId });
      });

      it('작업자가 아닐 경우', async () => {
        mockCardWorkerRepository.findOneBy.mockResolvedValue(mockCardWorker);

        await expect(service.checkCardOwner(cardId, nonOwnerId)).rejects.toThrow(ForbiddenException);
        expect(mockCardWorkerRepository.findOneBy).toHaveBeenCalledWith({ cardId });
      });

      it('카드가 없을 경우', async () => {
        mockCardWorkerRepository.findOneBy.mockResolvedValue(undefined);

        await expect(service.checkCardOwner(cardId, ownerId)).rejects.toThrow(ForbiddenException);
        expect(mockCardWorkerRepository.findOneBy).toHaveBeenCalledWith({ cardId });
      });
    });
    describe('getDeadLineCardList', () => {
      const columnId = 1;
      const mockCards = [
        { id: 1, title: '카드 1', columnId: columnId, deadLine: '2024-03-25' },
        { id: 2, title: '카드 2', columnId: columnId, deadLine: '2024-03-20' },
      ];

      it('마감 기한 순으로 카드를 정렬하여 반환해야 함', async () => {
        mockCardRepository.find.mockResolvedValue(mockCards.sort((a, b) => a.deadLine.localeCompare(b.deadLine)));

        const result = await service.getDeadLineCardList(columnId);

        expect(result).toEqual(mockCards);
        expect(mockCardRepository.find).toHaveBeenCalledWith({
          where: { columnId },
          order: {
            deadLine: 'ASC',
          },
        });
      });

      it('컬럼 id에 대한 카드가 없으면 뱉어야 함', async () => {
        mockCardRepository.find.mockResolvedValue([]);

        const result = await service.getDeadLineCardList(columnId);

        expect(result).toEqual([]);
        expect(mockCardRepository.find).toHaveBeenCalledWith({
          where: { columnId },
          order: {
            deadLine: 'ASC',
          },
        });
      });
    });
    describe('changeCardOrder', () => {
      const cardId = 1;
      const newOrderNum = 2;
      const userId = 1;
      const mockCard = {
        id: cardId,
        orderNum: 1,
        ownerId: userId,
      };
      beforeEach(() => {
        const mockQueryBuilder = {
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({}),
        };

        jest.spyOn(mockDataSource.createQueryRunner().manager.getRepository(Card), 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

        service.getCardById = jest.fn().mockResolvedValue(mockCard);
        service.checkCardOwner = jest.fn().mockResolvedValue(undefined);
      });

      it('카드 순서를 성공적으로 변경해야 함', async () => {
        await service.changeCardOrder(cardId, newOrderNum, userId);

        expect(service.getCardById).toHaveBeenCalledWith(cardId);
        expect(service.checkCardOwner).toHaveBeenCalledWith(cardId, userId);

        expect(mockDataSource.createQueryRunner().manager.getRepository(Card).update).toHaveBeenCalledWith(cardId, {
          orderNum: newOrderNum,
        });
        expect(mockCardRepository.update).toHaveBeenCalled();
        expect(mockDataSource.createQueryRunner().commitTransaction).toHaveBeenCalled();
      });

      it('오류 발생 시 트랜잭션 롤백해야 함', async () => {
        service.getCardById = jest.fn().mockRejectedValue(new Error('테스트 오류'));

        await expect(service.changeCardOrder(cardId, newOrderNum, userId)).rejects.toThrow('테스트 오류');

        expect(mockDataSource.createQueryRunner().rollbackTransaction).toHaveBeenCalled();
      });
    });
    describe('getCardList', () => {
      const columnId = 1;
      const mockCards = [
        { id: 1, columnId, orderNum: 2, title: '카드 B' },
        { id: 2, columnId, orderNum: 1, title: '카드 A' },
      ];
      it('오더 넘버 순으로 카드를 정렬하여 반환해야 함', async () => {
        mockCardRepository.find.mockResolvedValue(mockCards.sort((a, b) => a.orderNum - b.orderNum));

        const result = await service.getCardList(columnId);

        expect(result).toEqual(mockCards);
        expect(mockCardRepository.find).toHaveBeenCalledWith({
          where: { columnId },
          order: {
            orderNum: 'ASC',
          },
        });
      });

      it('컬럼 id에 대한 카드가 없으면 뱉어야 함1', async () => {
        mockCardRepository.find.mockResolvedValue([]);

        const result = await service.getCardList(columnId);

        expect(result).toEqual([]);
        expect(mockCardRepository.find).toHaveBeenCalledWith({
          where: { columnId },
          order: {
            orderNum: 'ASC',
          },
        });
      });
    });
    describe('getWorkerById', () => {
      const workerId = 1;
      const mockCardWorker = { workerId, name: '테스트 사용자', email: 'test@example.com' };
      it('주어진 workerId로 worker를 찾아야 함', async () => {
        mockCardWorkerRepository.findOneBy.mockResolvedValue(mockCardWorker);

        const result = await service.getWorkerById(workerId);

        expect(mockCardWorkerRepository.findOneBy).toHaveBeenCalledWith({ workerId });
        expect(result).toEqual(mockCardWorker);
      });

      it('존재하지 않는 workerId에 오류를 발생시켜야 함', async () => {
        mockCardWorkerRepository.findOneBy.mockResolvedValue(undefined);

        await expect(service.getWorkerById(workerId)).rejects.toThrow(UnauthorizedException);
        expect(mockCardWorkerRepository.findOneBy).toHaveBeenCalledWith({ workerId });
      });
    });
    describe('updateWorkerCard', () => {
      const cardId = 1;
      const userId = 1;
      const workerId = 2;
      const cardWorker = { id: 1, cardId, ownerId: userId };
      const user = { id: workerId, name: 'test' };

      it('모든 검증을 통과하면 카드 업데이트를 수행해야 함', async () => {
        const card = { id: cardId, title: 'Sample Card', ownerId: userId };
        mockCardRepository.findOneBy.mockResolvedValue(card);
        mockCardWorkerRepository.findOneBy.mockResolvedValue(cardWorker);

        mockUserRepository.findOneBy.mockResolvedValue(user);

        mockCardWorkerRepository.update.mockResolvedValue({ affected: 1 });
        await expect(service.checkCardOwner(cardId, userId)).resolves.toBeUndefined();
        expect(mockCardWorkerRepository.findOneBy).toHaveBeenCalledWith({ cardId });
        const result = await service.updateWorkerCard(cardId, userId, workerId);

        expect(mockCardWorkerRepository.update).toHaveBeenCalledWith(cardWorker.id, { workerId });
        expect(result).toEqual({ affected: 1 });
      });

      it('작업을 할당할 유저가 존재하지 않을 때 어류 발생시켜야 함', async () => {
        const card = { id: cardId, title: 'Sample Card', ownerId: userId };
        mockCardRepository.findOneBy.mockResolvedValue(card);
        mockCardWorkerRepository.findOneBy.mockResolvedValue(cardWorker);
        mockUserRepository.findOneBy.mockResolvedValue(undefined);

        await expect(service.updateWorkerCard(cardId, userId, workerId)).rejects.toThrow(NotFoundException);
      });
    });
    describe('updateCard', () => {
      const cardId = 1;
      const userId = 1;
      const updateCardDto = {
        title: '새 제목',
        info: '새 정보',
        color: 'blue',
        deadLine: new Date('2024-03-20T18:50:36.174Z').toISOString(),
        cardImage: 'http://example.com/image.jpg',
      };
      const file = { originalname: 'image.jpg', buffer: Buffer.from('Test') } as Express.Multer.File;

      it('카드 업데이트 성공해야 함', async () => {
        mockAwsService.imageUploadToS3.mockResolvedValue('http://example.com/image.jpg');

        mockCardRepository.findOneBy.mockResolvedValue({
          id: cardId,
          ownerId: userId,
        });

        const result = await service.updateCard(cardId, userId, updateCardDto, file);

        expect(mockDataSource.createQueryRunner().connect).toHaveBeenCalled();
        expect(mockDataSource.createQueryRunner().startTransaction).toHaveBeenCalled();
        expect(mockDataSource.createQueryRunner().commitTransaction).toHaveBeenCalled();

        expect(mockDataSource.createQueryRunner().manager.getRepository(Card).update).toHaveBeenCalledWith(cardId, {
          title: updateCardDto.title,
          info: updateCardDto.info,
          color: updateCardDto.color,
          deadLine: updateCardDto.deadLine,
          cardImage: 'http://example.com/image.jpg',
        });

        expect(mockDataSource.createQueryRunner().commitTransaction).toHaveBeenCalled();
      });

      it('카드 업데이트 실패해야 함', async () => {
        mockCardRepository.findOneBy.mockResolvedValue({
          id: cardId,
          ownerId: userId,
        });
        const result = await service.updateCard(cardId, userId, updateCardDto, file);
        expect(mockDataSource.createQueryRunner().connect).toHaveBeenCalled();
        expect(mockDataSource.createQueryRunner().startTransaction).toHaveBeenCalled();
        expect(mockDataSource.createQueryRunner().commitTransaction).toHaveBeenCalled();

        mockAwsService.imageUploadToS3.mockRejectedValue(new Error('AWS S3 Error'));
        await expect(service.updateCard(cardId, userId, updateCardDto, file)).rejects.toThrow('AWS S3 Error');
        // expect(mockDataSource.createQueryRunner().rollbackTransaction).toHaveBeenCalled();
      });
    });
    describe('updatedColumn', () => {
      const cardId = 1;
      const userId = 1;
      const oldColumnId = 1;
      const newColumnId = 2;
      const boardId = 1;
      const mockCard = { id: cardId, columnId: oldColumnId, orderNum: 1, boardId };
      const mockOldColumn = { id: oldColumnId, boardId };
      const mockNewColumn = { id: newColumnId, boardId };

      it('성공적으로 컬럼을 업데이트해야 함', async () => {
        const mockQueryBuilder = {
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({}),
        };
        // expect(mockDataSource.createQueryRunner().manager.getRepository(Card), 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
        const card = { id: cardId, title: 'Sample Card', ownerId: userId };
        await service.updatedColumn(cardId, userId, newColumnId);

        mockCardRepository.findOneBy.mockResolvedValue(card);

        mockUserRepository.findOneBy.mockResolvedValue(userId);

        mockColumnsRepository.findOneBy.mockResolvedValue(oldColumnId);
        expect(mockDataSource.createQueryRunner().manager.getRepository(Columns).findOneBy).toHaveBeenNthCalledWith(1, { id: oldColumnId });
        expect(mockDataSource.createQueryRunner().manager.getRepository(Columns).findOneBy).toHaveBeenNthCalledWith(2, { id: newColumnId });
        expect(mockQueryBuilder.update).toHaveBeenCalled();
        expect(mockQueryBuilder.set).toHaveBeenCalled();
        expect(mockQueryBuilder.where).toHaveBeenCalled();
        expect(mockQueryBuilder.execute).toHaveBeenCalled();
        expect(mockDataSource.createQueryRunner().commitTransaction).toHaveBeenCalled();
      });
    });
  });
});
