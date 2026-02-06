/** Query options: search (trgm), filter, cursor pagination. */
export interface ListVoiceRoomsOptionsDto {
  /** Search gần đúng theo tên (pg_trgm). */
  search?: string;
  /** Lọc theo language. */
  language?: string;
  /** Cursor: id của item cuối trang trước (index updated_at, id). */
  cursor?: string;
  /** Số item mỗi trang (mặc định 20). */
  limit?: number;
}
