-- =====================================================
-- Option 1: Materialized View (권장)
-- =====================================================
-- reach_rate를 미리 계산하여 저장하는 Materialized View
-- 조회 속도가 매우 빠름, 주기적으로 REFRESH 필요

CREATE MATERIALIZED VIEW IF NOT EXISTS influencer_staging_with_reach AS
SELECT
  pk,
  influencer_pk,
  platform_type,
  username,
  full_name,
  account_link,
  profile_img_link,
  category_1,
  category_2,
  follower,
  following,
  avg_like,
  avg_comment,
  avg_view,
  avg_reels_view,
  avg_reach,
  description,
  main_audience_age_range,
  main_audience_gender,
  is_meta_verified,
  post_count,
  campaign_price,
  external_url,
  taken_at,
  CASE
    WHEN NULLIF(follower, '') IS NOT NULL AND CAST(NULLIF(follower, '') AS BIGINT) > 0
    THEN ROUND((CAST(NULLIF(avg_reach, '') AS NUMERIC) / CAST(NULLIF(follower, '') AS NUMERIC) * 100)::NUMERIC, 2)
    ELSE NULL
  END as reach_rate
FROM influencer_staging;

-- Materialized View에 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_mv_platform_reach_rate
ON influencer_staging_with_reach (platform_type, reach_rate DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_mv_platform_type
ON influencer_staging_with_reach (platform_type);

-- 데이터 새로고침 (주기적으로 실행 필요)
-- REFRESH MATERIALIZED VIEW influencer_staging_with_reach;

-- =====================================================
-- Option 2: 계산된 컬럼 추가 (테이블 수정 필요)
-- =====================================================
-- 기존 테이블에 reach_rate 컬럼을 추가하고 값을 저장
-- 데이터 변경 시 트리거로 자동 업데이트

-- 컬럼 추가
-- ALTER TABLE influencer_staging ADD COLUMN IF NOT EXISTS reach_rate NUMERIC(10,2);

-- 값 업데이트
-- UPDATE influencer_staging
-- SET reach_rate = CASE
--   WHEN NULLIF(follower, '') IS NOT NULL AND CAST(NULLIF(follower, '') AS BIGINT) > 0
--   THEN ROUND((CAST(NULLIF(avg_reach, '') AS NUMERIC) / CAST(NULLIF(follower, '') AS NUMERIC) * 100)::NUMERIC, 2)
--   ELSE NULL
-- END;

-- 인덱스 생성
-- CREATE INDEX IF NOT EXISTS idx_staging_reach_rate_col
-- ON influencer_staging (platform_type, reach_rate DESC NULLS LAST);

-- =====================================================
-- Option 3: Expression Index (현재 테이블 구조 유지)
-- =====================================================
-- 계산식 자체에 인덱스 생성 (테이블 수정 없음)
-- 단, 복잡한 계산식은 인덱스 효율이 떨어질 수 있음

CREATE INDEX IF NOT EXISTS idx_staging_reach_rate_expr
ON influencer_staging (
  platform_type,
  (CASE
    WHEN NULLIF(follower, '') IS NOT NULL AND CAST(NULLIF(follower, '') AS BIGINT) > 0
    THEN CAST(NULLIF(avg_reach, '') AS NUMERIC) / CAST(NULLIF(follower, '') AS NUMERIC)
    ELSE NULL
  END) DESC NULLS LAST
);

-- =====================================================
-- 테이블 통계 업데이트
-- =====================================================
ANALYZE influencer_staging;
