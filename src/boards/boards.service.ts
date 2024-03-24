import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import _ from 'lodash';
import { BoardMember } from './entities/boardmember.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async findAll(userId: number) {
    const user = await this.boardMemberRepository.find({
      where: { userId },
    });
    const boardIds = user.map((user) => user.boardId);

    const boards = await this.boardRepository.find({
      where: { id: In(boardIds) },
      select: ['id', 'title', 'explanation'],
    });
    return boards;
  }

  async findOne(id: number) {
    return await this.verifyBoard(id);
  }

  async update(id: number, updateBoardDto: UpdateBoardDto, userId: number) {
    await this.verifyBoard(id);
    const user = await this.checkOwner(id, userId);
    if (!user || !user.owner) {
      throw new UnauthorizedException('보드를 수정할 권한이 없습니다.');
    }
    const data = updateBoardDto;
    return await this.boardRepository.update({ id }, data);
  }

  async remove(id: number, userId: number) {
    await this.verifyBoard(id);
    const user = await this.checkOwner(id, userId);
    if (!user || !user.owner) {
      throw new UnauthorizedException('보드를 삭제할 권한이 없습니다.');
    }
    return await this.boardRepository.delete(id);
  }

  async invite(userId: number, boardId: number, email: string) {
    const ownerUser = await this.checkOwner(boardId, userId);
    if (!ownerUser || !ownerUser.owner) {
      throw new UnauthorizedException('이 보드의 초대할 권한이 없습니다.');
    }
    const user = await this.userRepository.findOne({
      where: { email },
    });
    const checkUser = await this.boardMemberRepository.findOne({
      where: { userId: user.id, boardId },
    });
    if (checkUser) {
      throw new BadRequestException('이미 존재하는 멤버입니다.');
    }
  }

  async inviteAccept(boardId: number, email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    await this.boardMemberRepository.save({
      boardId: +boardId,
      userId: user.id,
    });
  }

  async getBoardMember(boardId: number) {
    const users = await this.boardMemberRepository.find({
      where: { boardId },
    });
    const userIds = users.map((users) => users.userId);

    const boardMember = await this.userRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'name', 'email'],
    });

    return boardMember;
  }

  async getBoardMemberById(boardId: number) {
    const users = await this.boardMemberRepository.find({
      where: { boardId },
    });
    const userIds = users.map((users) => users.userId);
    return userIds;
  }

  private async verifyBoard(id: number) {
    const board = await this.boardRepository.findOneBy({ id });
    if (_.isNil(board)) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }
    return board;
  }

  private async checkOwner(id: number, userId: number) {
    const user = await this.boardMemberRepository.findOne({
      where: { userId, boardId: id },
    });

    return user;
  }
}
