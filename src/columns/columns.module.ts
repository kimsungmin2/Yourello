import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { Columns } from './entities/column.entity';
import { Board } from 'src/boards/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Columns, Board])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
