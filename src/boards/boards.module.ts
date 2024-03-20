import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/boardmember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardMember])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
