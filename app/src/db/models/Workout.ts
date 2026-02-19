import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly, children } from "@nozbe/watermelondb/decorators";
import type { Query } from "@nozbe/watermelondb";

export default class Workout extends Model {
  static table = "workouts";

  static associations = {
    sets: { type: "has_many" as const, foreignKey: "workout_id" },
  };

  @text("user_id") userId!: string;
  @text("name") name!: string | null;
  @date("started_at") startedAt!: Date;
  @date("completed_at") completedAt!: Date | null;
  @text("notes") notes!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @children("sets") sets!: Query<any>;
}
