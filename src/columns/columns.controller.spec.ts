import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

jest.mock('./entities/column.entity');
jest.mock('././boards/entities/board.entity');
describe('ColumnsController', () => {
  let controller: ColumnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [ColumnsService],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  //컬럼 생성
  it('create column', async () => {
    const boardId = 1;
    const title = 'Test Column';

    const result = await controller.create(boardId, title);
    expect(result).toBeDefined();
  });

  //컬럼 조회
  it('get columns', async () => {
    const result = await controller.getColumns();
    expect(result).toBeDefined();
  });

  //컬럼 상세 조회
  it('get column', async () => {
    const columnId = 1;
    const result = await controller.getColumn(columnId);
    expect(result).toBeDefined();
  });

  //컬럼 이름 수정
  it('column title update', async () => {
    const columnId = 1;
    const title = 'Test Column';
    const result = await controller.update(columnId, title);
    expect(result).toBeDefined();
  });

  //컬럼 삭제
  it('column delete', async () => {
    const columnId = 1;
    const result = await controller.remove(columnId);
    expect(result).toBeDefined();
  });

  //컬럼 순서 이동
  it('column move', async () => {
    const columnId = 1;
    const newIndex = 2;
    const result = await controller.move(columnId, newIndex);
    expect(result).toBeDefined();
  });
});
