import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @ApiProperty({
    example: '공부하기',
    description: '카드 이름',
  })
  @IsNotEmpty({ message: '카드 이름을 입력해주세요.' })
  title: string;

  @IsString()
  @ApiProperty({
    example: '오늘부터 내일까지 안쉬고 공부하기',
    description: '카드 정보',
  })
  @IsNotEmpty({ message: '카드 정보를 입력해주세요.' })
  info: string;

  @IsString()
  @ApiProperty({
    example: 'red',
    description: '카드 색상',
  })
  @IsNotEmpty({ message: '카드 색상을 입력해주세요.' })
  color: string;

  @IsDateString()
  @ApiProperty({
    example: '2024-03-20T20:00:00',
    description: '카드 만료일',
  })
  @IsNotEmpty({ message: '카드 만료일을 입력해주세요.' })
  deadLine: Date;

  @IsString()
  @ApiProperty({ type: 'file' })
  @IsOptional()
  cardImage: string;
}
