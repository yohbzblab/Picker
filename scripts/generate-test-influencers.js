const { PrismaClient } = require('../app/generated/prisma')

const prisma = new PrismaClient()

// 한국 이름 목록
const koreanFirstNames = [
  '민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지우', '준서',
  '건우', '현우', '민성', '준혁', '은우', '윤우', '승현', '시윤', '유준', '연우',
  '서연', '서윤', '지우', '서현', '민서', '하은', '지유', '소율', '지민', '서영'
]

const koreanLastNames = [
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
  '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'
]

// 카테고리 목록
const categories = [
  '뷰티', '패션', '라이프스타일', '여행', '음식', '운동', '게임',
  '테크', '육아', '반려동물', '인테리어', '요리', '독서', '영화'
]

// 랜덤 숫자 생성 함수
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 랜덤 요소 선택 함수
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// 팔로워 수 생성 (1K ~ 1M)
function generateFollowers() {
  const ranges = [
    { min: 1000, max: 10000 },     // 1K-10K (마이크로 인플루언서)
    { min: 10000, max: 100000 },   // 10K-100K (중소 인플루언서)
    { min: 100000, max: 1000000 }  // 100K-1M (메가 인플루언서)
  ]

  const range = getRandomElement(ranges)
  return getRandomInt(range.min, range.max)
}

// 이메일 도메인
const emailDomains = ['gmail.com', 'naver.com', 'kakao.com', 'hanmail.net', 'daum.net']

async function generateTestInfluencers() {
  try {
    console.log('🔍 사용자 확인 중...')

    // 첫 번째 사용자 찾기 (테스트용)
    const user = await prisma.user.findFirst({
      orderBy: { id: 'asc' }
    })

    if (!user) {
      console.error('❌ 사용자를 찾을 수 없습니다. 먼저 로그인해주세요.')
      return
    }

    console.log(`✅ 사용자 발견: ${user.email} (ID: ${user.id})`)

    console.log('🏗️  30명의 테스트 인플루언서 생성 중...')

    const influencers = []

    for (let i = 1; i <= 30; i++) {
      const firstName = getRandomElement(koreanFirstNames)
      const lastName = getRandomElement(koreanLastNames)
      const fullName = lastName + firstName

      const accountId = `${firstName.toLowerCase()}${lastName.toLowerCase()}${getRandomInt(10, 99)}`
      const followers = generateFollowers()
      const category = getRandomElement(categories)
      const email = `${accountId}@${getRandomElement(emailDomains)}`

      const influencerData = {
        userId: user.id,
        accountId: accountId,
        fieldData: {
          name: fullName,
          email: email,
          followers: followers,
          category: category,
          description: `${category} 분야의 인플루언서입니다. 팔로워 ${followers.toLocaleString()}명과 함께 소통하고 있습니다.`,
          location: getRandomElement(['서울', '부산', '대구', '인천', '광주', '대전', '울산']),
          age: getRandomInt(20, 35),
          engagement_rate: (Math.random() * 10 + 1).toFixed(2) + '%',
          platform: 'INSTAGRAM',
          status: 'ACTIVE'
        }
      }

      influencers.push(influencerData)
    }

    // 인플루언서 데이터 삽입
    const results = await Promise.all(
      influencers.map(influencerData =>
        prisma.influencer.create({ data: influencerData })
      )
    )

    console.log(`🎉 성공적으로 ${results.length}명의 인플루언서를 생성했습니다!`)

    // 요약 출력
    console.log('\n📊 생성된 인플루언서 요약:')
    results.forEach((influencer, index) => {
      const data = influencer.fieldData
      console.log(`${index + 1}. ${data.name} (@${influencer.accountId}) - ${data.followers.toLocaleString()} 팔로워 (${data.category})`)
    })

    console.log('\n✨ 이제 웹사이트에서 인플루언서 연결 기능을 테스트할 수 있습니다!')

  } catch (error) {
    console.error('❌ 인플루언서 생성 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
generateTestInfluencers()