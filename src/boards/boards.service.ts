import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>
  ){}

  async create(createBoardDto: CreateBoardDto) {
    const { title, backgroundcolor, explanation } = createBoardDto;

    if(_.isNil(title) || _.isNil(backgroundcolor) || _.isNil(explanation)){
      throw new BadRequestException(
        '보드명, 배경색상, 보드에 대한 설명을 입력하세요.'
      );
    }

    await this.boardRepository.save(createBoardDto);

    return {message: `보드명 ${title}이 생성되었습니다.`};
  }

  async findAll(): Promise<Board[]> {
     const boards = await this.boardRepository.find({
      select: ['title','backgroundcolor','explanation' ]
    });

    if(_.isNil(boards)){
      throw new NotFoundException('존재하지 않는 팀입니다.');
    }

    return boards;
  }

  async findOne(id: number) {
    const board = await this.boardRepository.findOneBy({id});
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 팀입니다.');
    }
    return board;

  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = await this.boardRepository.findOneBy({id});
    
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 팀입니다.');
    }

    const result = await this.boardRepository.update({id},updateBoardDto);

    return result;
  }

  async remove(id: number) {
    const board = await this.boardRepository.findOneBy({id});
    
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 팀입니다.');
    }
    
    const result = await this.boardRepository.delete({id});

    return result;
  }
}
