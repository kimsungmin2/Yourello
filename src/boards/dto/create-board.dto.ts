import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @ApiProperty({
    example: '테스트보드',
    description: '보드 이름',
  })
  @IsNotEmpty({ message: '보드 이름을 입력해주세요.' })
  title: string;

  @IsString()
  @ApiProperty({
    example: 'white',
    description: '보드 색상',
  })
  @IsNotEmpty({ message: '보드 배경 색상을 입력해주세요.' })
  backgroundcolor: string;

  @IsString()
  @ApiProperty({
    example: '테스트보드입니다.',
    description: '보드 설명',
  })
  @IsNotEmpty({ message: '보드 설명을 입력해주세요.' })
  explanation: string;
}
