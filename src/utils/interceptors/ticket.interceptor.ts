import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BoardsService } from 'src/boards/boards.service';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class CardInterceptor implements NestInterceptor {
  constructor(private readonly cardService: CardsService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const card = await this.cardService.getCardById(userId);
    request.card = [card];

    return next.handle().pipe(map((data) => ({ ...data, card })));
  }
}
