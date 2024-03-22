import { IsNotEmpty, IsEmail } from 'class-validator';

export class InviteDto {
  @IsEmail()
  @IsNotEmpty({ message: '초대할 이메일을 입력해주세요.' })
  email: string;
}
