import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { VoiceRoomsEntity } from '@app/database';
import { addCursorPagination, addTrgmSearch, parseCursorResult } from '@app/common';
import { CreateVoiceRoomDto } from './dto/create-voice-room.dto';
import { CreateVoiceRoomResultDto } from './dto/create-voice-room-result.dto';
import { VoiceTokenResultDto } from './dto/voice-token-result.dto';
import { ListVoiceRoomsOptionsDto } from './dto/list-voice-rooms-options.dto';
import { ListVoiceRoomsResultDto } from './dto/list-voice-rooms-result.dto';

const DEFAULT_MAX_PARTICIPANTS = 10;
const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;
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
  ) { }

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
  ): Promise<CreateVoiceRoomResultDto> {
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
  async getToken(roomId: string, userId: string): Promise<VoiceTokenResultDto> {
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

  /**
   * Lấy danh sách room: filter language, search trgm theo name, cursor pagination (index updated_at, id).
   * Cần bật extension: CREATE EXTENSION IF NOT EXISTS pg_trgm;
   */
  async findAll(
    options: ListVoiceRoomsOptionsDto = {},
  ): Promise<ListVoiceRoomsResultDto> {
    const limit = Math.min(
      Number(options.limit) || DEFAULT_PAGE_LIMIT,
      MAX_PAGE_LIMIT,
    );

    const qb = this.voiceRoomsRepo.createQueryBuilder('r');
    addTrgmSearch(qb, 'r', 'name', options.search);
    if (options.language?.trim()) {
      qb.andWhere('r.language = :language', {
        language: options.language.trim(),
      });
    }
    addCursorPagination(qb, {
      alias: 'r',
      tableName: 'voice_rooms',
      cursor: options.cursor,
      limit,
    });

    const items = await qb.getMany();
    return parseCursorResult(items, limit);
  }

  /**
   * Xóa room: xóa trên LiveKit (đóng room thật) và xóa bản ghi trong DB.
   * Gọi khi user bấm thoát / end room để dọn room trên LiveKit và không còn hiện trong list.
   */
  async deleteRoom(roomId: string): Promise<void> {
    const room = await this.voiceRoomsRepo.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const roomService = this.getRoomService();
    const liveKitRoomName = roomId;
    try {
      await roomService.deleteRoom(liveKitRoomName);
    } catch {
      // Room chưa tồn tại trên LiveKit (chưa ai từng join) → bỏ qua
    }

    await this.voiceRoomsRepo.remove(room);
  }
}
