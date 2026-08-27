-- 같은 실제 장소를 다른 검색어(상호명/주소 등)로 찾아도 중복 저장되지 않도록,
-- 구글이 부여하는 장소 고유 ID를 저장해둔다.
-- 사용자는 장소를 검색창에서 검색해서 저장하는 형식으로 진행하기 때문에 null값이 있으면 오류가 된다.
alter table places
  add column google_place_id text not null;

-- 한 사용자가 같은 구글 장소를 두 번 저장하지 못하도록 강제.
-- 다른 사용자끼리는 같은 장소를 각자 저장할 수 있어야 하므로 created_by와 묶어서 유니크 처리
create unique index places_created_by_google_place_id_idx
  on places (created_by, google_place_id);
