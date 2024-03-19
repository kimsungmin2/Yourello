import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class OrderDto {
  @IsNumber()
  @ApiProperty({
    example: 10,
    description: '카드 위치 조정',
  })
  @IsNotEmpty({ message: '조정할 위치를 입력해주세요.' })
  newOrderNum: number;
}
