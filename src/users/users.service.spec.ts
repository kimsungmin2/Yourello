import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from './types/userRole.type';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest
    .fn()
    .mockImplementation((inputPassword, hashedPassword) =>
      inputPassword === 'correctPassword' ? Promise.resolve(true) : Promise.resolve(false),
    ),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };
  const user = {
    id: 1,
    email: 'test@gmail.com',
    password: 'hashedPassword',
    name: 'test',
    introduce: 'test',
    passwordConfirm: 'hashedPassword',
  };

  const update = {
    id: 2,
    email: 'test@gmail.com',
    password: 'hashedPassword',
    name: 'test1',
    introduce: 'test1',
    passwordConfirm: 'hashedPassword',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });
  describe('회원가입 테스트', () => {
    it('성공적인 회원가입', async () => {
      expect(service.findByEmail(null));
      mockUserRepository.save.mockResolvedValue(user);

      await expect(service.signUp(user.email, user.password, user.name, user.introduce, user.passwordConfirm)).resolves.not.toThrow();

      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: user.email,
        password: 'hashedPassword',
        name: user.name,
        introduce: user.introduce,
      });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('이미 존재하는 이메일로 가입 시도할 경우 에러를 발생시킨다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: user.email });
      // await service.signUp(user.email, user.password, user.name, user.introduce, user.passwordConfirm);

      await expect(service.signUp(user.email, user.password, user.name, user.introduce, user.passwordConfirm)).rejects.toThrow(
        ConflictException,
      );
    });

    it('비밀번호와 확인 비밀번호가 일치하지 않을 경우 에러를 발생시킴', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.signUp(user.email, user.password, user.name, user.introduce, 'asdf')).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('운영자 회원가입 테스트', () => {
    const user = {
      id: 1,
      email: 'test@gmail.com',
      password: 'test',
      name: 'test',
      passwordConfirm: 'test',
    };

    it('성공적인 회원가입', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(user);

      await expect(service.adminSignUp(user.email, user.password, user.name, user.passwordConfirm)).resolves.not.toThrow();

      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: user.email,
        password: 'hashedPassword',
        name: user.name,
        role: Role.Admin,
      });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('이미 존재하는 이메일로 가입 시도할 경우 에러를 발생시킨다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: user.email });

      await expect(service.adminSignUp(user.email, user.password, user.name, user.passwordConfirm)).rejects.toThrow(ConflictException);
    });

    it('비밀번호와 확인 비밀번호가 일치하지 않을 경우 에러를 발생시킴', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.adminSignUp(user.email, user.password, user.name, 'asdf')).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('login', () => {
    it('성공적인 로그인', async () => {
      const password = 'correctPassword';
      mockUserRepository.findOne.mockResolvedValue(user.email);
      // bcrypt.compare(user.password, password);
      mockJwtService.sign.mockReturnValue('token');
      console.log(password);
      console.log(user.password);
      const result = await service.login(user.password, password);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('이메일이 존재하지 않으면 에러를 발생시킨다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login('wrong@example.com', user.password)).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 일치하지 않으면 에러를 발생시킨다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: user.email, password: 'hashedPassword' });

      await expect(service.login(user.email, '1234asd')).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('유저 업데이트', () => {
    it('업데이트 성공함', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user.id);
      mockUserRepository.update.mockResolvedValue(user);

      await expect(service.userUpdate(user.id, user.password, update.name, update.introduce)).resolves.not.toThrow();

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
        name: update.name,
        introduce: update.introduce,
      });
    });
    it('유저를 못찾음', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(user);
      await expect(service.userUpdate(user.id, user.password, update.name, update.introduce)).rejects.toThrow(NotFoundException);
    });
  });
  describe('유저 삭제', () => {
    it('삭제 성공함', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user.id);
      mockUserRepository.delete.mockResolvedValue(user);

      await expect(service.userDelete(user.id, user.password)).resolves.not.toThrow();

      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(user.id);
    });
    it('아이디가 없음', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.delete.mockResolvedValue(user);
      await expect(service.userDelete(user.id, user.password)).rejects.toThrow(NotFoundException);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
    });
  });
});
