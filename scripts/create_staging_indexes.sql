-- =====================================================
-- Indexes for influencer_staging table optimization
-- =====================================================
-- Run this script on the PICKER_DATABASE to improve query performance
-- WARNING: Index creation may take time on large tables (683k+ rows)
-- NOTE: Table will be locked during index creation

-- 1. Index for platform_type filtering (WHERE clause)
-- This is the most frequently used filter
CREATE INDEX IF NOT EXISTS idx_staging_platform_type
ON influencer_staging (platform_type);

-- 2. Composite index for platform + follower sorting
-- Optimizes queries filtered by platform and sorted by followers
CREATE INDEX IF NOT EXISTS idx_staging_platform_follower
ON influencer_staging (platform_type, follower DESC NULLS LAST);

-- 3. Composite index for platform + reach_rate calculation sorting
-- Since reach_rate is calculated, we index the components
-- This helps with ORDER BY reach_rate when filtering by platform
CREATE INDEX IF NOT EXISTS idx_staging_platform_reach
ON influencer_staging (platform_type, avg_reach, follower);

-- 4. Index for search functionality (username, full_name)
CREATE INDEX IF NOT EXISTS idx_staging_username
ON influencer_staging (username);

CREATE INDEX IF NOT EXISTS idx_staging_fullname
ON influencer_staging (full_name);

-- 5. Index for category filtering
CREATE INDEX IF NOT EXISTS idx_staging_category1
ON influencer_staging (category_1);

CREATE INDEX IF NOT EXISTS idx_staging_category2
ON influencer_staging (category_2);

-- 6. Index for follower range filtering (numeric comparison)
-- Expression index for casted follower value
CREATE INDEX IF NOT EXISTS idx_staging_follower_numeric
ON influencer_staging ((CAST(NULLIF(follower, '') AS BIGINT)));

-- 7. Expression index for reach_rate calculation
-- This directly indexes the calculated reach_rate for sorting
CREATE INDEX IF NOT EXISTS idx_staging_reach_rate
ON influencer_staging ((
  CASE
    WHEN NULLIF(follower, '') IS NOT NULL AND CAST(NULLIF(follower, '') AS BIGINT) > 0
    THEN CAST(NULLIF(avg_reach, '') AS NUMERIC) / CAST(NULLIF(follower, '') AS NUMERIC)
    ELSE NULL
  END
)) WHERE platform_type = '0';

-- 8. Combined index for the most common query pattern
-- Platform filter + reach_rate sort
CREATE INDEX IF NOT EXISTS idx_staging_platform_reach_rate
ON influencer_staging (
  platform_type,
  (CASE
    WHEN NULLIF(follower, '') IS NOT NULL AND CAST(NULLIF(follower, '') AS BIGINT) > 0
    THEN CAST(NULLIF(avg_reach, '') AS NUMERIC) / CAST(NULLIF(follower, '') AS NUMERIC)
    ELSE NULL
  END) DESC NULLS LAST
);

-- =====================================================
-- Verify indexes after creation
-- =====================================================
-- Run this to check created indexes:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'influencer_staging';

-- =====================================================
-- Optional: Analyze table after index creation
-- =====================================================
ANALYZE influencer_staging;
