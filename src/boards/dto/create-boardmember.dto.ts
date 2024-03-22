import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty } from "class-validator";

export class CreateBoardMemberDto {
  @IsInt()
  @ApiProperty({
    example: '보드아이디 지정',
    description: '보드아이디',
  })
  @IsNotEmpty({ message: '보드아이디를 입력하세요' })
  boardId: number;

  @IsBoolean()
  @ApiProperty({
    example: '보드소유자 지정',
    description: '보드소유자 여부',
  })
  //@IsNotEmpty({ message: '보드소유자 여부를 입력하세요'})
  owner: boolean;

  @IsInt()
  @ApiProperty({
    example: '보드멤버 생성',
    description: '보드멤버명',
  })

  @IsNotEmpty({ message: '멤버 아이디를 입력하세요.'})
  userId: number;

  @IsBoolean()
  @ApiProperty({
    example: '보드 소속 여부',
    description: '보드 소속 여부',
  })
  //@IsNotEmpty({ message: '보드소속 여부를 입력하세요'})
  memberStatus: boolean;


  

  
}
