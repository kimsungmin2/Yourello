import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';

describe('BoardsController', () => {
  let boardscontroller: BoardsController;
  let boardsServiceMock: Partial<BoardsService>;
  let usersServiceMock: Partial<UsersService>;
  let emailServiceMock: Partial<EmailService>;

  beforeEach(async () => {
    boardsServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      getBoardMember: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      invite: jest.fn(),
      inviteAccept: jest.fn(),
    };

    usersServiceMock = {
      findByEmail: jest.fn(),
    };

    emailServiceMock = {
      sendVerificationToEmail: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        BoardsController,
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    boardscontroller = moduleRef.get<BoardsController>(BoardsController);
  });
});
