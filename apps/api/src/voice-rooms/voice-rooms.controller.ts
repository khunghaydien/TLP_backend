import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateVoiceRoomDto,
  ListVoiceRoomsOptionsDto,
  VoiceRoomsService,
  VoiceTokenDto,
} from '@app/voice-rooms';
import { JwtAuthGuard, RequestUser } from '@app/common';

@Controller('voice-rooms')
@UseGuards(JwtAuthGuard)
export class VoiceRoomsController {
  constructor(private readonly voiceRoomsService: VoiceRoomsService) {}

  /**
   * Danh sách room: filter language, search theo name (trgm), cursor pagination.
   * Query: search, language, cursor, limit (default 20, max 100).
   */
  @Get()
  async list(@Query() query: ListVoiceRoomsOptionsDto) {
    return this.voiceRoomsService.findAll({
      search: query.search,
      language: query.language,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  /**
   * Tạo room mới: insert voice_rooms, trả về room_id.
   * Frontend redirect → join room (gọi POST /api/voice/token với roomId).
   */
  @Post()
  async create(
    @Body() dto: CreateVoiceRoomDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    const { roomId } = await this.voiceRoomsService.createRoom(
      {
        name: dto.name,
        description: dto.description,
        language: dto.language,
      },
      req.user.id,
    );
    return { roomId };
  }

  /**
  * Lấy LiveKit token để join room.
  * Backend: check room tồn tại, chưa full, generate token.
  * Frontend dùng token connect LiveKit.
  */
  @Post('token')
  async getToken(
    @Body() dto: VoiceTokenDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    const { token } = await this.voiceRoomsService.getToken(
      dto.roomId,
      req.user.id,
    );
    return { token };
  }
}
