import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Role } from './types/userRole.type';
import * as _ from 'lodash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string, name: string, introduce: string, passwordConfirm: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new ConflictException('이미 해당 이메일로 가입된 사용자가 있습니다!');
    }
    if (password !== passwordConfirm) {
      throw new UnauthorizedException('비밀번호가 체크비밀번호와 일치하지 않습니다.');
    }

    const hashedPassword = await hash(password, 10);
    await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      introduce,
    });
  }

  async adminSignUp(email: string, password: string, name: string, passwordConfirm: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 해당 이메일로 가입된 사용자가 있습니다!');
    }
    if (password !== passwordConfirm) {
      throw new UnauthorizedException('비밀번호가 체크비밀번호와 일치하지 않습니다.');
    }

    const hashedPassword = await hash(password, 10);
    await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      role: Role.Admin,
    });
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });
    if (_.isNil(user)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const payload = { email, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '12h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async userUpdate(id: number, password: string, name: string, introduce: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.userRepository.update(id, { name, introduce });
  }

  async userDelete(id: number, password: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.userRepository.delete(id);
  }
}
