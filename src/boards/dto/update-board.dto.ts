import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBoardDto {
  @ApiProperty({
    example: '테스트보드',
    description: '보드 이름',
  })
  title?: string;

  @ApiProperty({
    example: 'white',
    description: '보드 색상',
  })
  backgroundcolor?: string;

  @ApiProperty({
    example: '테스트보드입니다.',
    description: '보드 설명',
  })
  explanation?: string;
}
