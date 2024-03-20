import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { InviteDto } from './dto/invite.dto';
import { BoardMember } from './entities/boardmember.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
  ) {}
  async create(userId: number, createBoardDto: CreateBoardDto) {
    const { title, backgroundcolor, explanation } = createBoardDto;

    const board = await this.boardRepository.save({
      title,
      backgroundcolor,
      explanation,
    });

    await this.boardMemberRepository.save({
      boardId: board.id,
      userId,
      owner: true,
    });
  }

  async findAll(): Promise<Board[]> {
    return await this.boardRepository.find({
      select: ['id', 'title', 'explanation'],
    });
  }

  async findOne(id: number) {
    return await this.verifyBoard(id);
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = await this.verifyBoard(id);
    const data = updateBoardDto;
    return await this.boardRepository.update({ id }, data);
  }

  async remove(id: number) {
    const board = await this.verifyBoard(id);
    await this.boardRepository.delete({ id });
  }

  async invite(inviteDto: InviteDto) {}

  private async verifyBoard(id: number) {
    const board = await this.boardRepository.findOneBy({ id });
    if (_.isNil(board)) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }
  }
}
