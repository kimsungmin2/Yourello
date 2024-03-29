import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Put,
  NotAcceptableException,
  HttpCode,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WorkerDto } from './dto/worker.dto';
import { ColumnDto } from './dto/column.dto';
import { OrderDto } from './dto/updateOrder.dto';
import { CardListService } from './card-list.service';
import { CheckListDto } from './dto/checkList.dto';
import { WorkerGuard } from 'src/utils/guard/worker.guard';

@ApiTags('Card')
@Controller('cards')
@UseGuards(AuthGuard('jwt'))
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly cardListService: CardListService,
  ) {}

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
    console.log(card);
    return card;
  }

  @ApiOperation({ summary: '작업자 변경' })
  @UseGuards(WorkerGuard)
  @Patch('worker/:cardId')
  async updateWorkerCard(@Param('cardId') cardId: number, @Body() workerDto: WorkerDto, @Req() req) {
    const user = req.user;
    const card = await this.cardsService.updateWorkerCard(cardId, user.id, workerDto.workerId);
    return card;
  }
  @ApiOperation({ summary: '카드 순서 변경' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('change/:cardId/')
  async changeCardOrder(@Param('cardId') cardId: number, @Body() orderDto: OrderDto, @Req() req) {
    const user = req.user;
    const order = await this.cardsService.changeCardOrder(cardId, orderDto.newOrderNum, user.id);
    return order;
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '카드 변경' })
  @UseGuards(WorkerGuard)
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
  @UseGuards(WorkerGuard)
  @Patch('column/:cardId')
  async updatedColumn(@Param('cardId') cardId: number, @Body() columnDto: ColumnDto, @Req() req) {
    const user = req.user;
    const card = await this.cardsService.updatedColumn(cardId, user.id, columnDto.columnId);
    return card;
  }

  @ApiOperation({ summary: '카드 삭제' })
  @HttpCode(204)
  @UseGuards(WorkerGuard)
  @Delete(':cardId')
  async deleteCard(@Param('cardId') cardId: number, @Req() req) {
    const user = req.user;
    await this.cardsService.deleteCard(cardId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '카드 체크 리스트 조회' })
  @Get(':cardId/checkList')
  async getCheckList(@Param('cardId') cardId: number) {
    return await this.cardListService.getCheckList(cardId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '카드 체크 리스트 생성' })
  @Post(':cardId/checkList')
  async createCheckList(@Param('cardId') cardId: number, @Body() checkListDto: CheckListDto) {
    const checkLists = await this.cardListService.checkList(cardId, checkListDto.content);
    return checkLists;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '카드 체크 리스트 체킹' })
  @Patch(':cardId/checkList/:carListId')
  async checkList(@Param('cardId') cardId: number, @Param('carListId') carListId: number) {
    const card = await this.cardsService.getCardById(cardId);
    if (!card) {
      throw new NotAcceptableException('카드가 존재하지 않습니다.');
    }
    return await this.cardListService.checkListUpdate(carListId);
  }

  @ApiOperation({ summary: '카드 리스트 삭제' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  @Delete(':cardId/checkList/:cardListId')
  async deleteCardList(@Param('cardId') cardId: number, @Param('cardListId') cardListId: number, @Req() req) {
    const user = req.user;
    return await this.cardListService.deleteCheckList(cardId, cardListId);
  }
}
