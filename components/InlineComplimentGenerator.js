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
  const count = Math.random() < 0.5 ? 1 : 2
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

// 키워드가 어느 카테고리에 속하는지 찾는 함수
const findKeywordCategory = (keyword) => {
  for (const [categoryId, category] of Object.entries(KEYWORD_DATA)) {
    for (const group of category.groups) {
      if (group.keywords.includes(keyword)) {
        return categoryId
      }
    }
  }
  return null
}

// 저장된 키워드 배열을 카테고리별로 분류하는 함수
const categorizeKeywords = (keywords) => {
  const categorized = { A: [], B: [], C: [], D: [], E: [], F: [] }
  if (!keywords || !Array.isArray(keywords)) return categorized

  keywords.forEach(keyword => {
    const category = findKeywordCategory(keyword)
    if (category) {
      categorized[category].push(keyword)
    }
  })
  return categorized
}

export default function InlineComplimentGenerator({
  influencerName,
  onKeywordsSelect,
  initialKeywords = [],
  initialCustomKeywords = []
}) {
  const [activeQuestionId, setActiveQuestionId] = useState('A')
  const [selectedKeywords, setSelectedKeywords] = useState(() =>
    categorizeKeywords(initialKeywords)
  )
  const [displayKeywords, setDisplayKeywords] = useState({
    A: [], B: [], C: [], D: [], E: [], F: []
  })
  const [customKeywords, setCustomKeywords] = useState(initialCustomKeywords)
  const [customKeywordInput, setCustomKeywordInput] = useState('')

  // 컴포넌트 마운트 시 랜덤 키워드 생성 + 저장된 키워드 포함
  useEffect(() => {
    const newDisplayKeywords = {}
    const categorizedInitial = categorizeKeywords(initialKeywords)

    Object.keys(KEYWORD_DATA).forEach(categoryId => {
      const randomKeywords = generateRandomKeywordsForCategory(categoryId)
      const savedKeywords = categorizedInitial[categoryId] || []

      // 저장된 키워드를 랜덤 키워드에 합치고 중복 제거
      const combined = [...new Set([...savedKeywords, ...randomKeywords])]
      newDisplayKeywords[categoryId] = combined
    })
    setDisplayKeywords(newDisplayKeywords)
  }, [initialKeywords])

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

  // 최소 1개 이상의 키워드가 선택되었는지 확인
  const hasAnyKeywordSelected = QUESTIONS.some(q => selectedKeywords[q.id].length > 0) || customKeywords.length > 0

  // 커스텀 키워드 추가
  const addCustomKeyword = () => {
    const trimmed = customKeywordInput.trim()
    if (trimmed && !customKeywords.includes(trimmed)) {
      setCustomKeywords(prev => [...prev, trimmed])
      setCustomKeywordInput('')
    }
  }

  // 커스텀 키워드 삭제
  const removeCustomKeyword = (keyword) => {
    setCustomKeywords(prev => prev.filter(k => k !== keyword))
  }

  // Enter 키로 커스텀 키워드 추가 (한글 IME 조합 중에는 무시)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      addCustomKeyword()
    }
  }

  // 완료 버튼 클릭 - 키워드 리스트만 저장 (선택된 키워드와 커스텀 키워드 분리)
  const handleComplete = () => {
    const allSelectedKeywords = QUESTIONS.flatMap(q => selectedKeywords[q.id])
    console.log('선택된 키워드:', allSelectedKeywords, '커스텀 키워드:', customKeywords)

    if (onKeywordsSelect) {
      // 첫 번째 인자: 카테고리에서 선택된 키워드만, 두 번째 인자: 커스텀 키워드
      onKeywordsSelect(allSelectedKeywords, customKeywords)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* 질문 탭 (A~F) */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {QUESTIONS.map((question) => {
          const isActive = question.id === activeQuestionId
          const hasSelection = selectedKeywords[question.id].length > 0

          return (
            <button
              key={question.id}
              onClick={() => setActiveQuestionId(question.id)}
              className={`flex-1 py-2 px-1 text-xs font-medium transition-all relative ${
                isActive
                  ? 'bg-[#FF3399] text-white'
                  : hasSelection
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold">{question.id}</span>
                <span className="text-[10px] truncate max-w-full">{question.title}</span>
              </div>
              {hasSelection && !isActive && (
                <div className="absolute top-1 right-1">
                  <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 현재 질문 */}
      <div className="p-3 bg-white">
        <p className="text-xs font-medium text-gray-800 mb-2">
          {activeQuestion.id}. {influencerName}{activeQuestion.question}
        </p>

        {/* 키워드 버튼들 */}
        <div className="flex flex-wrap gap-1.5">
          {displayKeywords[activeQuestionId]?.map((keyword, index) => {
            const isSelected = selectedKeywords[activeQuestionId].includes(keyword)
            return (
              <button
                key={`${keyword}-${index}`}
                onClick={() => toggleKeyword(keyword)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#FF3399] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {keyword}
              </button>
            )
          })}
        </div>
      </div>

      {/* 커스텀 키워드 입력 */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-[10px] font-medium text-gray-500 mb-1.5">직접 키워드 추가</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customKeywordInput}
            onChange={(e) => setCustomKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="키워드를 입력하세요"
            className="flex-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <button
            onClick={addCustomKeyword}
            disabled={!customKeywordInput.trim()}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              customKeywordInput.trim()
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            추가
          </button>
        </div>
      </div>

      {/* 선택한 키워드 요약 */}
      {QUESTIONS.some(q => selectedKeywords[q.id].length > 0) && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-[10px] font-medium text-gray-500 mb-1.5">지금까지 선택한 키워드</p>
          <div className="flex flex-wrap gap-1">
            {QUESTIONS.map((q) =>
              selectedKeywords[q.id].map((keyword) => (
                <span
                  key={`${q.id}-${keyword}`}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-700"
                >
                  <span className="font-bold mr-0.5">{q.id}.</span>
                  {keyword}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* 커스텀 키워드 표시 */}
      {customKeywords.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 bg-blue-50">
          <p className="text-[10px] font-medium text-blue-600 mb-1.5">직접 입력한 키워드</p>
          <div className="flex flex-wrap gap-1">
            {customKeywords.map((keyword, index) => (
              <span
                key={`custom-${index}`}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-blue-200 text-blue-700"
              >
                {keyword}
                <button
                  onClick={() => removeCustomKeyword(keyword)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 완료 버튼 */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!hasAnyKeywordSelected}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            hasAnyKeywordSelected
              ? 'bg-[#FF3399] text-white hover:bg-[#E62E8A]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          완료
        </button>
      </div>
    </div>
  )
}
