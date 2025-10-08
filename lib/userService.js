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
    return await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        profileImage: userData.profileImage,
        supabaseId: userData.supabaseId,
        isProfileComplete: true
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
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