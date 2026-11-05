create table public.portfolio_records (
  path text primary key,
  value jsonb not null,
  version uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  constraint portfolio_record_path check (path = 'site/content.json' or path like 'messages/%' or path like 'limits/%')
);
alter table public.portfolio_records enable row level security;
revoke all on public.portfolio_records from anon, authenticated;
grant select, insert, update, delete on public.portfolio_records to service_role;
create function public.portfolio_write(p_path text, p_value jsonb, p_version uuid default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_version uuid;
begin
  if p_version is null then
    insert into public.portfolio_records(path,value) values(p_path,p_value)
    on conflict do nothing returning version into new_version;
  else
    update public.portfolio_records set value=p_value,version=gen_random_uuid(),updated_at=now()
    where path=p_path and version=p_version returning version into new_version;
  end if;
  if new_version is null then raise exception 'Record changed' using errcode='40001'; end if;
  return new_version;
end;
$$;
revoke all on function public.portfolio_write(text,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.portfolio_write(text,jsonb,uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit)
values('portfolio-media','portfolio-media',false,3000000);

create policy portfolio_server_access on public.portfolio_records for all to service_role using (true) with check (true);
