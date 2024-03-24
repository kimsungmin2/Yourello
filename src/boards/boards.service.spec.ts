import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { User } from 'src/users/entities/user.entity';
import { BoardMember } from './entities/boardmember.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('BoardsService', () => {
  let service: BoardsService;
  let boardsRepositoryMock: Partial<Record<keyof Repository<Board>, jest.Mock>>;
  let boardMemberRepositoryMock: Partial<Record<keyof Repository<BoardMember>, jest.Mock>>;
  let userRepositoryMock: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    boardsRepositoryMock = {
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOneBy: jest.fn(),
    };
    boardMemberRepositoryMock = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    userRepositoryMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: boardsRepositoryMock,
        },
        {
          provide: getRepositoryToken(BoardMember),
          useValue: boardMemberRepositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('보드 생성', async () => {
    const userId = 1;
    const createBoardDto = {
      title: '테스트 보드',
      backgroundcolor: 'white',
      explanation: '보드 설명',
    };
    const board = {
      id: 1,
      title: '테스트 보드',
      backgroundcolor: 'white',
      explanation: '보드 설명',
    };

    boardsRepositoryMock.save.mockResolvedValueOnce(board);
    await service.create(userId, createBoardDto);
    expect(boardsRepositoryMock.save).toHaveBeenCalledWith(createBoardDto);
    expect(boardMemberRepositoryMock.save).toHaveBeenCalledWith({
      boardId: board.id,
      userId,
      owner: true,
    });
  });

  it('보드 전체 조회', async () => {
    const userId = 1;
    const boards = [
      { id: 1, title: '테스트 보드1', explanation: '테스트보드1 설명' },
      { id: 2, title: '테스트 보드2', explanation: '테스트보드2 설명' },
    ];
    boardMemberRepositoryMock.find.mockResolvedValueOnce(boards.map((board) => ({ boardId: board.id })));
    boardsRepositoryMock.find.mockResolvedValueOnce(boards);
    const result = await service.findAll(userId);

    expect(boardMemberRepositoryMock.find).toHaveBeenCalledWith({ where: { userId } });
    expect(boardsRepositoryMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: [1, 2],
          }),
        },
        select: ['id', 'title', 'explanation'],
      }),
    );
    expect(result).toEqual(boards);
  });

  it('보드 상세 조회', async () => {
    const boardId = 1;
    const board = {
      id: 1,
      title: '테스트 보드',
      backgroundcolor: 'white',
      explanation: '보드 설명',
    };

    boardsRepositoryMock.findOneBy.mockResolvedValueOnce(board);

    const result = await service.findOne(boardId);

    expect(boardsRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: boardId });
    expect(result).toEqual(board);
  });

  it('보드 수정', async () => {
    const boardId = 1;
    const userId = 1;
    const updateBoardDto = {
      title: '새로운 제목',
      backgroundcolor: 'new color',
      explanation: '새로운 설명',
    };
    const ownerUser = { owner: true };
    const board = { id: boardId };

    boardsRepositoryMock.findOneBy.mockResolvedValueOnce({ id: boardId });
    boardMemberRepositoryMock.findOne.mockResolvedValueOnce(ownerUser);

    const result = await service.update(boardId, updateBoardDto, userId);

    expect(boardsRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: boardId });
    expect(boardMemberRepositoryMock.findOne).toHaveBeenCalledWith({ userId, boardId });
    expect(boardsRepositoryMock.update).toHaveBeenCalledWith({ id: boardId }, updateBoardDto);
    expect(result).toEqual(updateBoardDto);
  });

  it('보드 수정 불가', async () => {
    const boardId = 1;
    const userId = 1;
    const updateBoardDto = {
      title: '새로운 제목',
      backgroundcolor: 'new color',
      explanation: '새로운 설명',
    };
    const nonOwnerUser = { owner: false };

    boardsRepositoryMock.findOneBy.mockResolvedValueOnce({ id: boardId });
    boardMemberRepositoryMock.findOne.mockResolvedValueOnce(nonOwnerUser);

    await expect(service.update(boardId, updateBoardDto, userId)).rejects.toThrow(UnauthorizedException);

    expect(boardsRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: boardId });
    expect(boardMemberRepositoryMock.findOne).toHaveBeenCalledWith({ boardId, userId });
    expect(boardsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('보드 삭제', async () => {
    const boardId = 1;
    const userId = 1;
    const ownerUser = { owner: true };

    boardsRepositoryMock.findOneBy.mockResolvedValueOnce({ id: boardId });
    boardMemberRepositoryMock.findOne.mockResolvedValueOnce(ownerUser);

    await service.remove(boardId, userId);

    expect(boardsRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: boardId });

    expect(boardsRepositoryMock.delete).toHaveBeenCalledWith(boardId);
  });

  it('보드 삭제 불가', async () => {
    const boardId = 1;
    const userId = 1;
    const nonOwnerUser = { owner: false };

    boardsRepositoryMock.findOneBy.mockResolvedValueOnce({ id: boardId });

    boardMemberRepositoryMock.findOne.mockResolvedValueOnce(nonOwnerUser);

    await expect(service.remove(boardId, userId)).rejects.toThrow(UnauthorizedException);

    expect(boardsRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: boardId });

    expect(boardsRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it('보드 초대', async () => {
    const boardId = 1;
    const userId = 1;
    const email = 'aaa@naver.com';
    const ownerUser = { owner: true };
    const nonExistingMember = null;

    boardMemberRepositoryMock.findOne.mockResolvedValueOnce(ownerUser);
    userRepositoryMock.findOne.mockResolvedValueOnce(nonExistingMember);

    await expect(service.invite(userId, boardId, email)).rejects.toThrow();
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(boardMemberRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId, boardId } });
  });

  it('보드 초대 불가(이미 존재하는 멤버)', async () => {
    const boardId = 1;
    const userId = 1;
    const email = 'existing@user.com';
    const ownerUser = { owner: true };
    const existingUser = { id: 2 };

    boardMemberRepositoryMock.findOne.mockResolvedValueOnce(ownerUser);
    userRepositoryMock.findOne.mockResolvedValueOnce(existingUser);
    boardMemberRepositoryMock.findOne.mockResolvedValueOnce({ userId: existingUser.id, boardId });

    await expect(service.invite(userId, boardId, email)).rejects.toThrow(BadRequestException);

    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(boardMemberRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId: existingUser.id, boardId } });
  });

  it('초대 수락', async () => {
    const boardId = 1;
    const email = 'test@example.com';
    const userId = 1;

    const user = { id: userId };

    userRepositoryMock.findOne.mockResolvedValueOnce(user);
    boardMemberRepositoryMock.save.mockResolvedValueOnce({ boardId, userId });

    await service.inviteAccept(boardId, email);

    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(boardMemberRepositoryMock.save).toHaveBeenCalledWith({ boardId, userId });
  });
});
