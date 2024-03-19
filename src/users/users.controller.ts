import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Res, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/utils/guard/jwt.guard';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('User')
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
      signUpdto.introduce,
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
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const user = await this.usersService.login(loginDto.email, loginDto.password);

    res.cookie('authorization', `Bearer ${user.accessToken}`);
    res.cookie('refreshToken', user.refreshToken);
    res.send('로그인에 성공하였습니다.');
  }

  @ApiOperation({ summary: '유저 정보' })
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  getUser(@UserInfo() user: User) {
    return { 이름: user.name, 자기소개: user.introduce };
  }

  @ApiOperation({ summary: '로그아웃', description: '로그아웃' })
  @Post('logout')
  logOut(@Res() res) {
    //   req.logOut();
    res.clearCookie('authorization');
    res.clearCookie('refreshToken');
    res.send('로그아웃에 성공하였습니다.');
  }
  @ApiOperation({ summary: '유저 정보 업데이트', description: '업데이트' })
  @Patch('')
  async userUpdate(@Body() updateDto: UpdateDto, @Req() req) {
    const { id } = req.user;

    const userUpdate = await this.usersService.userUpdate(id, updateDto.password, updateDto.name, updateDto.introduce);
    return userUpdate;
  }
  @ApiOperation({ summary: '유저 삭제', description: '삭제' })
  @Delete('')
  async userDelete(@Body() deleteDto: DeleteDto, @Req() req) {
    const { id } = req.user;
    if (deleteDto.password !== deleteDto.confirmPassword) {
      throw new ForbiddenException('입력한 비밀번호와 확인 비밀번호가 같지 않습니다.');
    }
    return await this.usersService.userDelete(id, deleteDto.password);
  }
}
