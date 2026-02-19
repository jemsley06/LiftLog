import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "profiles",
      columns: [
        { name: "username", type: "string" },
        { name: "avatar_url", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "exercises",
      columns: [
        { name: "name", type: "string" },
        { name: "muscle_group", type: "string" },
        { name: "equipment", type: "string" },
        { name: "is_custom", type: "boolean" },
        { name: "created_by", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "workouts",
      columns: [
        { name: "user_id", type: "string" },
        { name: "name", type: "string", isOptional: true },
        { name: "started_at", type: "number" },
        { name: "completed_at", type: "number", isOptional: true },
        { name: "notes", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "sets",
      columns: [
        { name: "workout_id", type: "string" },
        { name: "exercise_id", type: "string" },
        { name: "set_number", type: "number" },
        { name: "weight", type: "number" },
        { name: "reps", type: "number" },
        { name: "rpe", type: "number", isOptional: true },
        { name: "calculated_1rm", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "friends",
      columns: [
        { name: "requester_id", type: "string" },
        { name: "addressee_id", type: "string" },
        { name: "status", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "parties",
      columns: [
        { name: "name", type: "string" },
        { name: "created_by", type: "string" },
        { name: "started_at", type: "number" },
        { name: "ended_at", type: "number", isOptional: true },
        { name: "is_active", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "party_members",
      columns: [
        { name: "party_id", type: "string" },
        { name: "user_id", type: "string" },
        { name: "score", type: "number" },
        { name: "joined_at", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
