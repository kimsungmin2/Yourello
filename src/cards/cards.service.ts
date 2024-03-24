import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { AwsService } from '../aws/aws.service';
import { BoardMember } from '../boards/entities/boardmember.entity';
import { Columns } from '../columns/entities/column.entity';
import { CardWorker } from './entities/cardworker.entity';
import { WorkerDto } from './dto/worker.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardWorker)
    private cardWorkerRepository: Repository<CardWorker>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private awsService: AwsService,
  ) {}
  // const user = await queryRunner.manager.getRepository(BoardMember).findOneBy({ id: column.boardId });
  // if (user.userId !== userId) {
  //   throw new ForbiddenException('카드를 만들 권한이 없습니다.');
  // }

  async createCard(
    userId: number,
    columnId: number,
    title: string,
    info: string,
    color: string,
    deadLine: Date,
    file: Express.Multer.File,
  ): Promise<Card> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const column = await queryRunner.manager.getRepository(Columns).findOneBy({ id: columnId });
      console.log(column);

      const imageName = this.awsService.getUUID();
      const ext = file.originalname.split('.').pop();
      const imageUrl = await this.awsService.imageUploadToS3(`${imageName}.${ext}`, file, ext);
      console.log(imageUrl);
      const maxCardOrderNum = await queryRunner.manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .select('MAX(card.orderNum)', 'max')
        .where('card.columnId = :id', { id: columnId })
        .getRawOne();

      const orderNum = maxCardOrderNum.max ? maxCardOrderNum.max + 1 : 1;
      console.log(orderNum);
      const card = await queryRunner.manager.getRepository(Card).save({
        columnId,
        title,
        info,
        color,
        deadLine,
        cardImage: imageUrl,
        orderNum: orderNum,
      });

      const user = await queryRunner.manager.getRepository(CardWorker).save({
        ownerId: userId,
        cardId: card.id,
      });
      await queryRunner.commitTransaction();
      console.log(user);
      return card;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Database Error');
    } finally {
      await queryRunner.release();
    }
  }

  async getCardById(cardId: number): Promise<Card> {
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotFoundException('해당 카드가 없습니다.');
    }
    return card;
  }

  async checkCardOwner(cardId: number, userId: number): Promise<void> {
    const cardWorker = await this.cardWorkerRepository.findOneBy({ cardId });
    if (!cardWorker || cardWorker.ownerId !== userId) {
      throw new ForbiddenException('변경 권한이 없습니다.');
    }
  }

  async getDeadLineCardList(columnId: number): Promise<Card[]> {
    const cards = await this.cardRepository.find({
      where: { columnId },
      order: {
        deadLine: 'ASC',
      },
    });

    return cards;
  }

  async changeCardOrder(cardId: number, newOrderNum: number, userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const card = await this.getCardById(cardId);
      await this.checkCardOwner(cardId, userId);

      if (card.orderNum < newOrderNum) {
        await queryRunner.manager
          .getRepository(Card)
          .createQueryBuilder('card')
          .update(Card)
          .where('columnId = :columnId AND orderNum <= :newOrderNum AND orderNum > :orderNum', {
            newOrderNum,
            orderNum: card.orderNum,
            columnId: card.columnId,
          })
          .set({ orderNum: () => 'orderNum - 1' })
          .execute();
      } else if (card.orderNum > newOrderNum) {
        await queryRunner.manager
          .getRepository(Card)
          .createQueryBuilder('card')
          .update(Card)
          .where('columnId = :columnId AND orderNum < :orderNum AND orderNum >= :newOrderNum', {
            newOrderNum,
            orderNum: card.orderNum,
            columnId: card.columnId,
          })
          .set({ orderNum: () => 'orderNum + 1' })
          .execute();
      }

      await queryRunner.manager.getRepository(Card).update(cardId, {
        orderNum: newOrderNum,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCardList(columnId: number): Promise<Card[]> {
    const card = await this.cardRepository.find({
      where: { columnId },
      order: {
        orderNum: 'ASC',
      },
    });

    return card;
  }

  async getWorkerById(workerId: number) {
    const worker = await this.cardWorkerRepository.findOneBy({ workerId });
    if (!worker) {
      throw new UnauthorizedException('인증 되지 않은 사용자입니다');
    }
    return worker;
  }

  async updateWorkerCard(cardId: number, userId: number, workerId: number) {
    await this.getCardById(cardId);

    const cardWorker = await this.cardWorkerRepository.findOneBy({ cardId });
    if (cardWorker.ownerId !== userId) {
      throw new ForbiddenException('변경 권환이 없습니다.');
    }
    const user = await this.userRepository.findOneBy({ id: workerId });
    if (!user) {
      throw new NotFoundException('작업을 할당할 유저가 존재하지 않습니다.');
    }

    const workerUpdate = await this.cardWorkerRepository.update(cardWorker.id, { workerId });
    return workerUpdate;
  }

  async updateCard(cardId: number, userId: number, updateCardDto: UpdateCardDto, file: Express.Multer.File): Promise<void> {
    const imageName = this.awsService.getUUID();
    const ext = file.originalname.split('.').pop();
    const imageUrl = await this.awsService.imageUploadToS3(`${imageName}.${ext}`, file, ext);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.getCardById(cardId);
      await this.checkCardOwner(cardId, userId);
      await queryRunner.manager.getRepository(Card).update(cardId, {
        title: updateCardDto.title,
        info: updateCardDto.info,
        color: updateCardDto.color,
        deadLine: updateCardDto.deadLine,
        cardImage: imageUrl,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updatedColumn(cardId: number, userId: number, columnId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const card = await this.getCardById(cardId);
      await this.checkCardOwner(cardId, userId);
      const column = await queryRunner.manager.getRepository(Columns).findOneBy({ id: card.columnId });
      const NewColumn = await queryRunner.manager.getRepository(Columns).findOneBy({ id: columnId });
      if (!NewColumn) {
        throw new NotFoundException('존재하지 않는 컬럼입니다.');
      }
      if (column.boardId !== NewColumn.boardId) {
        throw new ForbiddenException('같은 보드에서만 이동이 가능합니다.');
      }
      await queryRunner.manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .update(Card)
        .set({ orderNum: () => 'orderNum - 1' })
        .where('orderNum > :orderNum', { orderNum: card.orderNum })
        .execute();
      //MoreThan 보다 이게 더 쉬움
      const maxCardOrderNum = await queryRunner.manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .select('MAX(card.orderNum)', 'max')
        .where('card.columnId = :id', { id: columnId })
        .getRawOne();

      const orderNum = maxCardOrderNum.max ? maxCardOrderNum.max + 1 : 1;

      await this.cardRepository.update(cardId, { columnId: columnId, orderNum: orderNum });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCard(cardId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const card = await this.getCardById(cardId);
      await this.checkCardOwner(cardId, userId);
      console.log('1124');
      await queryRunner.manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .update(Card)
        .set({ orderNum: () => 'orderNum - 1' })
        .where('orderNum > :orderNum', { orderNum: card.orderNum })
        .execute();
      console.log('1124');
      await queryRunner.manager.getRepository(Card).delete({ id: cardId });
      console.log('1124');

      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getWorker(cardId: number, userId: number) {
    const whereCondition: FindOptionsWhere<any> = [
      { cardId: cardId, workerId: userId },
      { cardId: cardId, ownerId: userId },
    ];

    const workers = await this.cardWorkerRepository.find({ where: whereCondition });

    if (workers.length === 0) {
      throw new UnauthorizedException('작업자 인증을 받지 못했습니다.');
    }

    return workers;
  }

  //보드에서 컬럼 생성 혼자 해봄 걍 다 보드로 보면 됨
  // async createBoardOrder(boardId: number) {
  //   const lastCard = await this.cardRepository.findOne({
  //     order: { orderNum: 'DESC' },
  //   });
  //   const cardOrderNum = lastCard ? lastCard.orderNum + 1024 : 1024;
  //   const newCard = await this.cardRepository.save({
  //     columnId: boardId,
  //     orderNum: cardOrderNum,
  //   });
  //   return newCard;
  // }
}
