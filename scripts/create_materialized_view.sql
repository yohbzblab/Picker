-- =====================================================
-- Materialized View for reach_rate optimization
-- =====================================================
-- 실행 후 API에서 influencer_staging_with_reach 테이블 사용

-- Materialized View 생성
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

-- 인덱스 생성
CREATE INDEX idx_mv_platform_reach_rate
ON influencer_staging_with_reach (platform_type, reach_rate DESC NULLS LAST);

CREATE INDEX idx_mv_platform_type
ON influencer_staging_with_reach (platform_type);

CREATE INDEX idx_mv_username
ON influencer_staging_with_reach (username);

CREATE INDEX idx_mv_category1
ON influencer_staging_with_reach (category_1);

CREATE INDEX idx_mv_category2
ON influencer_staging_with_reach (category_2);

-- 통계 업데이트
ANALYZE influencer_staging_with_reach;

-- =====================================================
-- 데이터 새로고침 (필요 시 실행)
-- =====================================================
-- REFRESH MATERIALIZED VIEW influencer_staging_with_reach;
