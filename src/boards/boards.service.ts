import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateBoardMemberDto } from './dto/create-boardmember.dto';
import { InviteBoardMemberDto } from './dto/invite-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/boardmember.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private readonly boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    //private userService: UsersService,
    private emailService: EmailService
    
  ){}

  async create(id: number,createBoardDto: CreateBoardDto) {
    const { title, backgroundcolor, explanation } = createBoardDto;

    if(_.isNil(title) || _.isNil(backgroundcolor) || _.isNil(explanation)){
      throw new BadRequestException(
        '보드명, 배경색상, 보드에 대한 설명을 입력하세요.'
      );
    }
    const board = await this.boardRepository.save(createBoardDto);

    if(_.isNil(board)){
      throw new BadRequestException(
        '보드 생성 과정에 오류가 발생하였습니다.'
      );
    }
    const createBoardMemberDto: CreateBoardMemberDto = {
      userId : id,
      owner : true,
      boardId: board.id,
      memberStatus: true
    };

    const boardMember = await this.boardMemberRepository.save(createBoardMemberDto);
   
    if(_.isNil(boardMember)){
      throw new BadRequestException(
        '보드 멤버 생성 과정에 오류가 발생하였습니다.'
      );
    }

    return {message: `보드명 ${title}이 생성되었습니다.`};
  }

  async findAll(): Promise<Board[]> {
     const boards = await this.boardRepository.find({
      select: ['title','backgroundcolor','explanation' ]
    });

    if(_.isNil(boards)){
      throw new NotFoundException('존재하지 않는 보드입니다.');
    }

    return boards;
  }

  async findOne(id: number) {
    const board = await this.boardRepository.findOneBy({id});
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 보드입니다.');
    }
    return board;

  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    console.log('id',id);

    const board = await this.boardRepository.findOneBy({id});
    
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 보드입니다.');
    }

    await this.boardRepository.update({id},updateBoardDto);

    return {message: `보드번호 ${id}이 수정되었습니다.`};
  }

  async remove(id: number) {
    const board = await this.boardRepository.findOneBy({id});
    
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 보드입니다.');
    }
    
     await this.boardRepository.delete({id});

    return {message: `보드번호 ${id}이 삭제되었습니다.`};
  }

  async getBoardMemberById(id: number){
    console.log('service: getBoardMemberById id',id)
    const boardMember = await this.boardMemberRepository.find({
      where: {
        boardId: id
      }

    });


    console.log('service boardMember',boardMember)

    if(_.isNil(boardMember)){
      throw new NotFoundException('존재하지 않는 보드멤버입니다.');
    }

    //return boardMember;

      return [ {
       userId: 1,
       boardId:5,
       owner:true
     }]

  }

  async invite(id: number, inviteBoardMemberDto: InviteBoardMemberDto) {
    const { userId } = inviteBoardMemberDto;

    if(_.isNil(id) || _.isNil(userId)){
      throw new BadRequestException(
        ' 초대할 보드명, 보드 멤버를 입력하세요.'
      );
    }

    const board = await this.boardRepository.findOneBy({id});
    
    if(_.isNil(board)){
      throw new NotFoundException('존재하지 않는 보드입니다.');
    }
    
    const user = await this.userRepository.findOne({
      select: [  'id','email' ],
      where: {id: userId}
    });

    console.log('invite service usercheck: ', user);

      if(!user){
        throw new BadRequestException(
          '해당 사용자가 없습니다.'
        );
      }
      
      const token = await this.emailService.generateRandomToken(11111,99999);
      const emailResult = await this.emailService.sendVerivicationToEmail(user.email, token);

      console.log('emailResult', emailResult);

      if(!emailResult){
        throw new BadRequestException(
          '이메일 초대 인증에 실패하였습니다.'
        );
      }

      const memberSave = await this.boardMemberRepository.save({
        boardId: id,
        userId: userId,
        token: (token.code).toString(),
        memberStatus: false
      });

      console.log('memberSave', memberSave);

      if(!memberSave){
        throw new BadRequestException(
          '인증 코드 작업 과정에서 오류가 발생하였습니다.'
        );
      }

      return memberSave;

  }

  async accept(boardId: number, email: string, token: string) {

    const user = await this.userRepository.findOne({ where: { email } });

    console.log('accept service usercheck: ', user);

      if(!user){
        throw new BadRequestException(
          '해당 사용자가 없습니다.'
        );
      }
    
    const tokenInfo = await this.boardMemberRepository.findOne({
      select: [ 'userId','token','memberStatus'],
      where: {token}
    });
    
    if(!tokenInfo){
      throw new BadRequestException(
        '해당 토큰은 존재하지 않습니다.'
      );
    }
    const { userId, memberStatus } = tokenInfo;

    if(memberStatus){
      throw new BadRequestException(
        '해당 토큰에 대한 보드 멤버 초대가 완료되었습니다.'
      );
    }

    await this.boardMemberRepository.update({userId},{memberStatus:true});

    return {message: `보드멤버 ${userId}에 대한 초대가 완료되었습니다.`};

  }

}
