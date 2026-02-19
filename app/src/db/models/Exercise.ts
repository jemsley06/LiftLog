import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Exercise extends Model {
  static table = "exercises";

  @text("name") name!: string;
  @text("muscle_group") muscleGroup!: string;
  @text("equipment") equipment!: string;
  @field("is_custom") isCustom!: boolean;
  @text("created_by") createdBy!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
}
