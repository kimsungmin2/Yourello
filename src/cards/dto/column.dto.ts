import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ColumnDto {
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: '컬럼ID',
  })
  @IsNotEmpty({ message: '변경할 컬럼ID를 입력해주세요.' })
  columnId: number;
}
