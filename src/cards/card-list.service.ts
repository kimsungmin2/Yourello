import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardList } from './entities/cardList.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardListService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardList)
    private cardWorkerRepository: Repository<CardList>,
  ) {}

  async checkList(cardId: number, cardContent: string) {
    const card = this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotAcceptableException('존재하지 않는 카드입니다.');
    }
    const checkId = this.cardWorkerRepository.save({
      cardId,
      cardContent,
    });
    return checkId;
  }

  async checkListUpdate(cardListId: number) {
    return this.cardWorkerRepository.update(cardListId, { checking: true });
  }

  async getCheckList(cardId: number) {
    return this.cardWorkerRepository.find({ where: { cardId } });
  }
}
