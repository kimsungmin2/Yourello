import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsArray, ArrayMinSize, IsString } from "class-validator";

export class InviteBoardMemberDto {
  // @IsInt()
  // @ApiProperty({
  //   example: '초대할 보드 지정',
  //   description: '초대할 보드아이디',
  // })
  // @IsNotEmpty({ message: '초대할 보드아이디를 입력하세요' })
  // boardId: number;

  @IsInt()
  @ApiProperty({
    example: '보드멤버 지정',
    description: '초대할 보드멤버',
  })
  @IsNotEmpty({ message: '초대할 보드멤버를 입력하세요.' })
  userId: number;

  // @IsString()
  // @ApiProperty({
  //   example: '이메일 보드 초대',
  //   description: '초대할 보드멤버의 이메일'
  // })
  // @IsNotEmpty({ message: '초대할 보드멤버의 이메일을 입력하세요.'})
  // email: string;
  
  // @IsArray()
  // @ApiProperty({
  //   example: '초대할 보드 지정',
  //   description: '초대할 보드아이디',
  // })
  // @IsInt({each: true})
  // @IsNotEmpty({ each: true, message: '초대할 보드아이디를 입력하세요' })
  // @ArrayMinSize(1)
  // userList: number[];
}
