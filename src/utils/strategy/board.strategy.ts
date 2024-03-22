// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { BoardsService } from 'src/boards/boards.service';
// import { Request } from 'express';

// @Injectable()
// export class JwtBoardStrategy extends PassportStrategy(Strategy, 'jwt-board') {
//   constructor(private readonly boardsService: BoardsService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET,
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request, payload: any): Promise<any> {
//     const boardId = req.params.boardId;
//     const user = payload;

//     const boardMembers = await this.boardsService.getBoardMember(boardId, user.id);
//     if (boardMembers.length === 0) {
//       throw new NotFoundException('유저 권한이 없습니다.');
//     }

//     return user;
//   }
// }
