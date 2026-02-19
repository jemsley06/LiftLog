import { synchronize } from "@nozbe/watermelondb/sync";
import { database } from "./index";
import { supabase } from "../services/supabase";

const SYNCED_TABLES = ["profiles", "exercises", "workouts", "sets"];

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const timestamp = lastPulledAt || 0;
      const changes: any = {};

      for (const table of SYNCED_TABLES) {
        const { data: created, error: createError } = await supabase
          .from(table)
          .select("*")
          .gt("created_at", new Date(timestamp).toISOString())
          .is("deleted_at", null);

        const { data: updated, error: updateError } = await supabase
          .from(table)
          .select("*")
          .gt("updated_at", new Date(timestamp).toISOString())
          .lte("created_at", new Date(timestamp).toISOString())
          .is("deleted_at", null);

        const { data: deleted, error: deleteError } = await supabase
          .from(table)
          .select("id")
          .gt("deleted_at", new Date(timestamp).toISOString());

        if (createError || updateError || deleteError) {
          console.error(`Sync pull error for ${table}:`, createError || updateError || deleteError);
          continue;
        }

        changes[table] = {
          created: (created || []).map(mapFromSupabase),
          updated: (updated || []).map(mapFromSupabase),
          deleted: (deleted || []).map((r: any) => r.id),
        };
      }

      return { changes, timestamp: Date.now() };
    },
    pushChanges: async ({ changes }) => {
      for (const table of SYNCED_TABLES) {
        const tableChanges = (changes as any)[table];
        if (!tableChanges) continue;

        const { created, updated, deleted } = tableChanges;

        if (created?.length) {
          const rows = created.map(mapToSupabase);
          const { error } = await supabase.from(table).upsert(rows);
          if (error) console.error(`Sync push create error for ${table}:`, error);
        }

        if (updated?.length) {
          const rows = updated.map(mapToSupabase);
          const { error } = await supabase.from(table).upsert(rows);
          if (error) console.error(`Sync push update error for ${table}:`, error);
        }

        if (deleted?.length) {
          // Soft delete
          const { error } = await supabase
            .from(table)
            .update({ deleted_at: new Date().toISOString() })
            .in("id", deleted);
          if (error) console.error(`Sync push delete error for ${table}:`, error);
        }
      }
    },
  });
}

/**
 * Map a Supabase row to WatermelonDB format.
 * Converts snake_case timestamps to epoch milliseconds.
 */
function mapFromSupabase(row: any): any {
  const mapped: any = { ...row };
  if (mapped.created_at) mapped.created_at = new Date(mapped.created_at).getTime();
  if (mapped.updated_at) mapped.updated_at = new Date(mapped.updated_at).getTime();
  if (mapped.started_at) mapped.started_at = new Date(mapped.started_at).getTime();
  if (mapped.completed_at) mapped.completed_at = new Date(mapped.completed_at).getTime();
  if (mapped.ended_at) mapped.ended_at = new Date(mapped.ended_at).getTime();
  if (mapped.joined_at) mapped.joined_at = new Date(mapped.joined_at).getTime();
  return mapped;
}

/**
 * Map a WatermelonDB record to Supabase format.
 * Converts epoch milliseconds back to ISO strings.
 */
function mapToSupabase(record: any): any {
  const mapped: any = { ...record };
  // Remove WatermelonDB internal fields
  delete mapped._status;
  delete mapped._changed;
  // Convert timestamps
  if (mapped.created_at && typeof mapped.created_at === "number") {
    mapped.created_at = new Date(mapped.created_at).toISOString();
  }
  if (mapped.updated_at && typeof mapped.updated_at === "number") {
    mapped.updated_at = new Date(mapped.updated_at).toISOString();
  }
  if (mapped.started_at && typeof mapped.started_at === "number") {
    mapped.started_at = new Date(mapped.started_at).toISOString();
  }
  if (mapped.completed_at && typeof mapped.completed_at === "number") {
    mapped.completed_at = new Date(mapped.completed_at).toISOString();
  }
  if (mapped.ended_at && typeof mapped.ended_at === "number") {
    mapped.ended_at = new Date(mapped.ended_at).toISOString();
  }
  if (mapped.joined_at && typeof mapped.joined_at === "number") {
    mapped.joined_at = new Date(mapped.joined_at).toISOString();
  }
  return mapped;
}
