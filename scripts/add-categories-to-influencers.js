const { PrismaClient } = require('../app/generated/prisma')

const prisma = new PrismaClient()

// 카테고리 풀
const categories = [
  '뷰티', '패션', '라이프스타일', '여행', '음식',
  '피트니스', '테크', '게임', '육아', '펫',
  '홈인테리어', '요리', '독서', '영화', '음악',
  '아트', '사진', 'DIY', '자동차', '스포츠'
]

// 랜덤하게 1-4개의 카테고리를 선택하는 함수
function getRandomCategories() {
  const shuffled = [...categories].sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 4) + 1 // 1-4개
  return shuffled.slice(0, count)
}

async function addCategoriesToInfluencers() {
  try {
    console.log('기존 인플루언서들에 카테고리 추가 시작...')

    // 모든 인플루언서 조회
    const influencers = await prisma.influencer.findMany()

    console.log(`총 ${influencers.length}명의 인플루언서를 찾았습니다.`)

    // 각 인플루언서에 카테고리 추가
    for (const influencer of influencers) {
      const currentFieldData = influencer.fieldData || {}

      // 이미 카테고리가 있는 경우 건너뛰기
      if (currentFieldData.categories && Array.isArray(currentFieldData.categories)) {
        console.log(`${influencer.accountId}: 이미 카테고리가 있음, 건너뛰기`)
        continue
      }

      // 새로운 카테고리 추가
      const newCategories = getRandomCategories()
      const updatedFieldData = {
        ...currentFieldData,
        categories: newCategories
      }

      await prisma.influencer.update({
        where: { id: influencer.id },
        data: { fieldData: updatedFieldData }
      })

      console.log(`${influencer.accountId}: 카테고리 추가됨 - [${newCategories.join(', ')}]`)
    }

    console.log('✅ 모든 인플루언서에 카테고리가 성공적으로 추가되었습니다!')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
addCategoriesToInfluencers()