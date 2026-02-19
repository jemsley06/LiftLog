import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { migrations } from "./migrations";

import Profile from "./models/Profile";
import Exercise from "./models/Exercise";
import Workout from "./models/Workout";
import SetModel from "./models/Set";
import Friend from "./models/Friend";
import Party from "./models/Party";
import PartyMember from "./models/PartyMember";

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error("WatermelonDB setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Profile,
    Exercise,
    Workout,
    SetModel,
    Friend,
    Party,
    PartyMember,
  ],
});

export {
  Profile,
  Exercise,
  Workout,
  SetModel,
  Friend,
  Party,
  PartyMember,
};
