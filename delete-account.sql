create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  anon boolean := coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if anon then
    raise exception 'guest sessions have no account to delete';
  end if;
  delete from public.member_words where user_id = uid;
  delete from public.room_messages where sender = uid;
  delete from public.room_messages where room in (select id from public.rooms where host = uid);
  delete from public.rooms where host = uid;
  update public.rooms set guest = null where guest = uid;
  update public.rooms set white = null where white = uid;
  update public.rooms set black = null where black = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;
