import { VoiceRoomsEntity } from '@app/database';

/** Kết quả list có cursor (dùng chung). */
export interface CursorPageResultDto<T> {
  items: T[];
  nextCursor: string | null;
}

export type ListVoiceRoomsResultDto = CursorPageResultDto<VoiceRoomsEntity>;
