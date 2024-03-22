import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @ApiProperty({
    example: '보드 생성',
    description: '보드명',
  })
  @IsNotEmpty({ message: '보드명을 입력하세요.'})
  title: string;

  @IsString()
  @ApiProperty({
    example: '배경색상 지정',
    description: '배경색상',
  })
  @IsNotEmpty({ message: '배경색상을 입력하세요'})
  backgroundcolor: string;

  @IsString()
  @ApiProperty({
    example: '보드 설명입력',
    description: '보드설명',
  })
  @IsNotEmpty({ message: '보드에 대한 설명을 입력하세요' })
  explanation: string;
}
