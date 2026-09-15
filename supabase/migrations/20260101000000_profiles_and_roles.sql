-- Profiles + roles (admin can audit the question bank, student only practices)

create type user_role as enum ('admin', 'student');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'student',
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));
  -- role itself cannot be changed by the user, only by an admin/service role

-- Auto-create a profile row (default role = student) whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by other tables' RLS policies to check for admin role.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;
