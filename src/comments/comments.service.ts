import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
// import { CreateCommentDto } from './dto/create-comment.dto';
// import { UpdateCommentDto } from './dto/update-comment.dto';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  /**댓글 조회*/
  async getAllComments(): Promise<Comment[]> {
    const comment = await this.commentRepository.find();

    if (!comment) {
      throw new NotFoundException('댓글 조회 실패 (ㅠoㅠ). 확인해주세요!');
    }

    return comment;
  }

  /**댓글 상세 조회*/
  async getCommentById(cardId: number, id: number) {
    const comment = await this.commentRepository.findOneBy({ cardId, id });

    if (!comment) {
      throw new NotFoundException('해당 댓글 조회 실패 (ㅠoㅠ). 확인해주세요!');
    }

    return comment;
  }

  /** 댓글 생성 */
  async createComment(cardId: number, content: string) {
    return await this.commentRepository.save({ cardId: cardId, content });
  }

  /**댓글 수정 */
  /**권한여부 */
  async updateComment(id: number, userId: number, content: string) {
    const comment = await this.commentRepository.findOneBy({ id });

    if (comment.userId !== userId) {
      throw new UnauthorizedException('댓글 수정 실패 (ㅠoㅠ). 확인해주세요!');
    }

    return await this.commentRepository.update({ id }, { content });
  }

  /**댓글 삭제 */
  async deleteComment(id: number, userId: number) {
    const comment = await this.commentRepository.findOneBy({ id });

    if (comment.userId !== userId) {
      throw new UnauthorizedException('댓글 삭제 실패 (ㅠoㅠ). 확인해주세요!');
    }

    return await this.commentRepository.delete({ id });
  }
}
