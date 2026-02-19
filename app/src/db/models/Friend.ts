import { Model } from "@nozbe/watermelondb";
import { text, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Friend extends Model {
  static table = "friends";

  @text("requester_id") requesterId!: string;
  @text("addressee_id") addresseeId!: string;
  @text("status") status!: string;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
}
