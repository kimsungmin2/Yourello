import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드 이름을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '보드 배경 색상을 입력해주세요.' })
  backgroundcolor: string;

  @IsString()
  @IsNotEmpty({ message: '보드 설명을 입력해주세요.' })
  explanation: string;
}
