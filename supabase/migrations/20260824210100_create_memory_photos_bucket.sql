-- 기록 사진을 저장할 비공개 버킷 (URL을 안다고 아무나 못 봄, RLS 정책으로만 접근 가능)
insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', false)
on conflict (id) do nothing;

-- 업로드 경로를 반드시 "{내 user id}/파일명" 형태로 강제해서, 그 경로의 첫 폴더명이
-- 본인 user id와 같을 때만 조회/업로드/삭제를 허용한다.
create policy "select_own_memory_photos" on storage.objects
  for select using (
    bucket_id = 'memory-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "insert_own_memory_photos" on storage.objects
  for insert with check (
    bucket_id = 'memory-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete_own_memory_photos" on storage.objects
  for delete using (
    bucket_id = 'memory-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
