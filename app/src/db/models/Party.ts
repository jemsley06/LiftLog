import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly, children } from "@nozbe/watermelondb/decorators";
import type { Query } from "@nozbe/watermelondb";

export default class Party extends Model {
  static table = "parties";

  static associations = {
    party_members: { type: "has_many" as const, foreignKey: "party_id" },
  };

  @text("name") name!: string;
  @text("created_by") createdBy!: string;
  @date("started_at") startedAt!: Date;
  @date("ended_at") endedAt!: Date | null;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @children("party_members") members!: Query<any>;
}
