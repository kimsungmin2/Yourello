// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { Request } from 'express';
// import { CardsService } from 'src/cards/cards.service';

// @Injectable()
// export class JwtWorkerStrategy extends PassportStrategy(Strategy, 'jwt-worker') {
//   constructor(private readonly cardsService: CardsService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET,
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request, payload: any): Promise<any> {
//     const cardId = req.params.cardId;
//     const user = payload;

//     const boardMembers = await this.cardsService.getWorker(+cardId, user.id);
//     if (boardMembers.length === 0) {
//       throw new NotFoundException('유저 권한이 없습니다.');
//     }

//     return user;
//   }
// }
