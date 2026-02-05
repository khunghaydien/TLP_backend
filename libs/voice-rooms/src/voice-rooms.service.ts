import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { VoiceRoomsEntity } from '@app/database';
import { CreateVoiceRoomDto } from './dto/create-voice-room.dto';

export interface CreateVoiceRoomResult {
  roomId: string;
}

export interface VoiceTokenResult {
  token: string;
}

const DEFAULT_MAX_PARTICIPANTS = 10;
@Injectable()
export class VoiceRoomsService {
  private readonly livekitHost = process.env.LIVEKIT_URL || '';
  private readonly apiKey = process.env.LIVEKIT_API_KEY || '';
  private readonly apiSecret = process.env.LIVEKIT_API_SECRET || '';
  private readonly maxParticipants =
    parseInt(process.env.LIVEKIT_MAX_PARTICIPANTS || '', 10) ||
    DEFAULT_MAX_PARTICIPANTS;
  private roomService: RoomServiceClient | null = null;

  constructor(
    @InjectRepository(VoiceRoomsEntity)
    private readonly voiceRoomsRepo: Repository<VoiceRoomsEntity>,
  ) {}

  private getRoomService(): RoomServiceClient {
    if (!this.roomService) {
      this.roomService = new RoomServiceClient(
        this.livekitHost,
        this.apiKey,
        this.apiSecret,
      );
    }
    return this.roomService;
  }

    /**
     * User tạo room mới: chỉ insert voice_rooms, trả về room_id.
     * LiveKit room chưa tồn tại cho đến khi có user join.
     */
  async createRoom(
    input: CreateVoiceRoomDto,
    ownerId: string,
  ): Promise<CreateVoiceRoomResult> {
    const room = this.voiceRoomsRepo.create({
      name: input.name,
      description: input.description,
      language: input.language ?? 'en',
      owner_id: ownerId,
    });
    const saved = await this.voiceRoomsRepo.save(room);
    return { roomId: saved.id };
  }

  /**
   * Generate LiveKit token để user join room.
   * - Kiểm tra room tồn tại trong DB
   * - Kiểm tra room chưa full (qua LiveKit listParticipants)
   * - Tạo token và trả về.
   * Nếu room chưa có ai → LiveKit room được tạo lúc participant đầu tiên join.
   */
  async getToken(roomId: string, userId: string): Promise<VoiceTokenResult> {
    const room = await this.voiceRoomsRepo.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const roomService = this.getRoomService();
    const liveKitRoomName = roomId;

    try {
      const participants = await roomService.listParticipants(liveKitRoomName);
      if (participants.length >= this.maxParticipants) {
        throw new BadRequestException('Room is full');
      }
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      // Room chưa tồn tại trên LiveKit (chưa ai join) → listParticipants có thể throw
      // Coi như chưa full, cho phép join
    }

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: userId,
      name: userId,
    });
    at.addGrant({
      roomJoin: true,
      room: liveKitRoomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    return { token };
  }

  async findOne(roomId: string): Promise<VoiceRoomsEntity> {
    const room = await this.voiceRoomsRepo.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
}
