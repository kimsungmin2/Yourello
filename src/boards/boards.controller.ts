import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, Request, NotFoundException, Query } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InviteDto } from './dto/invite.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { BoardGuard } from './utils/guard/boards.guard';
import { EmailService } from 'src/email/email.service';

@ApiTags('Board')
@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @ApiOperation({ summary: '보드 생성' })
  @Post()
  async create(@Request() req, @Body() createBoardDto: CreateBoardDto, @Res() res) {
    const userId = req.user.id;
    this.boardsService.create(userId, createBoardDto);
    res.send('보드가 생성되었습니다.');
  }

  @ApiOperation({ summary: '보드 전체 조회' })
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    return this.boardsService.findAll(userId);
  }

  @UseGuards(BoardGuard)
  @ApiOperation({ summary: '보드 상세 조회' })
  @Get(':boardId')
  async findOne(@Param('boardId') id: string) {
    return await this.boardsService.findOne(+id);
  }

  @UseGuards(BoardGuard)
  @ApiOperation({ summary: '보드 멤버 조회' })
  @Get('/member/:boardId')
  async getBoardMemberById(@Param('boardId') id: string) {
    return await this.boardsService.getBoardMember(+id);
  }

  @UseGuards(BoardGuard)
  @ApiOperation({ summary: '보드 수정' })
  @Patch(':boardId')
  async update(@Param('boardId') id: string, @Body() updateBoardDto: UpdateBoardDto, @Res() res, @Request() req) {
    const userId = req.user.id;
    await this.boardsService.update(+id, updateBoardDto, userId);

    res.send('보드가 수정되었습니다.');
  }

  @UseGuards(BoardGuard)
  @ApiOperation({ summary: '보드 삭제' })
  @Delete(':boardId')
  async remove(@Param('boardId') id: string, @Res() res, @Request() req) {
    const userId = req.user.id;
    await this.boardsService.remove(+id, userId);
    res.send('보드가 삭제되었습니다.');
  }

  @UseGuards(BoardGuard)
  @ApiOperation({ summary: '보드 초대' })
  @Post('invite/:boardId')
  async inviteSend(@Body() { email }: InviteDto, @Res() res, @Param('boardId') boardId: string, @Request() req) {
    const ownerUserId = req.user.id;
    await this.boardsService.invite(+ownerUserId, +boardId, email);
    await this.usersService.findByEmail(email);
    const board = await this.boardsService.findOne(+boardId);
    await this.emailService.sendVerificationToEmail(email, boardId, board.title);
    res.send('보드 초대 메일을 발송했습니다.');
  }

  @Get('invite/accept')
  async inviteAccept(@Query('boardId') boardId: string, @Query('email') email: string, @Res() res) {
    console.log(boardId, email);
    await this.boardsService.inviteAccept(+boardId, email);
    res.send('초대를 수락하였습니다.');
  }
}
