import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { AwsService } from 'src/aws/aws.service';
import { BoardMember } from 'src/boards/entities/boardmember.entity';
import { Columns } from 'src/columns/entities/column.entity';
import { CardWorker } from './entities/cardworker.entity';
import { WorkerDto } from './dto/worker.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardWorker)
    private cardWorkerRepository: Repository<CardWorker>,
    private dataSource: DataSource,
    private awsService: AwsService,
  ) {}

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
      const user = await queryRunner.manager.getRepository(BoardMember).findOneBy({ id: column.boardId });
      if (user.userId !== userId) {
        throw new ForbiddenException('카드를 만들 권한이 없습니다.');
      }
      const imageName = this.awsService.getUUID();
      const ext = file.originalname.split('.').pop();
      const imageUrl = await this.awsService.imageUploadToS3(`${imageName}.${ext}`, file, ext);

      const maxCardOrderNum = await queryRunner.manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .select('MAX(card.orderNum)', 'max')
        .where('card.columnId = :id', { id: columnId })
        .getRawOne();

      const OrderNum = maxCardOrderNum.max ? maxCardOrderNum.max + 1 : 1;

      const card = await queryRunner.manager.getRepository(Card).save({
        columnId,
        title,
        info,
        color,
        deadLine,
        cardImage: imageUrl,
        orderNum: OrderNum,
      });

      await queryRunner.manager.getRepository(CardWorker).save({
        ownerId: userId,
        cardId: card.id,
      });
      return card;
    } catch (error) {
      await queryRunner.rollbackTransaction();
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
          .set({ orderNum: () => 'orderNum - 1' })
          .where('orderNum <= :newOrderNum AND orderNum > :orderNum', { newOrderNum, orderNum: card.orderNum })
          .execute();
      } else if (card.orderNum > newOrderNum) {
        await queryRunner.manager
          .getRepository(Card)
          .createQueryBuilder('card')
          .update(Card)
          .set({ orderNum: () => 'orderNum + 1' })
          .where('orderNum < :orderNum AND orderNum >= :newOrderNum', { newOrderNum, orderNum: card.orderNum })
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
    const card = await this.dataSource
      .getRepository(Card)
      .createQueryBuilder('card')
      .where('card.columnId = :columnId', { columnId })
      .orderBy('card.orderNum', 'ASC')
      .getMany();
    return card;
  }

  async updateWorkerCard(cardId: number, userId: number, worker: number) {
    await this.getCardById(cardId);
    const cardWorker = await this.cardWorkerRepository.findOneBy({ cardId });
    if (cardWorker.ownerId !== userId) {
      throw new ForbiddenException('변경 권환이 없습니다.');
    }

    const workerUpdate = await this.cardWorkerRepository.update(cardWorker.id, { worker });
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

      await this.cardRepository.update(cardId, { columnId: columnId });
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCard(cardId: number, userId: number): Promise<void> {
    await this.getCardById(cardId);
    await this.checkCardOwner(cardId, userId);

    try {
      await this.cardRepository.delete({ id: cardId });
    } catch (error) {
      throw new InternalServerErrorException('카드 삭제 중 오류가 발생했습니다.');
    }
  }
  //보드에서 컬럼 생성 혼자 해봄 걍 다 보드로 보면 됨
  async createBoardOrder(boardId: number) {
    const lastCard = await this.cardRepository.findOne({
      order: { orderNum: 'DESC' },
    });
    const cardOrderNum = lastCard ? lastCard.orderNum + 1024 : 1024;
    const newCard = await this.cardRepository.save({
      columnId: boardId,
      orderNum: cardOrderNum,
    });
    return newCard;
  }
}
