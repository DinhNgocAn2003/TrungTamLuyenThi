-- Safe replacement for get_class_teachers RPC
-- This function returns class_teachers rows for a given class_id
-- and includes the joined teacher as JSON. It uses correct aliases
-- so it will not reference an undefined alias like `t.id`.
CREATE OR REPLACE FUNCTION public.get_class_teachers(p_class_id bigint)
RETURNS TABLE(
  ct_id bigint,
  class_id bigint,
  teacher_id bigint,
  is_main boolean,
  teacher jsonb
) AS $$
  SELECT
    ct.id,
    ct.class_id,
    ct.teacher_id,
    ct.is_main,
    to_jsonb(t.*) - 'password' AS teacher
  FROM public.class_teachers ct
  LEFT JOIN public.teachers t ON t.id = ct.teacher_id
  WHERE ct.class_id = p_class_id;
$$ LANGUAGE sql STABLE;

-- Notes:
-- - Apply this in the Supabase SQL editor or via psql/pgcli connected to your DB.
-- - If you have a different schema name, update the schema qualifiers accordingly.
-- - If your `teachers` table stores sensitive columns, subtract them from the JSON
--   as shown (the example removes a `password` column if present).