import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { NotFoundException } from '@nestjs/common';

describe('ColumnsService', () => {
  let service: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnsService],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
  });

  //컬럼 생성
  it('created column', async () => {
    const boardId = 1;
    const title = 'Test Column';

    const createdColumn = await service.create(boardId, title);
    expect(createdColumn).toBeDefined();
    expect(createdColumn.boardId).toBe(boardId);
    expect(createdColumn.title).toBe(title);
  });

  //컬럼 조회
  it('get all columns', async () => {
    const columns = await service.getColumns();

    expect(columns).toBeDefined();
    expect(columns.length).toBeGreaterThan(0);
  });

  //컬럼 상세 조회
  it('get column', async () => {
    const columnId = 1;
    const column = await service.getColumn(columnId);

    expect(column).toBeDefined();
    expect(column.id).toBe(columnId);
  });

  //컬럼 이름 수정
  it('update column title', async () => {
    const columnId = 1;
    const title = 'Updated Column Title';

    const updatedColumn = await service.update(columnId, title);

    expect(updatedColumn).toBeDefined();
    expect(updatedColumn.title).toBe(title);
  });

  //컬럼 삭제
  it('deleted column', async () => {
    const columnId = 1;

    await service.remove(columnId);

    await expect(service.getColumn(columnId)).rejects.toThrow(NotFoundException);
  });

  //컬럼 순서 이동
  it('column move index', async () => {
    const columnId = 1;
    const newIndex = 2;

    await service.move(columnId, newIndex);

    const movedColumn = await service.getColumn(columnId);

    expect(movedColumn.order).toBe(newIndex);
  });

  //보드 확인
  it('not found board', async () => {
    const boardId = 900;
    const title = 'Test Column';

    const Boardcheck = await service.create(boardId, title);
    await expect(Boardcheck).rejects.toThrow(NotFoundException);
  });

  //컬럼 확인
  it('not found column', async () => {
    const columnId = 900;
    const title = 'Test Column';

    const Columncheck = await service.create(columnId, title);
    await expect(Columncheck).rejects.toThrow(NotFoundException);
  });
});
