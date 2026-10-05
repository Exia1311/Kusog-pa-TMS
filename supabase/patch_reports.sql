-- Run once in the Supabase SQL editor (after schema.sql). Security invoker: RLS still applies.
create or replace function public.dashboard_stats()
returns table(today bigint, month bigint, pending bigint, volume numeric)
language sql stable as $$
  select count(*) filter (where (created_at at time zone 'Asia/Manila')::date = (now() at time zone 'Asia/Manila')::date),
         count(*) filter (where date_trunc('month', created_at at time zone 'Asia/Manila') = date_trunc('month', now() at time zone 'Asia/Manila')),
         count(*) filter (where net_weight_tons is null),
         coalesce(sum(net_weight_tons), 0)
  from tickets where deleted_at is null $$;

create or replace function public.report_summary(p text)
returns table(period text, tickets bigint, volume numeric)
language sql stable as $$
  select case p when 'monthly' then to_char(created_at at time zone 'Asia/Manila','YYYY-MM')
                when 'weekly'  then to_char(date_trunc('week', created_at at time zone 'Asia/Manila'),'YYYY-MM-DD')
                else to_char(created_at at time zone 'Asia/Manila','YYYY-MM-DD') end,
         count(*), coalesce(sum(net_weight_tons), 0)
  from tickets where deleted_at is null group by 1 order by 1 desc limit 60 $$;
