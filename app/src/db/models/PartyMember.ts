import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly, relation } from "@nozbe/watermelondb/decorators";

export default class PartyMember extends Model {
  static table = "party_members";

  static associations = {
    parties: { type: "belongs_to" as const, key: "party_id" },
  };

  @text("party_id") partyId!: string;
  @text("user_id") userId!: string;
  @field("score") score!: number;
  @date("joined_at") joinedAt!: Date;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("parties", "party_id") party!: any;
}
