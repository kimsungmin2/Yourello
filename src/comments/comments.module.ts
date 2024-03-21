import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentsController],
  providers: [CommentsService] /**providers에 서비스 로직이 추가되이었어서
  덕분에 controller에서 생성자주입이 가능함 (shortcut).
  short */,
})
export class CommentsModule {}
