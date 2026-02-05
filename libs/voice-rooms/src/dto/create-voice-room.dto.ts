import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateVoiceRoomDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  language?: string;
}
