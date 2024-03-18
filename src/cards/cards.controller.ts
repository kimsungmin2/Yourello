import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile, UseGuards, Put } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WorkerDto } from './dto/worker.dto';
import { ColumnDto } from './dto/column.dto';
import { OrderDto } from './dto/updateOrder.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @ApiOperation({ summary: '마감임박 카드 리스트' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':columnId/deadlist')
  async getDeadLineCardList(@Param('columnId') columnId: number) {
    return await this.cardsService.getDeadLineCardList(columnId);
  }

  @ApiOperation({ summary: '카드 리스트' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':columnId')
  async getCardList(@Param('columnId') columnId: number, @Req() req) {
    const user = req.user;
    return await this.cardsService.getCardList(columnId);
  }

  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '카드 생성' })
  @UseInterceptors(FileInterceptor('cardImage'))
  @Post(':columnId')
  async createCard(
    @Param('columnId') columnId: number,
    @Body() createCardDto: CreateCardDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user;

    const card = await this.cardsService.createCard(
      user.id,
      columnId,
      createCardDto.title,
      createCardDto.info,
      createCardDto.color,
      createCardDto.deadLine,
      file,
    );
    return card;
  }

  @ApiOperation({ summary: '작업자 변경' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('worker/:cardId')
  async updateWorkerCard(@Param('cardId') cardId: number, @Body() workerDto: WorkerDto, @Req() req) {
    const user = req.user;
    const card = await this.cardsService.updateWorkerCard(cardId, user.id, workerDto.worker);
    return card;
  }
  @ApiOperation({ summary: '카드 컬럼 변경' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('change/:cardId/')
  async changeCardOrder(@Param('cardId') cardId: number, @Body() orderDto: OrderDto, @Req() req) {
    const user = req.user;
    const order = await this.cardsService.changeCardOrder(cardId, orderDto.orderNum, user.id);
    return order;
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '카드 변경' })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('cardImage'))
  @Put(':cardId')
  async updateCard(
    @Param('cardId') cardId: number,
    @Body() updateCardDto: UpdateCardDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user;
    const card = await this.cardsService.updateCard(cardId, user.id, updateCardDto, file);
    return card;
  }

  @ApiOperation({ summary: '카드 컬럼 변경' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('column/:cardId')
  async updatedColumn(@Param('cardId') cardId: number, @Body() columnDto: ColumnDto, @Req() req) {
    const user = req.user;
    const card = await this.cardsService.updatedColumn(cardId, user.id, columnDto.columnId);
    return card;
  }

  @ApiOperation({ summary: '카드 삭제' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':cardId')
  async deleteCard(@Param('cardId') cardId: number, @Req() req) {
    const user = req.user;
    await this.cardsService.deleteCard(cardId, user.id);
  }
}
