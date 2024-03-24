import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @ApiProperty({
    example: '바바바',
    description: '댓글 내용',
  })
  @IsNotEmpty({ message: '댓글 내용을 작성해주세요 :D' })
  @MinLength(1)
  content: string;
}
