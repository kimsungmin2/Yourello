import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BoardsService } from 'src/boards/boards.service';
@Injectable()
export class BoardGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly boardsService: BoardsService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const { user } = context.switchToHttp().getRequest();
    const boardId = request.params.boardId;
    const boardMember = await this.boardsService.getBoardMemberById(boardId);
    if (!boardMember.includes(user.id)) {
      throw new UnauthorizedException('유저 권한이 없습니다.');
    }
    return true;
    // if (boardMember.userId !== user.id) {
    //   throw new UnauthorizedException('유저 권한이 없습니다.');
    // }
    // return true;
  }
}
