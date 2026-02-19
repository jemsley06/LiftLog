import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Profile extends Model {
  static table = "profiles";

  @text("username") username!: string;
  @text("avatar_url") avatarUrl!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
}
