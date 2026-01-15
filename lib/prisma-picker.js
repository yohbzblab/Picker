/**
 * Prisma Client for Picker Database (READ-ONLY)
 *
 * This client is for accessing the external Picker database which contains
 * Instagram influencer data. This database is READ-ONLY - no write operations
 * are allowed or supported.
 *
 * Available Models:
 * - influencer: Instagram influencer profiles with analytics
 * - instagram_profiles: Basic Instagram profile information
 * - instagram_posts: Individual Instagram post data
 * - instagram_keyword_cache: Cached keyword data for influencers
 * - sync_state: Database sync status tracking
 */

import { PrismaClient } from '../app/generated/prisma-picker';

// Create a singleton instance
let prismaPickerInstance = null;

// Configure with SSL settings for AWS RDS
const connectionOptions = {
  datasources: {
    db: {
      url: process.env.PICKER_DATABASE_URL,
    },
  },
  // Log only errors in production, include queries in development
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
};

/**
 * Get or create the Picker Prisma client instance
 * @returns {PrismaClient} Prisma client for Picker database
 */
export function getPrismaPickerClient() {
  if (!prismaPickerInstance) {
    prismaPickerInstance = new PrismaClient(connectionOptions);
  }

  return prismaPickerInstance;
}

// Export a default instance (without middleware for now)
const prismaPicker = getPrismaPickerClient();
export default prismaPicker;

/**
 * Example usage functions for common read operations
 */

/**
 * Search influencers by username
 * @param {string} searchTerm - Username or partial username to search
 * @param {number} limit - Maximum number of results (default: 10)
 */
export async function searchInfluencers(searchTerm, limit = 10) {
  return prismaPicker.influencer.findMany({
    where: {
      username: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
    take: limit,
    orderBy: {
      followers: 'desc',
    },
  });
}

/**
 * Get influencer with their Instagram profile
 * @param {string} username - Instagram username
 */
export async function getInfluencerWithProfile(username) {
  const [influencer, profile] = await Promise.all([
    prismaPicker.influencer.findUnique({
      where: {
        platform_username: {
          platform: 'instagram',
          username: username,
        },
      },
    }),
    prismaPicker.instagram_profiles.findUnique({
      where: {
        username: username,
      },
    }),
  ]);

  return {
    influencer,
    profile,
  };
}

/**
 * Get recent posts for an influencer
 * @param {string} username - Instagram username
 * @param {number} limit - Maximum number of posts (default: 10)
 */
export async function getInfluencerPosts(username, limit = 10) {
  return prismaPicker.instagram_posts.findMany({
    where: {
      username: username,
    },
    take: limit,
    orderBy: {
      taken_at: 'desc',
    },
  });
}

/**
 * Get influencers by category
 * @param {string} category - Category to filter by
 * @param {number} limit - Maximum number of results (default: 20)
 */
export async function getInfluencersByCategory(category, limit = 20) {
  return prismaPicker.influencer.findMany({
    where: {
      categories: {
        contains: category,
        mode: 'insensitive',
      },
    },
    take: limit,
    orderBy: {
      followers: 'desc',
    },
  });
}

/**
 * Get influencers by follower range
 * @param {number} minFollowers - Minimum follower count
 * @param {number} maxFollowers - Maximum follower count
 * @param {number} limit - Maximum number of results (default: 20)
 */
export async function getInfluencersByFollowerRange(minFollowers, maxFollowers, limit = 20) {
  return prismaPicker.influencer.findMany({
    where: {
      AND: [
        { followers: { gte: minFollowers } },
        { followers: { lte: maxFollowers } },
      ],
    },
    take: limit,
    orderBy: {
      followers: 'desc',
    },
  });
}