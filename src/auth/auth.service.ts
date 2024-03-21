// import { Injectable } from '@nestjs/common';
// import { UserService } from 'src/user/user.service';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//   ) {}

//   async validateUser(email: string) {
//     const user = await this.userService.findByEmail(email);
//     if (!user) {
//       return null;
//     }
//     return user;
//   }

//   async createToken(id: string) {
//     const userEmail = await this.userService.findByEmail(id);

//     const payload = { userEmail };

//     const accessToken = this.jwtService.sign(payload, {
//       secret: process.env.JWT_SECRET_KEY,
//       expiresIn: '12h',
//     });

//     const refreshToken = this.jwtService.sign(payload, {
//       secret: process.env.REFRESH_SECRET,
//       expiresIn: '7d',
//     });

//     return { accessToken, refreshToken };
//   }
// }
