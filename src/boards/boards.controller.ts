import { BoardGuard } from 'src/utils/guard/board.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InviteBoardMemberDto } from './dto/invite-board.dto';
import { AcceptBoardMemberDto } from './dto/accept-board.dto';

@ApiTags('Board')
@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}


  // @Get('/accept')
  // accept(@Req() req, 
  //         @Query('email') email: string, 
  //         @Query('code') code: string,
  //         ){
  //   console.log('email', email)
  //   console.log('code', code)
  //   console.log('req.user', req.user)
  //   return this.boardsService.accept(email, code);
  // }

  // @Get('/accept/:email/:code')
  // accept(@Req() req, 
  //         @Param('email') email: string, 
  //         @Param('code') code: string,
  //         ){
  //   console.log('email', email)
  //   console.log('code', code)
  //   console.log('req.user', req.user)
  //   return this.boardsService.accept(email, code);
  // }



  @Post()
  create(
    @Req() req,
    @Body() createBoardDto: CreateBoardDto) {
      const user = req.user
      return this.boardsService.create(user.id, createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') boardId: string) {
    return this.boardsService.findOne(+boardId);
  }
  
  @UseGuards(BoardGuard)
  @Patch(':id')
  update(@Param('id') boardId: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(+boardId, updateBoardDto);
  }

  @UseGuards(BoardGuard)
  @Delete(':id')
  remove(@Param('id') boardId: string) {
    return this.boardsService.remove(+boardId);
  }

  @UseGuards(BoardGuard)
  @Post('/invite/:id')
  invite(@Param('id') boardId: string,
        @Body() inviteBoardMemberDto: InviteBoardMemberDto ){
    console.log('inviteBoardMemberDto', inviteBoardMemberDto)
    return this.boardsService.invite(+boardId, inviteBoardMemberDto);
  }

  @Post('/accept/:id')
  accept(@Req() req,
         @Param('id') boardId: string,
         @Body() acceptBoardMemberDto: AcceptBoardMemberDto ){

  const { email, token } = acceptBoardMemberDto
  const user = req.user
   return this.boardsService.accept( +boardId, email, token);
  }

}
