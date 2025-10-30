import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

const defaultFields = [
  {
    key: 'accountId',
    label: '계정 ID',
    tooltip: '인플루언서의 고유 계정 식별자입니다.',
    fieldType: 'TEXT',
    isRequired: true,
    isFixed: true,
    sortOrder: 1
  },
  {
    key: 'email',
    label: '이메일',
    tooltip: '인플루언서와 연락할 수 있는 이메일 주소입니다.',
    fieldType: 'EMAIL',
    isRequired: true,
    isFixed: true,
    sortOrder: 2
  },
  {
    key: 'name',
    label: '인플루언서 이름',
    tooltip: '인플루언서의 실제 이름 또는 활동명입니다.',
    fieldType: 'TEXT',
    isRequired: true,
    sortOrder: 3
  },
  {
    key: 'bio',
    label: '프로필 소개',
    tooltip: '인플루언서 프로필에 작성된 자기소개 내용입니다.',
    fieldType: 'LONG_TEXT',
    sortOrder: 4
  },
  {
    key: 'followers',
    label: '팔로워 수',
    tooltip: '현재 팔로워 수를 나타냅니다.',
    fieldType: 'NUMBER',
    validation: { min: 0 },
    sortOrder: 5
  },
  {
    key: 'ageGroup',
    label: '연령대',
    tooltip: '인플루언서의 추정 연령대입니다.',
    fieldType: 'TEXT',
    sortOrder: 6
  },
  {
    key: 'profileLink',
    label: '프로필 링크',
    tooltip: '인스타그램 프로필 페이지로 이동하는 링크입니다.',
    fieldType: 'URL',
    sortOrder: 7
  },
  {
    key: 'categories',
    label: '카테고리',
    tooltip: '인플루언서의 주요 활동 분야 또는 카테고리입니다.',
    fieldType: 'TAGS',
    sortOrder: 8
  },
  {
    key: 'hasLinks',
    label: '링크트리/유튜브',
    tooltip: '링크트리나 유튜브 채널 보유 여부를 표시합니다.',
    fieldType: 'SELECT',
    options: [
      { value: 'YOUTUBE_YES', label: '유튜브 O' },
      { value: 'LINKTREE_YES', label: '링크트리 O' },
      { value: 'NONE', label: '없음' }
    ],
    sortOrder: 9
  },
  {
    key: 'uploadFreq',
    label: '업로드 주기',
    tooltip: '평균적인 콘텐츠 업로드 주기입니다.',
    fieldType: 'TEXT',
    sortOrder: 10
  },
  {
    key: 'recentAvgViews',
    label: '최근 9개 평균 뷰',
    tooltip: '최근 상단 피드 9개 게시물의 평균 조회수입니다.',
    fieldType: 'NUMBER',
    validation: { min: 0 },
    sortOrder: 11
  },
  {
    key: 'captureLinks',
    label: '캡쳐 링크',
    tooltip: '최근 상단 피드 9개 게시물의 스크린샷 링크입니다.',
    fieldType: 'URL',
    sortOrder: 12
  },
  {
    key: 'pinnedAvgViews',
    label: '고정 3개 평균 뷰',
    tooltip: '최상단 고정된 3개 게시물의 평균 조회수입니다.',
    fieldType: 'NUMBER',
    validation: { min: 0 },
    sortOrder: 13
  },
  {
    key: 'recent18AvgViews',
    label: '최근 18개 평균 뷰',
    tooltip: '최근 18개 포스팅의 평균 조회수입니다.',
    fieldType: 'NUMBER',
    validation: { min: 0 },
    sortOrder: 14
  },
  {
    key: 'recentAds',
    label: '최근 광고 컨텐츠',
    tooltip: '최근 업로드된 광고성 콘텐츠 정보입니다.',
    fieldType: 'LONG_TEXT',
    sortOrder: 15
  },
  {
    key: 'contactMethod',
    label: '컨택 방법',
    tooltip: '인플루언서에게 연락할 수 있는 방법입니다.',
    fieldType: 'TEXT',
    sortOrder: 16
  },
  {
    key: 'notes',
    label: '특이사항',
    tooltip: '해당 인플루언서에 대한 특별한 메모나 주의사항입니다.',
    fieldType: 'LONG_TEXT',
    sortOrder: 17
  },
  {
    key: 'cnewlabConfirm',
    label: '씨뉴랩 컨펌',
    tooltip: '씨뉴랩에서 해당 인플루언서를 확인했는지 여부입니다.',
    fieldType: 'BOOLEAN',
    sortOrder: 18
  },
  {
    key: 'buzzbylabConfirm',
    label: '버즈비랩 컨펌',
    tooltip: '버즈비랩에서 해당 인플루언서를 확인했는지 여부입니다.',
    fieldType: 'BOOLEAN',
    sortOrder: 19
  },
  {
    key: 'buzzbylabOpinion',
    label: '버즈비랩 의견',
    tooltip: '버즈비랩의 해당 인플루언서에 대한 의견입니다.',
    fieldType: 'LONG_TEXT',
    sortOrder: 20
  },
  {
    key: 'wantToTry',
    label: '꼭 해보고 싶은 분',
    tooltip: '특별히 협업하고 싶은 인플루언서인지 여부입니다.',
    fieldType: 'BOOLEAN',
    sortOrder: 21
  },
  {
    key: 'dmSent',
    label: 'DM 전달 완료',
    tooltip: 'DM이 성공적으로 전달되었는지 여부입니다.',
    fieldType: 'SELECT',
    options: [
      { value: 'O', label: '완료' },
      { value: 'X', label: '미완료' },
      { value: 'PENDING', label: '진행중' }
    ],
    sortOrder: 22
  },
  {
    key: 'dmReply',
    label: 'DM 회신',
    tooltip: 'DM에 대한 회신이 있었는지 여부입니다.',
    fieldType: 'SELECT',
    options: [
      { value: 'O', label: '회신함' },
      { value: 'X', label: '미회신' },
      { value: 'PENDING', label: '대기중' }
    ],
    sortOrder: 23
  },
  {
    key: 'guideEmailSent',
    label: '가이드 전달 멜 전송',
    tooltip: '가이드 이메일이 전송되었는지 여부입니다.',
    fieldType: 'SELECT',
    options: [
      { value: 'O', label: '전송완료' },
      { value: 'X', label: '미전송' }
    ],
    sortOrder: 24
  },
  {
    key: 'guideAgreement',
    label: '가이드 동의',
    tooltip: '가이드에 동의했는지 여부입니다.',
    fieldType: 'SELECT',
    options: [
      { value: 'O', label: '동의' },
      { value: 'X', label: '미동의' },
      { value: 'PENDING', label: '검토중' }
    ],
    sortOrder: 25
  },
  {
    key: 'additionalOptions',
    label: '추가 옵션 요청',
    tooltip: '추가로 요청된 옵션이나 조건입니다.',
    fieldType: 'TEXT',
    sortOrder: 26
  },
  {
    key: 'finalAmount',
    label: '확정 금액',
    tooltip: '최종 확정된 협업 금액입니다.',
    fieldType: 'CURRENCY',
    validation: { min: 0 },
    sortOrder: 27
  }
]

export async function POST() {
  try {
    // 기존 필드 개수 확인
    const existingFieldsCount = await prisma.influencerField.count()

    if (existingFieldsCount > 0) {
      return NextResponse.json({ message: 'Fields already seeded', count: existingFieldsCount })
    }

    // 필드들을 배치로 생성
    const createdFields = await prisma.influencerField.createMany({
      data: defaultFields,
      skipDuplicates: true
    })

    return NextResponse.json({
      message: 'Default fields seeded successfully',
      count: createdFields.count
    })
  } catch (error) {
    console.error('Error seeding influencer fields:', error)
    return NextResponse.json({ error: 'Failed to seed fields' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}