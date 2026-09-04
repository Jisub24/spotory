-- AI가 요약한 장소 이야기를 캐싱해두는 컬럼들.
-- ai_summary_memory_count는 "이 요약을 생성했을 당시의 기록 개수"를 저장해서,
-- 이후 기록이 몇 개 더 늘었는지(= 요약이 낡았는지) 판단하는 기준으로 쓴다.
alter table places
  add column ai_summary text,
  add column ai_summary_generated_at timestamptz,
  add column ai_summary_memory_count integer not null default 0;
