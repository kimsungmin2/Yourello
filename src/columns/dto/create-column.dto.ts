import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @ApiProperty({
    example: '보보보',
    description: '이름',
  })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: '보드ID',
  })
  @IsNotEmpty({ message: '보드ID를 입력해주세요.' })
  boardId: number;
}
