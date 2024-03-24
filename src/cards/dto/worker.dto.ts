import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class WorkerDto {
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: '작업자',
  })
  @IsNotEmpty({ message: '작업자를 입력해주세요.' })
  workerId: number;
}
