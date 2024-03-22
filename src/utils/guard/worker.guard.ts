import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class WorkerGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly cardsService: CardsService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const { user } = context.switchToHttp().getRequest();
    const cardId = request.params.boardId;

    const worker = await this.cardsService.getWorker(cardId, user.id);
    if (worker.length === 0) {
      throw new UnauthorizedException('유저 권한이 없습니다.');
    }

    return true;
  }
}
