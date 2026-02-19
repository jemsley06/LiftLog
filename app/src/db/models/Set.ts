import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly, relation } from "@nozbe/watermelondb/decorators";

export default class SetModel extends Model {
  static table = "sets";

  static associations = {
    workouts: { type: "belongs_to" as const, key: "workout_id" },
    exercises: { type: "belongs_to" as const, key: "exercise_id" },
  };

  @text("workout_id") workoutId!: string;
  @text("exercise_id") exerciseId!: string;
  @field("set_number") setNumber!: number;
  @field("weight") weight!: number;
  @field("reps") reps!: number;
  @field("rpe") rpe!: number | null;
  @field("calculated_1rm") calculated1RM!: number | null;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("workouts", "workout_id") workout!: any;
  @relation("exercises", "exercise_id") exercise!: any;
}
