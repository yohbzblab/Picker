'use client'

import { useState, useEffect } from 'react'

// 키워드 데이터 (CSV 기반)
const KEYWORD_DATA = {
  A: {
    title: '매력',
    question: '님은 어떻게 매력적인가요?',
    groups: [
      { id: 'A-1', keywords: ['독보적이다', '압도적이다', '강렬하다', '치명적이다'] },
      { id: 'A-2', keywords: ['상큼하다', '청량하다', '싱그럽다', '러블리하다', '아리땁다', '어여쁘다'] },
      { id: 'A-3', keywords: ['빛나다', '해사하다', '눈부시다', '눈길을 끌다', '선명하다'] },
      { id: 'A-4', keywords: ['우아하다', '매혹적이다', '고혹적이다', '여신 같다', '환상적이다'] },
      { id: 'A-5', keywords: ['청초하다', '단아하다', '은은하다', '그윽하다'] },
      { id: 'A-6', keywords: ['세련되다', '감각적이다', '화려하다', '몽환적이다'] },
      { id: 'A-7', keywords: ['신비롭다', '완벽하다', '천상계', '경이롭다'] }
    ]
  },
  B: {
    title: '일상',
    question: '일상 생활과 자기 관리는요?',
    groups: [
      { id: 'B-1', keywords: ['부지런하다', '바지런하다'] },
      { id: 'B-2', keywords: ['일관되다', '성실하다', '절제력 있다'] },
      { id: 'B-3', keywords: ['꼼꼼하다', '알차다', '정성스럽다'] },
      { id: 'B-4', keywords: ['정갈하다', '섬세하다'] }
    ]
  },
  C: {
    title: '콘텐츠',
    question: '콘텐츠는 어떤가요?',
    groups: [
      { id: 'C-1', keywords: ['착장이 느낌 있다', '스타일이 트렌디하다', '스타일이 독창적이다'] },
      { id: 'C-2', keywords: ['구도가 특별하다', '조명 활용을 잘 한다', '배경이 인상 깊다', '음악과 편집이 감각적이다'] },
      { id: 'C-3', keywords: ['대본이 좋다', '편집과 영상미가 센스 넘친다', '기획력이 좋다', '퀄리티가 좋다'] },
      { id: 'C-4', keywords: ['바이럴에 한 몫한다', '후킹이 좋다', '썸네일이 센스 있다', '아이디어가 독창적이다'] },
      { id: 'C-5', keywords: ['업로드 주기가 꾸준하다', '구성에 대해 신경 쓴다', '프로페셔널하다', '구성이 체계적이다'] }
    ]
  },
  D: {
    title: '전달력',
    question: '설명 방식과 전달력은요?',
    groups: [
      { id: 'D-1', keywords: ['신뢰가 간다', '유용한 정보가 많다', '설득력 있다'] },
      { id: 'D-2', keywords: ['진정성 있다', '진솔하다'] },
      { id: 'D-3', keywords: ['설명이 명쾌하다', '이해하기 쉽다', '차분하다'] },
      { id: 'D-4', keywords: ['친절하다', '유머러스하다', '생동감 넘친다'] }
    ]
  },
  E: {
    title: '성장성',
    question: '성장 잠재력과 성격적인 특징은요?',
    groups: [
      { id: 'E-1', keywords: ['발전적이다', '잠재력이 있다', '탐구적이다'] },
      { id: 'E-2', keywords: ['도전적이다', '진취적이다', '주도적이다'] },
      { id: 'E-3', keywords: ['열정적이다', '긍정적이다'] },
      { id: 'E-4', keywords: ['유연하다', '수용적이다'] },
      { id: 'E-5', keywords: ['매력적이다', '톡톡 튄다', '발랄하다'] }
    ]
  },
  F: {
    title: '영향력',
    question: '영향력은요?',
    groups: [
      { id: 'F-1', keywords: ['많은 분들에게 좋은 영향력을 주는 것 같다'] },
      { id: 'F-2', keywords: ['많은 분들에게 영감을 준다'] },
      { id: 'F-3', keywords: ['많은 분들에게 귀감이 된다'] },
      { id: 'F-4', keywords: ['많은 분들에게 좋은 에너지를 주는 것 같다'] }
    ]
  }
}

// 질문 목록 (네비게이션용)
const QUESTIONS = Object.entries(KEYWORD_DATA).map(([id, data]) => ({
  id,
  title: data.title,
  question: data.question
}))

// 각 그룹에서 1~2개의 키워드를 랜덤으로 뽑는 함수
const getRandomKeywordsFromGroup = (keywords) => {
  const count = Math.random() < 0.5 ? 1 : 2 // 50% 확률로 1개 또는 2개
  const shuffled = [...keywords].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, keywords.length))
}

// 카테고리의 모든 그룹에서 랜덤 키워드를 뽑아 합치는 함수
const generateRandomKeywordsForCategory = (categoryId) => {
  const category = KEYWORD_DATA[categoryId]
  if (!category) return []

  const allKeywords = []
  category.groups.forEach(group => {
    const randomKeywords = getRandomKeywordsFromGroup(group.keywords)
    allKeywords.push(...randomKeywords)
  })

  return allKeywords
}

// 미리 작성된 칭찬 문구 리스트 (CORS 오류 시 폴백용)
const FALLBACK_COMPLIMENTS = [
  "항상 빛나는 콘텐츠로 많은 분들에게 영감을 주시는 모습이 정말 인상적이에요. 앞으로의 활동도 기대됩니다!",
  "섬세하고 감각적인 콘텐츠가 정말 매력적이에요. 꾸준히 성장하시는 모습이 멋집니다!",
  "진정성 있는 콘텐츠로 많은 분들에게 좋은 에너지를 전달해주시는 것 같아요. 응원합니다!",
  "독창적인 스타일과 퀄리티 높은 콘텐츠가 눈에 띄어요. 앞으로도 좋은 활동 기대할게요!",
  "열정적이고 긍정적인 에너지가 콘텐츠에서 느껴져요. 많은 분들에게 귀감이 되고 계시네요!",
  "세련되고 트렌디한 감각이 돋보이는 콘텐츠예요. 항상 새로운 영감을 주셔서 감사해요!",
  "꼼꼼하고 정성스러운 콘텐츠 제작이 느껴져요. 앞으로의 성장이 더욱 기대됩니다!",
  "유용한 정보와 진솔한 이야기로 신뢰가 가는 콘텐츠예요. 늘 응원하고 있습니다!",
  "창의적인 기획력과 뛰어난 영상미가 인상적이에요. 앞으로도 멋진 콘텐츠 기대할게요!",
  "밝고 긍정적인 에너지로 많은 분들에게 좋은 영향력을 주고 계시네요. 항상 응원합니다!"
]

// 랜덤 칭찬 선택 함수
const getRandomCompliment = () => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_COMPLIMENTS.length)
  return FALLBACK_COMPLIMENTS[randomIndex]
}

export default function ComplimentGeneratorModal({ isOpen, onClose, influencerName, onComplete }) {
  const [activeQuestionId, setActiveQuestionId] = useState('A')
  const [selectedKeywords, setSelectedKeywords] = useState({
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: []
  })
  const [displayKeywords, setDisplayKeywords] = useState({
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 모달이 열릴 때 초기화 및 랜덤 키워드 생성
  useEffect(() => {
    if (isOpen) {
      setActiveQuestionId('A')
      setSelectedKeywords({
        A: [],
        B: [],
        C: [],
        D: [],
        E: [],
        F: []
      })
      setError(null)
      setIsLoading(false)

      // 각 카테고리별 랜덤 키워드 생성
      const newDisplayKeywords = {}
      Object.keys(KEYWORD_DATA).forEach(categoryId => {
        newDisplayKeywords[categoryId] = generateRandomKeywordsForCategory(categoryId)
      })
      setDisplayKeywords(newDisplayKeywords)
    }
  }, [isOpen])

  const activeQuestion = QUESTIONS.find(q => q.id === activeQuestionId)

  // 키워드 선택/해제 토글
  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => {
      const currentKeywords = prev[activeQuestionId]
      if (currentKeywords.includes(keyword)) {
        return {
          ...prev,
          [activeQuestionId]: currentKeywords.filter(k => k !== keyword)
        }
      } else {
        return {
          ...prev,
          [activeQuestionId]: [...currentKeywords, keyword]
        }
      }
    })
  }

  // 모든 질문에 1개 이상 키워드가 선택되었는지 확인
  const isAllQuestionsAnswered = QUESTIONS.every(q => selectedKeywords[q.id].length > 0)

  // 완료 버튼 클릭
  const handleComplete = async () => {
    // 모든 선택된 키워드를 배열로 수집
    const allKeywords = QUESTIONS.flatMap(q => selectedKeywords[q.id])
    console.log('선택된 키워드:', allKeywords)

    setIsLoading(true)
    setError(null)

    try {
      // API 요청 시도
      const response = await fetch('/api/compliment/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: allKeywords,
          dmVersion: 'v1',
          customDmPrompt: ''
        })
      })

      if (!response.ok) {
        throw new Error('API 요청 실패')
      }

      const data = await response.json()
      console.log('API 응답:', data)

      // 부모 컴포넌트에 message 전달
      if (onComplete && data.message) {
        onComplete(data.message)
      }

      onClose()
    } catch (err) {
      console.error('맞춤형 칭찬 생성 오류 (폴백 사용):', err)

      // CORS 등 오류 시 폴백 칭찬 사용
      const fallbackCompliment = getRandomCompliment()
      console.log('폴백 칭찬 사용:', fallbackCompliment)

      if (onComplete) {
        onComplete(fallbackCompliment)
      }

      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            맞춤형 칭찬 생성하기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 키워드 선택 영역 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {activeQuestion.id}. {influencerName}{activeQuestion.question}
              </h3>
              <p className="text-sm text-gray-500">
                해당하는 키워드를 선택해주세요 (1개 이상)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {displayKeywords[activeQuestionId]?.map((keyword, index) => {
                const isSelected = selectedKeywords[activeQuestionId].includes(keyword)
                return (
                  <button
                    key={`${keyword}-${index}`}
                    onClick={() => toggleKeyword(keyword)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {keyword}
                  </button>
                )
              })}
            </div>

            {/* 선택된 키워드 표시 */}
            {selectedKeywords[activeQuestionId].length > 0 && (
              <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                <p className="text-sm font-medium text-pink-800 mb-2">선택된 키워드</p>
                <p className="text-sm text-pink-600">
                  {selectedKeywords[activeQuestionId].join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* 우측: 질문 카드 목록 */}
          <div className="w-48 border-l border-gray-200 p-4 overflow-y-auto bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">질문 목록</p>
            <div className="space-y-2">
              {QUESTIONS.map((question) => {
                const isActive = question.id === activeQuestionId
                const hasSelection = selectedKeywords[question.id].length > 0

                return (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestionId(question.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-pink-500 text-white'
                        : hasSelection
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {question.id}. {question.title}
                      </span>
                      {hasSelection && !isActive && (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 하단: 선택한 키워드 요약 + 진행 상태 및 완료 버튼 */}
        <div className="border-t border-gray-200 bg-gray-50">
          {/* 선택한 키워드 요약 */}
          {QUESTIONS.some(q => selectedKeywords[q.id].length > 0) && (
            <div className="px-6 py-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">선택한 키워드 요약</p>
              <div className="flex flex-wrap gap-1">
                {QUESTIONS.map((q) =>
                  selectedKeywords[q.id].map((keyword) => (
                    <span
                      key={`${q.id}-${keyword}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-700"
                    >
                      <span className="font-medium mr-1">{q.id}.</span>
                      {keyword}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 진행 상태 및 완료 버튼 */}
          <div className="px-6 py-4">
            {error && (
              <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  진행 상태: {QUESTIONS.filter(q => selectedKeywords[q.id].length > 0).length} / {QUESTIONS.length}
                </span>
                <div className="flex space-x-1">
                  {QUESTIONS.map((q) => (
                    <div
                      key={q.id}
                      className={`w-2 h-2 rounded-full ${
                        selectedKeywords[q.id].length > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleComplete}
                disabled={!isAllQuestionsAnswered || isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  isAllQuestionsAnswered && !isLoading
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>생성 중...</span>
                  </>
                ) : (
                  <span>완료</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
