import { prisma } from './prisma'

export async function findUserBySupabaseId(supabaseId) {
  try {
    return await prisma.user.findUnique({
      where: { supabaseId }
    })
  } catch (error) {
    console.error('Error finding user by Supabase ID:', error)
    return null
  }
}

export async function findUserByEmail(email) {
  try {
    return await prisma.user.findUnique({
      where: { email }
    })
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

export async function createUser(userData) {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        profileImage: userData.profileImage,
        supabaseId: userData.supabaseId,
        isProfileComplete: true
      }
    })

    // 새 사용자를 위한 기본 인플루언서 필드 생성
    await createDefaultInfluencerFields(user.id)

    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// 기본 인플루언서 필드 생성 함수
async function createDefaultInfluencerFields(userId) {
  try {
    const defaultFields = [
      {
        userId,
        fieldName: 'name',
        displayName: '인플루언서 이름',
        fieldType: 'text',
        isRequired: true,
        isFixed: false,
        sortOrder: 1
      },
      {
        userId,
        fieldName: 'followers',
        displayName: '팔로워 수',
        fieldType: 'number',
        isRequired: true,
        isFixed: false,
        sortOrder: 2
      },
      {
        userId,
        fieldName: 'email',
        displayName: '이메일',
        fieldType: 'email',
        isRequired: true,
        isFixed: true,
        sortOrder: 3
      },
      {
        userId,
        fieldName: 'bio',
        displayName: '자기소개',
        fieldType: 'textarea',
        isRequired: false,
        isFixed: false,
        sortOrder: 4
      },
      {
        userId,
        fieldName: 'engagement_rate',
        displayName: '참여율',
        fieldType: 'number',
        isRequired: false,
        isFixed: false,
        sortOrder: 5
      },
      {
        userId,
        fieldName: 'categories',
        displayName: '카테고리',
        fieldType: 'text',
        isRequired: false,
        isFixed: false,
        sortOrder: 6
      }
    ]

    await prisma.influencerField.createMany({
      data: defaultFields
    })

    console.log(`Created ${defaultFields.length} default influencer fields for user ${userId}`)
  } catch (error) {
    console.error('Error creating default influencer fields:', error)
    // 필드 생성 실패는 사용자 생성을 실패시키지 않음
  }
}

export async function updateUser(id, userData) {
  try {
    return await prisma.user.update({
      where: { id },
      data: userData
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function completeUserProfile(id, profileData) {
  try {
    return await prisma.user.update({
      where: { id },
      data: {
        ...profileData,
        isProfileComplete: true
      }
    })
  } catch (error) {
    console.error('Error completing user profile:', error)
    throw error
  }
}