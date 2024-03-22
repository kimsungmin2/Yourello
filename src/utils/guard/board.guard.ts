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
    //console.log('request',request)
    const { user } = context.switchToHttp().getRequest();
    const boardId = request.params.id;
    console.log('guard : boardId',boardId)
    const boardMember = await this.boardsService.getBoardMemberById(boardId);
    console.log('guard : boardMember', boardMember)

if(boardMember.find(obj => obj.userId === user.id)) {
  return true;
} else {

  throw new UnauthorizedException('유저 권한이 없습니다.');
}

    // if (boardMember !== user.id) {
    //   throw new UnauthorizedException('유저 권한이 없습니다.');
    // }
    //return true;
  }
}