import { Module } from '@nestjs/common';
import { VoiceRoomsModule as VoiceRoomsLibModule } from '@app/voice-rooms';
import { VoiceRoomsController } from './voice-rooms.controller';

@Module({
  imports: [VoiceRoomsLibModule],
  controllers: [VoiceRoomsController],
})
export class VoiceRoomsModule { }
