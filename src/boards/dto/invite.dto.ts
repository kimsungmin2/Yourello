import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class InviteDto {
  @IsEmail()
  @ApiProperty({
    example: '이메일 테스트.',
    description: '초대할 이메일을 입력해주세요.',
  })
  @IsNotEmpty({ message: '초대할 이메일을 입력해주세요.' })
  email: string;
}
