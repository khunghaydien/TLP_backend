import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { VoiceRoomsService, VoiceTokenDto } from '@app/voice-rooms';
import { JwtAuthGuard, RequestUser } from '@app/common';

@Controller('voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private readonly voiceRoomsService: VoiceRoomsService) { }

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
