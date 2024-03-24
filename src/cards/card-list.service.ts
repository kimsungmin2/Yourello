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
    private cardListRepository: Repository<CardList>,
  ) {}

  async checkList(cardId: number, cardContent: string) {
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotAcceptableException('존재하지 않는 카드입니다.');
    }
    console.log(card);
    const checkId = await this.cardListRepository.save({
      cardId,
      cardContent,
    });
    console.log(checkId);
    return checkId;
  }

  async checkListUpdate(cardListId: number) {
    const checklist = await this.cardListRepository.findOneBy({ id: cardListId });
    if (!checklist) {
      throw new NotAcceptableException('존재하지 않는 카드리스트입니다.');
    }
    const card = await this.cardRepository.findOneBy({ id: checklist.cardId });
    if (!card) {
      throw new NotAcceptableException('존재하지 않는 카드입니다.');
    }
    return await this.cardListRepository.update(cardListId, { checking: !checklist.checking });
  }

  async getCheckList(cardId: number) {
    const checkList = await this.cardListRepository.find({ where: { cardId } });
    const completeCheck = checkList.filter((item) => item.checking).length;

    const checkListPercentage = checkList.length > 0 ? (completeCheck / checkList.length) * 100 : 0;
    return { checkList, checkListPercentage };
  }

  async deleteCheckList(cardId: number, cardListId: number) {
    const checklist = await this.cardListRepository.findOneBy({ id: cardListId });
    if (!checklist) {
      throw new NotAcceptableException('존재하지 않는 카드리스트입니다.');
    }
    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotAcceptableException('존재하지 않는 카드입니다.');
    }
    console.log(card);
    return await this.cardListRepository.delete({ id: cardListId });
  }
}
