import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { VoiceRoomsService, CreateVoiceRoomDto } from '@app/voice-rooms';
import { JwtAuthGuard, RequestUser } from '@app/common';

@Controller('voice-rooms')
@UseGuards(JwtAuthGuard)
export class VoiceRoomsController {
  constructor(private readonly voiceRoomsService: VoiceRoomsService) {}

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
}
