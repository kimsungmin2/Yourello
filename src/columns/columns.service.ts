import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Columns } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { Board } from 'src/boards/entities/board.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Columns)
    private columnsRepository: Repository<Columns>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  //컬럼 생성
  async create(boardId: number, title: string): Promise<Columns> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }
    const column = this.columnsRepository.create({ title, boardId });
    return this.columnsRepository.save(column);
  }

  //컬럼 조회
  async getColumns(): Promise<Columns[]> {
    const columns = await this.columnsRepository.find({ order: { order: 'ASC' } });
    if (!columns) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    return columns;
  }

  //컬럼 상세 조회
  async getColumn(id: number): Promise<Columns> {
    const columns = await this.columnsRepository.findOne({ where: { id } });
    if (!columns) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    return columns;
  }

  //컬럼 이름 수정
  async update(id: number, newTitle: string): Promise<Columns> {
    const column = await this.columnsRepository.findOne({ where: { id } });
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    column.title = newTitle;
    return this.columnsRepository.save(column);
  }

  //컬럼 삭제
  async remove(id: number): Promise<void> {
    await this.columnsRepository.delete(id);
  }

  //컬럼 순서 이동
  async move(id: number, newIndex: number): Promise<void> {
    const column = await this.columnsRepository.findOne({ where: { id } });
    if (!column) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    const currentOrder = column.order;
    if (currentOrder < newIndex) {
      await this.columnsRepository
        .createQueryBuilder()
        .update(Columns)
        .set({ order: () => 'order - 1' })
        .where('order > :currentOrder AND order <= :newIndex', { currentOrder, newIndex })
        .execute();
    } else if (currentOrder > newIndex) {
      await this.columnsRepository
        .createQueryBuilder()
        .update(Columns)
        .set({ order: () => 'order + 1' })
        .where('order >= :newIndex AND order < :currentOrder', { newIndex, currentOrder })
        .execute();
    }

    column.order = newIndex;
    await this.columnsRepository.save(column);
  }
}
