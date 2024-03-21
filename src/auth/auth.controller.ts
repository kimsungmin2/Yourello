// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, Redirect, HttpStatus } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { KakaoAuthGuard } from 'src/utils/guard/kakao.guard';
// import { NaverAuthGuard } from 'src/utils/guard/naver.guard';
// import { ApiTags } from '@nestjs/swagger';

// @ApiTags('간편 회원가입 직접 주소를 타이핑해주세요')
// @Controller('oauth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}
//   @UseGuards(KakaoAuthGuard)
//   @Get('')
//   redirectToKakaoAuth(@Res() res) {
//     const KAKAO_REST_API_KEY = process.env.KAKAO_CLIENT_ID;
//     const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
//     const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}`;

//     res.redirect(HttpStatus.TEMPORARY_REDIRECT, kakaoAuthURL);
//   }

//   @UseGuards(KakaoAuthGuard)
//   @Get('/callback')
//   async kakaoCallbacks(@Req() req, @Res() res) {
//     const accessToken = req.user.accessToken;
//     const refreshToken = req.user.refreshToken;

//     res.cookie('authorization', `Bearer ${accessToken}`);
//     res.cookie('refreshToken', refreshToken);
//     res.redirect('/');
//   }

//   @UseGuards(NaverAuthGuard)
//   @Get('/naver')
//   redirectToNaverAuth(@Res() res) {
//     const NAVER_REST_API_KEY = process.env.NAVER_CLIENT_ID;
//     const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI;
//     const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_REST_API_KEY}&redirect_uri=${NAVER_REDIRECT_URI}&state=hLiDdL2uhPtsftcU`;

//     res.redirect(HttpStatus.TEMPORARY_REDIRECT, naverURL);
//   }

//   @UseGuards(NaverAuthGuard)
//   @Get('/naver/callback')
//   async naverCallbacks(@Req() req, @Res() res) {
//     console.log(req.user.accessToken);
//     const accessToken = req.user.accessToken;
//     const refreshToken = req.user.refreshToken;

//     res.cookie('authorization', `Bearer ${accessToken}`);
//     res.cookie('refreshToken', refreshToken);
//     res.redirect('/');
//   }
// }
