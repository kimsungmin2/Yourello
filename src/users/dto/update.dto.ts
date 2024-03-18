import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  @ApiProperty({
    example: '123456',
    description: '비밀번호',
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '김성민',
    description: '수정할 이름',
  })
  @IsNotEmpty({ message: '수정할 이름을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '인디 좋아하는 김성민입니다. 뷰민라 화이팅',
    description: '수정할 자기소개',
  })
  @IsNotEmpty({ message: '수정할 소개를 입력해주세요.' })
  introduce: string;
}
