import { IsNotEmpty, IsString } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드명을 입력하세요.'})
  title: string;

  @IsString()
  @IsNotEmpty({ message: '배경색상을 입력하세요'})
  backgroundcolor: string;

  @IsString()
  @IsNotEmpty({ message: '보드에 대한 설명을 입력하세요' })
  explanation: string;
}
