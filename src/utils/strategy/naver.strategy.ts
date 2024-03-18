// import { Strategy, Profile } from 'passport-naver';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { AuthService } from '../../auth/auth.service';
// import { UserService } from 'src/user/user.service';

// @Injectable()
// export class NaverStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private authService: AuthService,
//     private userService: UserService,
//   ) {
//     super({
//       clientID: process.env.NAVER_CLIENT_ID,
//       clientSecret: process.env.NAVER_SECRET,
//       callbackURL: process.env.NAVER_REDIRECT_URI,
//     });
//   }

//   async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
//     try {
//       const email = profile._json.email;
//       console.log(email);
//       const nickName = profile._json.nickname;
//       const provider = 'naver';

//       let user = await this.userService.findByEmail(email);
//       if (!user) {
//         user = await this.userService.createProviderUser(email, nickName, provider);
//       }

//       const token = await this.authService.createToken(email);
//       const accessToken = token.accessToken;
//       const refreshToken = token.refreshToken;

//       done(null, { accessToken, refreshToken });
//     } catch (error) {
//       console.error('인증 처리 중 오류 발생:', error);
//       done(error, false);
//     }
//   }
// }
