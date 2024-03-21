import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, Query, UseGuards } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  //댓글 조회
  @Get('')
  async getAllComments(@Param('cardId') cardId: number) {
    return await this.commentsService.getCommentByCardId(cardId);
  }

  //댓글 생성
  //@Role()
  @Post('')
  // @UsePipes(ValidationPipe)
  async createComment(@UserInfo() user: User, @Param('cardId') cardId: number, @Body() createCommentDto: CreateCommentDto) {
    await this.commentsService.createComment(cardId, user.id, createCommentDto.content);

    return { message: '댓글 작성 성공 (^O^)' };
  }

  // 댓글 수정
  @Patch(':id')
  async updateComment(@UserInfo() user: User, @Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto) {
    await this.commentsService.updateComment(id, user.id, updateCommentDto.content);

    return { message: '댓글 수정 성공 (^O^)' };
  }

  // 댓글 삭제
  @Delete(':id')
  async deleteComment(@UserInfo() user: User, @Param('id') id: number) {
    await this.commentsService.deleteComment(id, user.id);

    return { message: '댓글 삭제 성공 (^O^)' };
  }
}
