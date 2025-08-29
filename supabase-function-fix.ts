import {serve} from 'https://deno.land/std@0.177.0/http/server.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

serve(async req => {
  try {
    const {action} = await req.json(); // e.g. "NearByPlace"

    // 1. Get row for this specific action only
    const {data, error} = await supabase
      .from('api_usage')
      .select('*')
      .eq('action', action)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ok: false, message: 'Invalid action'}),
        {status: 400},
      );
    }

    // 2. Check limit for this specific action only
    if (data.usage_count >= data.usage_limit) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: `${action} limit reached`,
        }),
        {status: 403},
      );
    }

    // 3. Increment counts:
    // - ONLY the exact action that was called
    await supabase.rpc('increment_api_usage', {api_key: action});

    // - its parent family (e.g., PlaceApi, DistanceMatrix, etc.)
    await supabase.rpc('increment_api_usage', {api_key: data.api_name});

    // - global total
    await supabase.rpc('increment_api_usage', {api_key: 'Total'});

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Allowed',
      }),
      {status: 200},
    );
  } catch (e) {
    return new Response(JSON.stringify({ok: false, message: e.message}), {
      status: 500,
    });
  }
});
