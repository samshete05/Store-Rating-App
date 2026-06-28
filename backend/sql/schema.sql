create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'normal_user', 'store_owner');
  end if;
end$$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(60) not null,
  email varchar(255) not null unique,
  address varchar(400) not null,
  password_hash text not null,
  role user_role not null default 'normal_user',
  store_id uuid unique null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null,
  email varchar(255) not null unique,
  address varchar(400) not null,
  owner_id uuid unique null references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users
  add constraint fk_users_storeseed.sql
  
  foreign key (store_id) references stores(id) on delete set null;

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback varchar(500) not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, store_id)
);

alter table if exists ratings
  add column if not exists feedback varchar(500) not null default '';

create index if not exists idx_users_role on users(role);
create index if not exists idx_users_email on users(email);
create index if not exists idx_stores_owner on stores(owner_id);
create index if not exists idx_ratings_store on ratings(store_id);
create index if not exists idx_ratings_user on ratings(user_id);
