import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardWorker } from './entities/cardworker.entity';
import { CardList } from './entities/cardList.entity';
import { AwsService } from 'src/aws/aws.service';
import { CardListService } from './card-list.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Card, CardWorker, CardList]),
  ],
  controllers: [CardsController],
  providers: [CardsService, AwsService, CardListService],
})
export class CardsModule {}
