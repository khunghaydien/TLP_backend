import { IsUUID } from 'class-validator';

export class VoiceTokenDto {
  @IsUUID()
  roomId: string;
}
