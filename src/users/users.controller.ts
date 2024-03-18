import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/utils/guard/jwt.guard';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign.dto';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '회원가입' })
  @Post('sign-up')
  async register(@Body() signUpdto: SignUpDto) {
    const user = await this.usersService.signUp(
      signUpdto.email,
      signUpdto.password,
      signUpdto.name,
      signUpdto.Introduce,
      signUpdto.passwordConfirm,
    );
    return user;
  }

  @ApiOperation({ summary: '운영자 회원가입' })
  @Post('admin/sign-up')
  async adminSignUp(@Body() signUpdto: SignUpDto) {
    const user = await this.usersService.adminSignUp(signUpdto.email, signUpdto.password, signUpdto.name);
    return user;
  }

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  @Render('sign-in')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const user = await this.usersService.login(loginDto.email, loginDto.password);

    res.cookie('authorization', `Bearer ${user.accessToken}`);
    res.cookie('refreshToken', user.refreshToken);
    res.send('로그인에 성공하였습니다.');
  }

  @ApiOperation({ summary: '유저 정보' })
  @UseGuards(JwtAuthGuard)
  @Get('')
  @Render('users')
  getUser(@UserInfo() user: User) {
    return { 이름: user.name, 자기소개: user.Introduce };
  }

  @ApiOperation({ summary: '로그아웃', description: '로그아웃' })
  @Post('logout')
  logOut(@Res() res) {
    //   req.logOut();
    res.clearCookie('authorization');
    res.clearCookie('refreshToken');
    res.send('로그아웃에 성공하였습니다.');
  }
}
