import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceRoomsEntity } from '@app/database';
import { VoiceRoomsService } from './voice-rooms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceRoomsEntity]),
  ],
  providers: [VoiceRoomsService],
  exports: [VoiceRoomsService],
})
export class VoiceRoomsModule {}
