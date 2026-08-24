-- 1. places: 사용자가 등록한 장소
create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index places_created_by_idx on places(created_by);

-- 2. memories: 장소에 남긴 기록 (사진, 코멘트, 날짜, 동행인)
create table memories (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_urls text[] not null default '{}',
  comment text,
  memory_date timestamptz not null,
  companion text,
  created_at timestamptz not null default now()
);

create index memories_place_id_idx on memories(place_id);
create index memories_user_id_idx on memories(user_id);

-- 3. RLS 활성화 (아래 정책이 없으면 아무도 접근 못 함 = 기본값이 "전부 차단")
alter table places enable row level security;
alter table memories enable row level security;

-- 4. places 정책: 로그인한 사용자는 "자신이 만든" 장소만 조회/생성/수정/삭제 가능
create policy "select_own_places" on places
  for select using (auth.uid() = created_by);

create policy "insert_own_places" on places
  for insert with check (auth.uid() = created_by);

create policy "update_own_places" on places
  for update using (auth.uid() = created_by);

create policy "delete_own_places" on places
  for delete using (auth.uid() = created_by);

-- 5. memories 정책: 로그인한 사용자는 "자신이 남긴" 기록만 조회/생성/수정/삭제 가능
create policy "select_own_memories" on memories
  for select using (auth.uid() = user_id);

create policy "insert_own_memories" on memories
  for insert with check (auth.uid() = user_id);

create policy "update_own_memories" on memories
  for update using (auth.uid() = user_id);

create policy "delete_own_memories" on memories
  for delete using (auth.uid() = user_id);
