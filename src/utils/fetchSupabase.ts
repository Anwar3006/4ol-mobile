const fetchSupabase = async (tableName: string, data: any) => {
  return await fetch(`${process.env.SUPABASE_URL}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_KEY!}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  });
};

export default fetchSupabase;
