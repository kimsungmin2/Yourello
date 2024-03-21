import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty({ message: '댓글 내용을 작성해주세요 :D' })
  @MinLength(1)
  content: string;
}
