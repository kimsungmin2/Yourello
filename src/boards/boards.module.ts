import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/boardmember.entity';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardMember, User])],
  controllers: [BoardsController],
  providers: [BoardsService, EmailService, UsersService, JwtService],
})
export class BoardsModule {}
