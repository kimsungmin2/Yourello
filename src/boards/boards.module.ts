import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/boardmember.entity';
import { User } from 'src/users/entities/user.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule,TypeOrmModule.forFeature([Board,BoardMember,User])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService]
})
export class BoardsModule {}
