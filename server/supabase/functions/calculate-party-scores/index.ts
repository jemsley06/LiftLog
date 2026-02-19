import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { set_id, user_id, party_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the set that was just logged
    const { data: set } = await supabase
      .from("sets")
      .select("*, exercises(name)")
      .eq("id", set_id)
      .single();

    if (!set || !set.calculated_1rm) {
      return new Response(
        JSON.stringify({ error: "Set not found or no 1RM" }),
        { status: 400 }
      );
    }

    // Get user's best 1RM for this exercise
    const { data: bestSet } = await supabase
      .from("sets")
      .select("calculated_1rm")
      .eq("exercise_id", set.exercise_id)
      .not("calculated_1rm", "is", null)
      .order("calculated_1rm", { ascending: false })
      .limit(1)
      .single();

    const best1RM = bestSet?.calculated_1rm || set.calculated_1rm;
    const intensityScore = (set.calculated_1rm / best1RM) * 100;

    // Add score to party member
    const { data: member } = await supabase
      .from("party_members")
      .select("score")
      .eq("party_id", party_id)
      .eq("user_id", user_id)
      .single();

    if (member) {
      await supabase
        .from("party_members")
        .update({ score: (member.score || 0) + intensityScore })
        .eq("party_id", party_id)
        .eq("user_id", user_id);
    }

    return new Response(
      JSON.stringify({
        score: intensityScore,
        total: (member?.score || 0) + intensityScore,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
