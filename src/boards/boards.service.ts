import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}
  async create(createBoardDto: CreateBoardDto) {
    const { title, backgroundcolor, explanation } = createBoardDto;

    return await this.boardRepository.save({
      title,
      backgroundcolor,
      explanation,
    });
  }

  async findAll(): Promise<Board[]> {
    return await this.boardRepository.find({
      select: ['id', 'title', 'explanation'],
    });
  }

  async findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
