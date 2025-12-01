'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// 변수 에디터 컴포넌트 - 버튼으로만 변수 삽입
export function VariableEditor({ value, onChange, placeholder, isMultiline = false, onInsertVariable, onFocus, onBlur }) {
  const editorRef = useRef(null)
  const displayRef = useRef(null)

  // textarea 높이를 내용에 맞춰 자동 조절
  useEffect(() => {
    if (isMultiline && editorRef.current) {
      // 높이를 auto로 설정하여 스크롤 높이를 정확히 계산
      editorRef.current.style.height = 'auto'
      // 스크롤 높이에 맞춰 높이 설정
      editorRef.current.style.height = editorRef.current.scrollHeight + 'px'

      // display div도 동일한 높이로 설정
      if (displayRef.current) {
        displayRef.current.style.height = editorRef.current.scrollHeight + 'px'
      }
    }
  }, [value, isMultiline])

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const element = e.target
      const cursorPos = element.selectionStart
      const textBefore = value.substring(0, cursorPos)

      // 커서 바로 앞이 변수인지 확인 - {{변수명}} 형태
      const variableMatch = textBefore.match(/\{\{[^}]+\}\}$/)

      if (variableMatch) {
        e.preventDefault()
        // 변수 전체를 삭제
        const newValue = value.substring(0, cursorPos - variableMatch[0].length) + value.substring(cursorPos)
        onChange(newValue)

        // 커서 위치 조정
        setTimeout(() => {
          element.setSelectionRange(cursorPos - variableMatch[0].length, cursorPos - variableMatch[0].length)
        }, 0)
      }
    }
  }

  const handleChange = (e) => {
    const newValue = e.target.value

    // 사용자가 직접 {{}} 를 입력하는 것을 방지
    if (newValue.includes('{{') && !value.includes('{{')) {
      // 새로 입력된 {{를 제거
      const cleanedValue = newValue.replace(/\{\{/g, '')
      onChange(cleanedValue)
      return
    }

    onChange(newValue)

    // 멀티라인일 경우 높이 자동 조절
    if (isMultiline && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.style.height = 'auto'
          editorRef.current.style.height = editorRef.current.scrollHeight + 'px'

          if (displayRef.current) {
            displayRef.current.style.height = editorRef.current.scrollHeight + 'px'
          }
        }
      }, 0)
    }
  }

  // 변수 삽입 함수
  const insertVariable = (variable) => {
    const element = editorRef.current
    if (!element) return

    // DOM 요소에서 직접 현재 값과 커서 위치 가져오기
    const currentValue = element.value || value || ''
    let start = 0
    let end = 0

    try {
      // 요소가 포커스되어 있거나 selectionStart가 있는 경우
      if (element.selectionStart !== undefined && element.selectionEnd !== undefined) {
        start = element.selectionStart
        end = element.selectionEnd
      } else {
        // 포커스가 없거나 selection이 없는 경우 끝에 추가
        start = end = currentValue.length
      }
    } catch (e) {
      // selection 접근 실패 시 끝에 추가
      start = end = currentValue.length
    }

    const before = currentValue.substring(0, start)
    const after = currentValue.substring(end)

    // 변수를 {{변수명}} 형태로 삽입
    const formattedVariable = `{{${variable}}}`
    const newValue = before + formattedVariable + after


    // 상태 업데이트
    onChange(newValue)

    // DOM 요소 값도 직접 업데이트 (동기화)
    element.value = newValue

    // DOM 업데이트 후 포커스와 커서 설정
    requestAnimationFrame(() => {
      try {
        if (element && typeof element.focus === 'function') {
          element.focus()
          const newPos = start + formattedVariable.length
          if (typeof element.setSelectionRange === 'function') {
            element.setSelectionRange(newPos, newPos)
          }
        }
      } catch (e) {
        // 커서 설정 실패 시 무시
      }
    })
  }

  // onInsertVariable prop으로 insertVariable 함수 전달
  useEffect(() => {
    if (onInsertVariable) {
      onInsertVariable(insertVariable)
    }
  }, [onInsertVariable])

  // 텍스트를 렌더링할 때 변수 부분만 태그로 표시
  const renderWithHighlight = () => {
    if (!value && !placeholder) return null
    if (!value) return <span className="text-gray-400">{placeholder}</span>

    const parts = []
    // 변수는 {{변수명}} 형태
    const variableRegex = /\{\{([^}]+)\}\}/g
    let lastIndex = 0
    let match

    while ((match = variableRegex.exec(value)) !== null) {
      // 변수 앞의 일반 텍스트
      if (match.index > lastIndex) {
        const text = value.substring(lastIndex, match.index)
        parts.push(
          <span key={`text-${lastIndex}`} className="text-gray-900 font-medium">
            {text}
          </span>
        )
      }

      // 변수 부분 (연두색 텍스트로 표시)
      parts.push(
        <span
          key={`var-${match.index}`}
          className="text-green-500 font-medium"
        >
          {match[0]}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // 마지막 일반 텍스트
    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="text-gray-900 font-medium">
          {value.substring(lastIndex)}
        </span>
      )
    }

    return parts
  }

  if (isMultiline) {
    return (
      <div className="relative">
        <div
          ref={displayRef}
          className="p-3 whitespace-pre-wrap overflow-hidden rounded-lg border border-gray-300 bg-white pointer-events-none"
          style={{ lineHeight: '1.5rem', minHeight: '10rem' }}
        >
          {renderWithHighlight()}
        </div>
        <textarea
          ref={editorRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className="absolute inset-0 w-full p-3 text-transparent bg-transparent font-medium resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg overflow-hidden"
          style={{
            caretColor: '#111827', // 커서 색상을 검정색으로
            lineHeight: '1.5rem',
            minHeight: '10rem'
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="px-3 py-2 overflow-hidden rounded-lg border border-gray-300 bg-white flex items-center pointer-events-none whitespace-pre-wrap"
        style={{ minHeight: '42px' }}
      >
        {renderWithHighlight()}
      </div>
      <input
        ref={editorRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="absolute inset-0 w-full h-full px-3 py-2 text-transparent bg-transparent font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
        style={{
          caretColor: '#111827' // 커서 색상을 검정색으로
        }}
      />
    </div>
  )
}

// 조건문 설정 모달 컴포넌트 (그룹 관리용)
export function ConditionsModal({ field, variableName, variableInfo, initialRules, onSave, onClose }) {
  const [selectedVariable, setSelectedVariable] = useState(null)
  const [newVariableName, setNewVariableName] = useState('')
  const [newVariableAlias, setNewVariableAlias] = useState('')
  const [variables, setVariables] = useState(initialRules.variables || {})
  const [errors, setErrors] = useState([])

  // 새 조건문 변수 추가
  const addVariable = () => {
    if (newVariableName.trim()) {
      const varKey = `${variableName}_${newVariableName.replace(/\s+/g, '_').toLowerCase()}`

      setVariables(prev => ({
        ...prev,
        [varKey]: {
          alias: newVariableAlias || newVariableName,
          conditions: [],
          defaultValue: ''
        }
      }))

      setNewVariableName('')
      setNewVariableAlias('')
      setSelectedVariable(varKey)
    }
  }

  // 조건문 변수 삭제
  const deleteVariable = (varKey) => {
    if (confirm(`"${variables[varKey]?.alias || varKey}" 변수를 삭제하시겠습니까?`)) {
      setVariables(prev => {
        const updated = { ...prev }
        delete updated[varKey]
        return updated
      })
      if (selectedVariable === varKey) {
        setSelectedVariable(null)
      }
    }
  }

  // 선택된 변수의 조건 추가
  const addCondition = () => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        conditions: [
          ...(prev[selectedVariable].conditions || []),
          { min: '', max: '', operator: 'range', result: '' }
        ]
      }
    }))
  }

  // 조건 삭제
  const removeCondition = (index) => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        conditions: prev[selectedVariable].conditions.filter((_, i) => i !== index)
      }
    }))
  }

  // 조건 수정
  const updateCondition = (index, field, value) => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        conditions: prev[selectedVariable].conditions.map((cond, i) =>
          i === index ? { ...cond, [field]: value } : cond
        )
      }
    }))
  }

  // 기본값 수정
  const updateDefaultValue = (value) => {
    if (!selectedVariable) return

    setVariables(prev => ({
      ...prev,
      [selectedVariable]: {
        ...prev[selectedVariable],
        defaultValue: value
      }
    }))
  }

  // 저장하기 전 검증
  const handleSave = () => {
    const validationErrors = []

    // 각 변수별 검증
    Object.entries(variables).forEach(([, varData]) => {
      varData.conditions?.forEach((condition, index) => {
        if (!condition.result.trim()) {
          validationErrors.push(`${varData.alias}의 조건 ${index + 1} 결과값을 입력해주세요.`)
        }

        if (condition.operator === 'range') {
          if (!condition.min && !condition.max) {
            validationErrors.push(`${varData.alias}의 조건 ${index + 1} 범위를 설정해주세요.`)
          }
        } else if (['equal', 'greater', 'less', 'greaterEqual', 'lessEqual'].includes(condition.operator)) {
          if (!condition.min && condition.min !== 0) {
            validationErrors.push(`${varData.alias}의 조건 ${index + 1} 기준값을 입력해주세요.`)
          }
        }
      })
    })

    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      onSave({
        displayName: field?.label || variableInfo?.label || variableName,
        variables
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full max-h-[90vh]">
          {/* 왼쪽: 변수 목록 */}
          <div className="w-1/3 bg-gray-50 p-4 border-r overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">
              {field?.label || variableInfo?.label || variableName} 조건 변수
            </h3>

            {/* 새 변수 추가 */}
            <div className="mb-4">
              <input
                type="text"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="변수명 (예: tier, level)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm font-medium mb-2"
              />
              <input
                type="text"
                value={newVariableAlias}
                onChange={(e) => setNewVariableAlias(e.target.value)}
                placeholder="별칭 (예: 등급, 레벨)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm font-medium mb-2"
              />
              <button
                onClick={addVariable}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                조건 변수 추가
              </button>
            </div>

            {/* 변수 목록 */}
            <div className="space-y-2">
              {Object.entries(variables).map(([varKey, varData]) => (
                <div
                  key={varKey}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedVariable === varKey
                      ? 'bg-purple-100 border-purple-500 border-2'
                      : 'bg-white border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedVariable(varKey)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {varData.alias || varKey}
                      </div>
                      <code className="text-xs text-gray-500">{`{{${varKey}}}`}</code>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVariable(varKey)
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {varData.conditions?.length || 0}개 조건
                  </span>
                </div>
              ))}
            </div>

            {Object.keys(variables).length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                조건 변수를 추가해주세요
              </div>
            )}
          </div>

          {/* 오른쪽: 조건 설정 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedVariable && variables[selectedVariable]
                  ? `"${variables[selectedVariable].alias}" 조건 설정`
                  : '조건 설정'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedVariable ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  원본 값({field?.label || variableName})에 따라 다른 텍스트를 출력하는 조건을 설정하세요.
                </p>

                {/* 오류 메시지 */}
                {errors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">오류가 있습니다:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 조건 목록 */}
                <div className="space-y-4">
                  {variables[selectedVariable]?.conditions?.map((condition, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">조건 {index + 1}</h4>
                        <button
                          onClick={() => removeCondition(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          삭제
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* 조건 타입 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">조건 타입</label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                          >
                            <option value="range">범위 (이상 ~ 이하)</option>
                            <option value="equal">같음 (=)</option>
                            <option value="greater">초과 (&gt;)</option>
                            <option value="less">미만 (&lt;)</option>
                            <option value="greaterEqual">이상 (&gt;=)</option>
                            <option value="lessEqual">이하 (&lt;=)</option>
                          </select>
                        </div>

                        {/* 최소값 */}
                        {condition.operator === 'range' ? (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">최소값 (이상)</label>
                            <input
                              type="number"
                              value={condition.min}
                              onChange={(e) => updateCondition(index, 'min', e.target.value)}
                              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                              placeholder="예: 1000"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">기준값</label>
                            <input
                              type="number"
                              value={condition.min}
                              onChange={(e) => updateCondition(index, 'min', e.target.value)}
                              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                              placeholder="예: 1000"
                            />
                          </div>
                        )}

                        {/* 최대값 (범위일 때만) */}
                        {condition.operator === 'range' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">최대값 (이하)</label>
                            <input
                              type="number"
                              value={condition.max}
                              onChange={(e) => updateCondition(index, 'max', e.target.value)}
                              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-black font-medium"
                              placeholder="예: 4000"
                            />
                          </div>
                        )}

                        {/* 결과값 */}
                        <div className={condition.operator === 'range' ? '' : 'md:col-span-2'}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">출력 텍스트</label>
                          <input
                            type="text"
                            value={condition.result}
                            onChange={(e) => updateCondition(index, 'result', e.target.value)}
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                            placeholder="예: 소규모 인플루언서"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 조건 추가 버튼 */}
                  <button
                    onClick={addCondition}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + 조건 추가
                  </button>
                </div>

                {/* 기본값 설정 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기본값 (어떤 조건에도 해당하지 않을 때)
                  </label>
                  <input
                    type="text"
                    value={variables[selectedVariable]?.defaultValue || ''}
                    onChange={(e) => updateDefaultValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-black font-medium"
                    placeholder="예: 기타"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                왼쪽에서 조건 변수를 선택하거나 새로 만들어주세요.
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 사용자 변수 모달
export const UserVariableModal = ({ isOpen, onClose, userVariables, setUserVariables }) => {
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newVariableName, setNewVariableName] = useState('')
  const [newVariableAlias, setNewVariableAlias] = useState('')

  if (!isOpen) return null

  // 그룹 추가
  const addGroup = () => {
    if (newGroupName.trim() && !userVariables[newGroupName]) {
      setUserVariables(prev => ({
        ...prev,
        [newGroupName]: {
          displayName: newGroupName,
          variables: {}
        }
      }))
      setNewGroupName('')
    }
  }

  // 그룹 삭제
  const deleteGroup = (groupName) => {
    if (confirm(`"${groupName}" 그룹과 모든 변수를 삭제하시겠습니까?`)) {
      setUserVariables(prev => {
        const updated = { ...prev }
        delete updated[groupName]
        return updated
      })
      if (selectedGroup === groupName) {
        setSelectedGroup(null)
      }
    }
  }

  // 변수 추가
  const addVariable = () => {
    if (selectedGroup && newVariableName.trim()) {
      const variableKey = `${selectedGroup}_${newVariableName.replace(/\s+/g, '_').toLowerCase()}`

      setUserVariables(prev => ({
        ...prev,
        [selectedGroup]: {
          ...prev[selectedGroup],
          variables: {
            ...prev[selectedGroup].variables,
            [variableKey]: {
              alias: newVariableAlias || newVariableName,
              defaultValue: ''
            }
          }
        }
      }))
      setNewVariableName('')
      setNewVariableAlias('')
    }
  }

  // 변수 삭제
  const deleteVariable = (groupName, variableKey) => {
    setUserVariables(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        variables: Object.fromEntries(
          Object.entries(prev[groupName].variables).filter(([key]) => key !== variableKey)
        )
      }
    }))
  }

  // 변수 별칭 수정
  const updateVariableAlias = (groupName, variableKey, newAlias) => {
    setUserVariables(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        variables: {
          ...prev[groupName].variables,
          [variableKey]: {
            ...prev[groupName].variables[variableKey],
            alias: newAlias
          }
        }
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        <div className="flex h-full max-h-[90vh]">
          {/* 왼쪽: 그룹 목록 */}
          <div className="w-1/3 bg-gray-50 p-4 border-r overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">변수 그룹</h3>

            {/* 새 그룹 추가 */}
            <div className="mb-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="그룹명 (예: 팔로워 수)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm font-medium mb-2"
                onKeyDown={(e) => e.key === 'Enter' && addGroup()}
              />
              <button
                onClick={addGroup}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                그룹 추가
              </button>
            </div>

            {/* 그룹 목록 */}
            <div className="space-y-2">
              {Object.keys(userVariables).map((groupName) => (
                <div
                  key={groupName}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedGroup === groupName
                      ? 'bg-purple-100 border-purple-500 border-2'
                      : 'bg-white border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedGroup(groupName)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 text-sm">
                      {userVariables[groupName].displayName || groupName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGroup(groupName)
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Object.keys(userVariables[groupName].variables || {}).length}개 변수
                  </span>
                </div>
              ))}
            </div>

            {Object.keys(userVariables).length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                그룹을 추가해주세요
              </div>
            )}
          </div>

          {/* 오른쪽: 변수 관리 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedGroup
                  ? `"${userVariables[selectedGroup]?.displayName || selectedGroup}" 변수 관리`
                  : '변수 관리'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedGroup ? (
              <>
                {/* 새 변수 추가 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">새 변수 추가</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newVariableName}
                      onChange={(e) => setNewVariableName(e.target.value)}
                      placeholder="변수명 (예: small, medium, large)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm"
                    />
                    <input
                      type="text"
                      value={newVariableAlias}
                      onChange={(e) => setNewVariableAlias(e.target.value)}
                      placeholder="별칭 (예: 소규모, 중규모, 대규모)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm"
                    />
                    <button
                      onClick={addVariable}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      변수 추가
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    같은 주제의 여러 변수를 관리할 수 있습니다.
                    변수는 {{그룹명_변수명}} 형태로 사용됩니다.
                  </p>
                </div>

                {/* 변수 목록 */}
                <div className="space-y-3">
                  {Object.entries(userVariables[selectedGroup]?.variables || {}).map(([variableKey, variable]) => (
                    <div key={variableKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded text-purple-600 font-mono">
                              {`{{${variableKey}}}`}
                            </code>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">별칭:</span>
                            <input
                              type="text"
                              value={variable.alias}
                              onChange={(e) => updateVariableAlias(selectedGroup, variableKey, e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-black font-medium"
                              placeholder="별칭 입력"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => deleteVariable(selectedGroup, variableKey)}
                          className="ml-4 text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded border hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(userVariables[selectedGroup]?.variables || {}).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    이 그룹에 변수가 없습니다. 위에서 변수를 추가해보세요.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                왼쪽에서 그룹을 선택하거나 새 그룹을 만들어주세요.
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}