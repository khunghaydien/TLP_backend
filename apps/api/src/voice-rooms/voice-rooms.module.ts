import { Module } from '@nestjs/common';
import { VoiceRoomsModule as VoiceRoomsLibModule } from '@app/voice-rooms';
import { VoiceRoomsController } from './voice-rooms.controller';
import { VoiceController } from './voice.controller';

@Module({
  imports: [VoiceRoomsLibModule],
  controllers: [VoiceRoomsController, VoiceController],
})
export class VoiceRoomsModule {}
