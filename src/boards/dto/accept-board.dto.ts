import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsArray, ArrayMinSize, IsString } from "class-validator";

export class AcceptBoardMemberDto {
  @IsString()
  @ApiProperty({
    example: '이메일 보드 초대',
    description: '초대할 보드멤버의 이메일'
  })
  @IsNotEmpty({ message: '초대할 보드멤버의 이메일을 입력하세요.'})
  email: string;

  @IsString()
  @ApiProperty({
    example: '이메일 인증 코드 입력',
    description: '이메일 인증 코드'
  })
  @IsNotEmpty({ message: '인증코드를 입력하세요.'})
  token: string;
  
}
