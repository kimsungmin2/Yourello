import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InviteDto } from './dto/invite.dto';

@ApiTags('Board')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @ApiOperation({ summary: '보드 생성' })
  @Post()
  async create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Get()
  async findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto, @Res() res) {
    await this.boardsService.update(+id, updateBoardDto);
    res.send('보드가 수정되었습니다.');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    this.boardsService.remove(+id);
    res.send('보드가 삭제되었습니다.');
  }

  @Post('invite')
  async invite(@Body() inviteDto: InviteDto) {
    await this.boardsService.invite(inviteDto);
  }
}
