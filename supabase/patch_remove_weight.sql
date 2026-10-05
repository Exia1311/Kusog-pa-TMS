-- Run once in the Supabase SQL editor. Replaces the report functions (no weight/volume).
drop function if exists public.dashboard_stats();
drop function if exists public.report_summary(text);

create function public.dashboard_stats()
returns table(today bigint, month bigint, total bigint)
language sql stable as $$
  select count(*) filter (where (created_at at time zone 'Asia/Manila')::date = (now() at time zone 'Asia/Manila')::date),
         count(*) filter (where date_trunc('month', created_at at time zone 'Asia/Manila') = date_trunc('month', now() at time zone 'Asia/Manila')),
         count(*)
  from tickets where deleted_at is null $$;

create function public.report_summary(p text)
returns table(period text, tickets bigint)
language sql stable as $$
  select case p when 'monthly' then to_char(created_at at time zone 'Asia/Manila','YYYY-MM')
                when 'weekly'  then to_char(date_trunc('week', created_at at time zone 'Asia/Manila'),'YYYY-MM-DD')
                else to_char(created_at at time zone 'Asia/Manila','YYYY-MM-DD') end,
         count(*)
  from tickets where deleted_at is null group by 1 order by 1 desc limit 60 $$;
