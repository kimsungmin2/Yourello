// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class TicketInterceptor implements NestInterceptor {
//   constructor(private readonly ticketService: TicketService) {}

//   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
//     const request = context.switchToHttp().getRequest();
//     const userId = request.user.id;

//     const ticket = await this.ticketService.getTicket(userId);
//     request.ticket = [ticket];

//     return next.handle().pipe(map((data) => ({ ...data, ticket })));
//   }
// }
