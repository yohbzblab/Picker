// 인플루언서 필드 업데이트 스크립트
// 1. 기존 DB에서 라벨 변경: '씨뉴랩 컨펌' → '브랜드 컨펌', '버즈비랩 컨펌' → '대행사 컨펌'
// 2. 불필요한 필드 제거: '버즈비랩 의견', '꼭 해보고 싶은 분'

const { PrismaClient } = require('../app/generated/prisma')

const prisma = new PrismaClient()

async function updateInfluencerFields() {
  try {
    console.log('🔄 인플루언서 필드 업데이트를 시작합니다...')

    // 1. 라벨 변경: '씨뉴랩 컨펌' → '브랜드 컨펌'
    const cnewlabUpdate = await prisma.influencerField.updateMany({
      where: {
        key: 'cnewlabConfirm'
      },
      data: {
        label: '브랜드 컨펌',
        tooltip: '브랜드에서 해당 인플루언서를 확인했는지 여부입니다.'
      }
    })
    console.log(`✅ '씨뉴랩 컨펌' → '브랜드 컨펌' 변경: ${cnewlabUpdate.count}개`)

    // 2. 라벨 변경: '버즈비랩 컨펌' → '대행사 컨펌'
    const buzzbylabConfirmUpdate = await prisma.influencerField.updateMany({
      where: {
        key: 'buzzbylabConfirm'
      },
      data: {
        label: '대행사 컨펌',
        tooltip: '대행사에서 해당 인플루언서를 확인했는지 여부입니다.'
      }
    })
    console.log(`✅ '버즈비랩 컨펌' → '대행사 컨펌' 변경: ${buzzbylabConfirmUpdate.count}개`)

    // 3. 불필요한 필드 제거: '버즈비랩 의견'
    const buzzbylabOpinionDelete = await prisma.influencerField.deleteMany({
      where: {
        key: 'buzzbylabOpinion'
      }
    })
    console.log(`🗑️ '버즈비랩 의견' 필드 제거: ${buzzbylabOpinionDelete.count}개`)

    // 4. 불필요한 필드 제거: '꼭 해보고 싶은 분'
    const wantToTryDelete = await prisma.influencerField.deleteMany({
      where: {
        key: 'wantToTry'
      }
    })
    console.log(`🗑️ '꼭 해보고 싶은 분' 필드 제거: ${wantToTryDelete.count}개`)

    // 5. 변경 결과 확인
    const allFields = await prisma.influencerField.findMany({
      where: {
        isActive: true
      },
      select: {
        key: true,
        label: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    console.log('\n📋 현재 활성 필드 목록:')
    allFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.key}: ${field.label}`)
    })

    console.log('\n✨ 인플루언서 필드 업데이트가 완료되었습니다!')

  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  updateInfluencerFields()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { updateInfluencerFields }