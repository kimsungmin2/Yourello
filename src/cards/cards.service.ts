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

  async getCardById(cardId: number) {
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotFoundException('해당 카드가 없습니다.');
    }
    return card;
  }

  async getDeadLineCardList(columnId: number) {
    const cards = await this.cardRepository.find({
      where: { columnId },
      order: {
        deadLine: 'ASC',
      },
    });

    return cards;
  }

  async changeCardOrder(cardId: number, orderNum: number, userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const card = await queryRunner.manager.getRepository(Card).findOneBy({ id: cardId });
      const cardWorker = await queryRunner.manager.getRepository(CardWorker).findOneBy({ cardId });
      if (!cardWorker) {
        throw new NotFoundException('카드가 없습니다.');
      }
      if (cardWorker.ownerId !== userId) {
        throw new ForbiddenException('변경 권환이 없습니다.');
      }
      if (!card) {
        throw new NotFoundException('카드를 찾을 수 없습니다.');
      }
      await queryRunner.manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .where('card.id = :id', { id: cardId })
        .setLock('pessimistic_write')
        .getOne();
      if (orderNum > 0) {
        const newOrderNum = card.orderNum - orderNum;

        await queryRunner.manager
          .createQueryBuilder()
          .update(Card)
          .set({ orderNum: () => 'orderNum + 1' })
          .where('orderNum > :newOrderNum', { newOrderNum })
          .execute();
      } else {
        const newOrderNum = card.orderNum + orderNum;

        await queryRunner.manager
          .createQueryBuilder()
          .update(Card)
          .set({ orderNum: () => 'orderNum - 1' })
          .where('orderNum < :newOrderNum', { newOrderNum })
          .execute();
        await queryRunner.manager.getRepository(Card).update(cardId, {
          orderNum: newOrderNum,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCardList(columnId: number) {
    const card = await this.dataSource
      .getRepository(Card)
      .createQueryBuilder('card')
      .where('card.columnId = :columnId', { columnId })
      .orderBy('card.orderNum', 'ASC')
      .getMany();
    return card;
  }

  async updateWorkerCard(cardId: number, userId: number, worker: number) {
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotFoundException('해당 카드가 없습니다.');
    }
    const cardWorker = await this.cardWorkerRepository.findOneBy({ cardId });
    if (cardWorker.ownerId !== userId) {
      throw new ForbiddenException('변경 권환이 없습니다.');
    }

    const workerUpdate = await this.cardWorkerRepository.update(cardWorker.id, { worker: worker });
    return workerUpdate;
  }

  async updateCard(cardId: number, userId: number, updateCardDto: UpdateCardDto, file: Express.Multer.File) {
    const imageName = this.awsService.getUUID();
    const ext = file.originalname.split('.').pop();
    const imageUrl = await this.awsService.imageUploadToS3(`${imageName}.${ext}`, file, ext);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const card = await queryRunner.manager.getRepository(Card).findOneBy({ id: cardId });
      if (!card) {
        throw new NotFoundException('해당 카드가 없습니다.');
      }
      const cardWorker = await queryRunner.manager.getRepository(CardWorker).findOneBy({ cardId });
      if (!cardWorker) {
        throw new NotFoundException('카드가 없습니다.');
      }
      if (cardWorker.ownerId !== userId) {
        throw new ForbiddenException('변경 권환이 없습니다.');
      }
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

  async updatedColumn(cardId: number, userId: number, columnId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const card = await queryRunner.manager.getRepository(Card).findOneBy({ id: cardId });
      if (!card) {
        throw new NotFoundException('해당 카드가 없습니다.');
      }
      const cardWorker = await queryRunner.manager.getRepository(CardWorker).findOneBy({ cardId });
      if (!cardWorker) {
        throw new NotFoundException('카드가 없습니다.');
      }
      if (cardWorker.ownerId !== userId) {
        throw new ForbiddenException('변경 권환이 없습니다.');
      }
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

  async deleteCard(cardId: number, userId: number) {
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotFoundException('해당 카드가 없습니다.');
    }
    const cardWorker = await this.cardWorkerRepository.findOneBy({ cardId });
    if (cardWorker.ownerId !== userId) {
      throw new ForbiddenException('변경 권환이 없습니다.');
    }
    try {
      await this.cardRepository.delete({ id: cardId });
    } catch (error) {
      throw new InternalServerErrorException('카드 삭제 중 오류가 발생했습니다.');
    }
  }
}
