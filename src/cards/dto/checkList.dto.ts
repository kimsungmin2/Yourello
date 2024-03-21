import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckList {
  @IsNumber()
  @ApiProperty({
    example: '아오 아오 아오',
    description: '카드 체크리스트 내용',
  })
  @IsNotEmpty({ message: '카드 체크리스트 내용을 입력해주세요' })
  content: string;
}
