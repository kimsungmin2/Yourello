import { Test, TestingModule } from '@nestjs/testing';
import { CardListService } from './card-list.service';

describe('CardListService', () => {
  let service: CardListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardListService],
    }).compile();

    service = module.get<CardListService>(CardListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
