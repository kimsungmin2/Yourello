import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Get } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { AuthGuard } from '@nestjs/passport';
// import { CreateColumnDto } from './dto/create-column.dto';
// import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  //컬럼 생성
  @UseGuards(AuthGuard('jwt'))
  @Post(':boardId')
  create(@Param('boardId') boardId: number, @Body('title') title: string) {
    return this.columnsService.create(boardId, title);
  }

  //컬럼 조회
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getColumns() {
    return await this.columnsService.getColumns();
  }

  //컬럼 상세 조회
  @UseGuards(AuthGuard('jwt'))
  @Get(':Id')
  async getColumn(@Param('Id') Id: number) {
    return await this.columnsService.getColumn(Id);
  }

  //컬럼 이름 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: number, @Body('title') newTitle: string) {
    return this.columnsService.update(id, newTitle);
  }

  //컬럼 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.columnsService.remove(id);
  }

  //컬럼 순서 이동
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/move/:newIndex')
  move(@Param('id') id: number, @Param('newIndex') newIndex: number) {
    return this.columnsService.move(id, newIndex);
  }
}
