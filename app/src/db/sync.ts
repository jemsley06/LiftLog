/**
 * Sync placeholder.
 *
 * Full sync with Supabase will be implemented when a
 * native development build is used (WatermelonDB sync requires native modules).
 * For now, data is stored locally via AsyncStorage.
 */

export async function sync() {
  console.log("Sync: using local storage only (no remote sync configured)");
}
