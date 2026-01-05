'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BulkAddInfluencers() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedColumns, setSelectedColumns] = useState(new Set())
  const [tableData, setTableData] = useState([])
  const [columnData, setColumnData] = useState({}) // 각 컬럼별 데이터 저장
  const [parsedData, setParsedData] = useState({ headers: [], rows: [] })
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser) {
      loadFields()
    }
  }, [dbUser])

  const loadFields = async () => {
    try {
      setLoading(true)
      await fetch('/api/influencer-fields/seed', { method: 'POST' })

      const response = await fetch('/api/influencer-fields')
      if (response.ok) {
        const data = await response.json()
        const fieldsData = data.fields
        setFields(fieldsData)

        // 필수 필드 기본 선택
        const requiredFields = fieldsData.filter(field => field.isRequired).map(field => field.key)
        setSelectedColumns(new Set(requiredFields))
      }
    } catch (error) {
      console.error('Error loading fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleColumnToggle = (fieldKey, isRequired) => {
    if (isRequired) return // 필수 필드는 변경 불가

    setSelectedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey)
      } else {
        newSet.add(fieldKey)
      }
      return newSet
    })
  }

  const generateTable = () => {
    const selectedFields = fields.filter(field => selectedColumns.has(field.key))

    // 테이블 헤더 생성
    const headers = selectedFields.map(field => field.label)

    // 샘플 데이터 3행 생성 (사용자가 복사할 수 있도록)
    const sampleRows = Array(3).fill(null).map((_, index) =>
      selectedFields.map(field => {
        switch (field.fieldType) {
          case 'TEXT':
            return field.key === 'accountId' ? `sample_account_${index + 1}`
                 : field.key === 'name' ? `인플루언서 ${index + 1}`
                 : ''
          case 'EMAIL':
            return `sample${index + 1}@example.com`
          case 'NUMBER':
            return field.key === 'followers' ? (1000 + index * 500).toString() : ''
          case 'URL':
            return field.key === 'profileLink' ? `https://instagram.com/sample${index + 1}` : ''
          case 'BOOLEAN':
            return 'false'
          case 'SELECT':
            return field.options && field.options.length > 0 ? field.options[0].value : ''
          case 'CURRENCY':
            return field.key === 'finalAmount' ? `${(index + 1) * 100}만원` : ''
          default:
            return ''
        }
      })
    )

    setTableData({ headers, rows: sampleRows })
  }

  useEffect(() => {
    if (selectedColumns.size > 0 && fields.length > 0) {
      generateTable()
      // 선택된 컬럼이 변경되면 컬럼 데이터 초기화
      const newColumnData = {}
      const selectedFields = fields.filter(field => selectedColumns.has(field.key))
      selectedFields.forEach(field => {
        newColumnData[field.key] = columnData[field.key] || ''
      })
      setColumnData(newColumnData)
    }
  }, [selectedColumns, fields])

  // 컬럼별 데이터 변경 시 전체 데이터 재구성
  useEffect(() => {
    if (Object.keys(columnData).length > 0) {
      buildPreviewData()
    }
  }, [columnData])

  const handleColumnDataChange = (fieldKey, data) => {
    // 원본 데이터를 그대로 저장 (파싱은 parseColumnData에서만 수행)
    setColumnData(prev => ({
      ...prev,
      [fieldKey]: data
    }))
  }

  const parseColumnData = (data) => {
    if (!data.trim()) return []

    // 따옴표로 감싸진 데이터가 있는지 확인
    if (data.includes('"')) {
      try {
        const quotedBlocks = []
        let currentBlock = ''
        let insideQuotes = false
        let i = 0

        while (i < data.length) {
          const char = data[i]

          if (char === '"') {
            if (!insideQuotes) {
              // 따옴표 시작
              insideQuotes = true
              currentBlock = ''
            } else {
              // 다음 문자가 따옴표인지 확인 (이스케이프된 따옴표)
              if (i + 1 < data.length && data[i + 1] === '"') {
                currentBlock += '"'
                i++ // 다음 따옴표도 건너뛰기
              } else {
                // 따옴표 끝
                insideQuotes = false
                if (currentBlock.trim()) {
                  quotedBlocks.push(currentBlock.trim())
                }
                currentBlock = ''
              }
            }
          } else if (insideQuotes) {
            currentBlock += char
          }
          // 따옴표 외부의 문자는 무시 (줄바꿈, 공백 등)

          i++
        }

        // 마지막 블록이 따옴표로 닫히지 않은 경우 처리
        if (currentBlock.trim()) {
          quotedBlocks.push(currentBlock.trim())
        }

        // 따옴표 블록이 있으면 해당 블록들을 반환
        if (quotedBlocks.length > 0) {
          return quotedBlocks
        }
      } catch (error) {
        console.error('Error parsing quoted data:', error)
        // 파싱 실패시 일반적인 줄바꿈 분리로 처리
      }
    }

    // 일반적인 줄바꿈 구분 데이터
    return data.trim().split('\n').map(line => line.trim()).filter(line => line !== '')
  }

  const buildPreviewData = () => {
    const selectedFields = fields.filter(field => selectedColumns.has(field.key))
    if (selectedFields.length === 0) {
      setParsedData({ headers: [], rows: [] })
      return
    }

    const headers = selectedFields.map(field => field.label)
    const maxRowCount = Math.max(
      ...selectedFields.map(field => parseColumnData(columnData[field.key] || '').length),
      0
    )

    if (maxRowCount === 0) {
      setParsedData({ headers, rows: [] })
      return
    }

    const rows = []
    for (let i = 0; i < maxRowCount; i++) {
      const row = selectedFields.map(field => {
        const columnValues = parseColumnData(columnData[field.key] || '')
        return columnValues[i] || ''
      })
      rows.push(row)
    }

    setParsedData({ headers, rows })
  }



  const validateData = (data) => {
    const errors = []
    const warnings = []

    if (!data.headers || data.headers.length === 0) {
      errors.push('헤더가 없습니다.')
      return { isValid: false, errors, warnings }
    }

    if (!data.rows || data.rows.length === 0) {
      errors.push('데이터 행이 없습니다.')
      return { isValid: false, errors, warnings }
    }

    // 필수 필드 확인
    const requiredFields = fields.filter(field => field.isRequired)
    const requiredFieldLabels = requiredFields.map(field => field.label)

    const missingRequired = []
    requiredFieldLabels.forEach(label => {
      if (!data.headers.includes(label)) {
        missingRequired.push(label)
      }
    })

    if (missingRequired.length > 0) {
      errors.push(`필수 필드가 누락되었습니다: ${missingRequired.join(', ')}`)
    }

    // 각 행의 데이터 검증
    data.rows.forEach((row, rowIndex) => {
      if (row.length !== data.headers.length) {
        warnings.push(`${rowIndex + 1}행: 컬럼 수가 맞지 않습니다 (${row.length}/${data.headers.length})`)
      }

      // 필수 필드 값 확인
      data.headers.forEach((header, colIndex) => {
        const field = fields.find(f => f.label === header)
        if (field && field.isRequired && (!row[colIndex] || row[colIndex].trim() === '')) {
          errors.push(`${rowIndex + 1}행: "${header}" 필드는 필수입니다`)
        }

        // 이메일 형식 검증
        if (field && field.fieldType === 'EMAIL' && row[colIndex]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(row[colIndex])) {
            warnings.push(`${rowIndex + 1}행: "${header}" 이메일 형식이 올바르지 않습니다`)
          }
        }

        // 숫자 필드 검증
        if (field && field.fieldType === 'NUMBER' && row[colIndex] && row[colIndex].trim() !== '') {
          const numValue = Number(row[colIndex].replace(/,/g, ''))
          if (isNaN(numValue)) {
            warnings.push(`${rowIndex + 1}행: "${header}" 숫자 형식이 아닙니다`)
          }
        }
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: `총 ${data.rows.length}개 행, ${data.headers.length}개 컬럼`
    }
  }

  const handleBulkImport = async () => {
    if (!parsedData.rows || parsedData.rows.length === 0) {
      alert('가져올 데이터가 없습니다.')
      return
    }

    const validation = validateData(parsedData)

    if (!validation.isValid) {
      alert(`데이터 검증 실패:\n${validation.errors.join('\n')}`)
      return
    }

    if (validation.warnings.length > 0) {
      const proceed = confirm(`경고사항이 있습니다:\n${validation.warnings.join('\n')}\n\n계속 진행하시겠습니까?`)
      if (!proceed) return
    }

    setImporting(true)
    setImportResults(null)

    const successfulImports = []
    const failedImports = []

    try {
      for (let rowIndex = 0; rowIndex < parsedData.rows.length; rowIndex++) {
        const row = parsedData.rows[rowIndex]

        // 행 데이터를 필드별로 매핑
        const fieldData = {}
        let accountId = ''

        parsedData.headers.forEach((header, colIndex) => {
          const field = fields.find(f => f.label === header)
          if (!field) return

          let value = row[colIndex] || ''

          if (field.key === 'accountId') {
            accountId = value
            return
          } else if (field.key === 'email') {
            // 이메일은 고정 필드이므로 fieldData가 아닌 별도 처리
            return
          }

          // 필드 타입별 값 처리
          switch (field.fieldType) {
            case 'NUMBER':
              if (value && value.trim() !== '') {
                const numValue = Number(value.replace(/,/g, ''))
                fieldData[field.key] = isNaN(numValue) ? null : numValue
              }
              break
            case 'BOOLEAN':
              fieldData[field.key] = value === 'true' || value === '1' || value === 'yes' || value === '네'
              break
            case 'EMAIL':
              if (value && value.trim() !== '') {
                fieldData[field.key] = value.trim()
              }
              break
            default:
              if (value && value.trim() !== '') {
                fieldData[field.key] = value.trim()
              }
          }
        })

        // 이메일 값 별도 추출
        const emailHeaderIndex = parsedData.headers.findIndex(h => {
          const field = fields.find(f => f.label === h)
          return field && field.key === 'email'
        })
        const email = emailHeaderIndex >= 0 ? row[emailHeaderIndex] : ''

        if (!accountId) {
          failedImports.push({
            row: rowIndex + 1,
            accountId: '알 수 없음',
            error: '계정 ID가 없습니다'
          })
          continue
        }

        try {
          const response = await fetch('/api/influencers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: dbUser.id,
              accountId,
              email,
              fieldData
            })
          })

          if (response.ok) {
            successfulImports.push(accountId)
          } else {
            const errorData = await response.json()
            failedImports.push({
              row: rowIndex + 1,
              accountId,
              error: errorData.error || '알 수 없는 오류'
            })
          }
        } catch (error) {
          console.error(`Error importing row ${rowIndex + 1}:`, error)
          failedImports.push({
            row: rowIndex + 1,
            accountId,
            error: '네트워크 오류'
          })
        }
      }

      setImportResults({
        successful: successfulImports.length,
        failed: failedImports.length,
        failedItems: failedImports
      })

      if (successfulImports.length > 0) {
        // 성공한 경우 데이터 초기화
        setTimeout(() => {
          setColumnData({})
          setParsedData({ headers: [], rows: [] })
        }, 3000)
      }

    } catch (error) {
      console.error('Bulk import error:', error)
      alert('대량 추가 중 오류가 발생했습니다.')
    } finally {
      setImporting(false)
    }
  }

  const copyTableToClipboard = () => {
    if (!tableData.headers || !tableData.rows) return

    const headerRow = tableData.headers.join('\t')
    const dataRows = tableData.rows.map(row => row.join('\t')).join('\n')
    const fullTable = `${headerRow}\n${dataRows}`

    navigator.clipboard.writeText(fullTable).then(() => {
      alert('표가 클립보드에 복사되었습니다!')
    }).catch(() => {
      alert('복사에 실패했습니다.')
    })
  }

  const downloadTemplate = () => {
    if (!tableData.headers) return

    const headerRow = tableData.headers.join('\t')
    const emptyRows = Array(10).fill(null).map(() =>
      Array(tableData.headers.length).fill('').join('\t')
    ).join('\n')

    const csvContent = `${headerRow}\n${emptyRows}`

    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'influencer_template.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">필드 정보를 불러오는 중...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 대량 추가</h1>
                <p className="text-gray-600">필요한 컬럼을 선택하고 생성된 표를 복사해서 구글 시트나 엑셀에서 사용하세요.</p>
              </div>
              <button
                onClick={() => router.push('/influencer-management')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>

          {/* 컬럼 선택 섹션 */}
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">1. 표에 포함할 컬럼 선택</h3>
              <p className="text-sm text-gray-600 mt-1">필수 컬럼은 기본으로 선택되어 있습니다.</p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {fields.map((field) => (
                  <label
                    key={field.key}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      field.isRequired
                        ? 'bg-purple-50 border-purple-200 cursor-not-allowed'
                        : selectedColumns.has(field.key)
                        ? 'bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100'
                        : 'bg-gray-50 border-gray-200 cursor-pointer hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(field.key)}
                      onChange={() => handleColumnToggle(field.key, field.isRequired)}
                      disabled={field.isRequired}
                      className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ${
                        field.isRequired ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <div className="flex-1">
                      <span className={`text-sm font-medium block ${
                        field.isRequired ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {field.label}
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <span className="text-xs text-gray-500">
                        {field.fieldType.toLowerCase()}
                        {field.isRequired && ' (필수)'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                선택된 컬럼: {selectedColumns.size}개 / 전체 {fields.length}개
              </div>
            </div>
          </div>

          {/* 컬럼별 데이터 입력 섹션 */}
          {selectedColumns.size > 0 && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">2. 컬럼별 데이터 입력</h3>
                <p className="text-sm text-gray-600 mt-1">각 컬럼에 구글 시트나 엑셀에서 복사한 데이터를 붙여넣으세요. 스마트 파싱으로 자동 정리됩니다.</p>
              </div>

              <div className="p-4">
                {/* 사용법 안내 */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-2">💡 스마트 붙여넣기 기능</p>
                      <ul className="space-y-1">
                        <li>• <strong>한 줄씩 입력:</strong> 각 데이터를 새 줄에 입력</li>
                        <li>• <strong>구글 시트 복사:</strong> 해당 컬럼 전체를 복사해서 붙여넣기</li>
                        <li>• <strong>따옴표 자동 제거:</strong> 따옴표로 감싸진 데이터도 자동으로 정리</li>
                        <li>• <strong>실시간 미리보기:</strong> 입력하는 즉시 아래 표에서 확인 가능</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 컬럼 입력 폼들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {fields
                    .filter(field => selectedColumns.has(field.key))
                    .map((field) => {
                      const columnValues = parseColumnData(columnData[field.key] || '')
                      return (
                        <div key={field.key} className="flex flex-col">
                          <div className="mb-2">
                            <label className={`text-sm font-medium block ${
                              field.isRequired ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {field.label}
                              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="text-xs text-gray-500 mt-1">
                              {field.tooltip}
                            </div>
                            <div className="text-xs font-mono text-gray-400 mt-1">
                              {field.fieldType === 'NUMBER' ? '예: 1000' :
                               field.fieldType === 'EMAIL' ? '예: test@example.com' :
                               field.fieldType === 'URL' ? '예: https://...' :
                               field.fieldType === 'BOOLEAN' ? 'true/false' :
                               field.fieldType === 'SELECT' ? `선택값: ${field.options?.map(o => o.value).join(', ') || ''}` :
                               field.fieldType === 'CURRENCY' ? '예: 100만원' :
                               '텍스트'}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col">
                            <textarea
                              value={columnData[field.key] || ''}
                              onChange={(e) => handleColumnDataChange(field.key, e.target.value)}
                              placeholder={`${field.label} 데이터를 입력하세요...&#10;&#10;방법:&#10;• 한 줄씩 입력: 데이터1, 데이터2, 데이터3&#10;• 구글 시트에서 이 컬럼 전체 복사 후 붙여넣기&#10;• 따옴표로 감싸진 데이터도 자동으로 정리됩니다`}
                              rows={8}
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm font-mono resize-none ${
                                field.isRequired
                                  ? 'border-purple-300 focus:ring-purple-500 bg-purple-50'
                                  : 'border-gray-300 focus:ring-blue-500'
                              }`}
                            />

                            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                              <span>{columnValues.length}개 항목</span>
                              {columnData[field.key] && (
                                <button
                                  onClick={() => handleColumnDataChange(field.key, '')}
                                  className="text-red-600 hover:text-red-700 font-medium"
                                >
                                  초기화
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* 전체 데이터 상태 표시 */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <strong>전체 데이터 상태:</strong> {parsedData.rows ? parsedData.rows.length : 0}행, {fields.filter(field => selectedColumns.has(field.key)).length}개 컬럼
                    </div>
                    <button
                      onClick={() => {
                        const confirmClear = confirm('모든 입력된 데이터를 초기화하시겠습니까?')
                        if (confirmClear) {
                          setColumnData({})
                          setParsedData({ headers: [], rows: [] })
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      전체 초기화
                    </button>
                  </div>

                  {parsedData.rows && parsedData.rows.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {fields
                        .filter(field => selectedColumns.has(field.key))
                        .map((field) => {
                          const columnValues = parseColumnData(columnData[field.key] || '')
                          const maxRows = Math.max(...fields.filter(f => selectedColumns.has(f.key)).map(f => parseColumnData(columnData[f.key] || '').length))
                          const hasData = columnValues.length > 0
                          const isIncomplete = columnValues.length < maxRows && hasData

                          return (
                            <div
                              key={field.key}
                              className={`text-xs px-2 py-1 rounded-full text-center ${
                                !hasData
                                  ? 'bg-gray-100 text-gray-600'
                                  : isIncomplete
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : field.isRequired
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {field.label}: {columnValues.length}
                              {isIncomplete && ' (부족)'}
                              {!hasData && ' (없음)'}
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 데이터 미리보기 및 검증 섹션 */}
          {parsedData.rows && parsedData.rows.length > 0 && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">3. 데이터 미리보기 및 검증</h3>
                    <p className="text-sm text-gray-600 mt-1">{validateData(parsedData).summary}</p>
                  </div>
                  <button
                    onClick={handleBulkImport}
                    disabled={importing || !validateData(parsedData).isValid}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      importing || !validateData(parsedData).isValid
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {importing ? '추가 중...' : `${parsedData.rows.length}개 인플루언서 추가`}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* 검증 결과 */}
                {(() => {
                  const validation = validateData(parsedData)
                  return (
                    <>
                      {validation.errors.length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm font-medium text-red-900 mb-2">❌ 오류사항:</div>
                          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                            {validation.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm font-medium text-yellow-900 mb-2">⚠️ 경고사항:</div>
                          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                            {validation.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.isValid && validation.warnings.length === 0 && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-green-700">✅ 모든 데이터가 유효합니다.</div>
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* 데이터 테이블 미리보기 */}
                <div className="overflow-auto border border-gray-200 rounded-lg max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          #
                        </th>
                        {parsedData.headers.map((header, index) => {
                          const field = fields.find(f => f.label === header)
                          return (
                            <th
                              key={index}
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-48 ${
                                field
                                  ? field.isRequired
                                    ? 'text-green-700 bg-green-50'
                                    : 'text-gray-500'
                                  : 'text-red-700 bg-red-50'
                              }`}
                            >
                              {header}
                              {field && field.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.rows.slice(0, 10).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500 border-r border-gray-200 font-mono align-top">
                            {rowIndex + 1}
                          </td>
                          {row.map((cell, cellIndex) => {
                            const header = parsedData.headers[cellIndex]
                            const field = fields.find(f => f.label === header)
                            const isEmpty = !cell || cell.trim() === ''
                            const isRequiredEmpty = field && field.isRequired && isEmpty

                            return (
                              <td
                                key={cellIndex}
                                className={`px-4 py-3 text-sm border-r border-gray-200 last:border-r-0 align-top max-w-xs ${
                                  isRequiredEmpty
                                    ? 'bg-red-50 text-red-900'
                                    : isEmpty
                                    ? 'text-gray-400'
                                    : 'text-gray-900'
                                }`}
                              >
                                {isEmpty ? (
                                  <span className="text-gray-400">-</span>
                                ) : (
                                  <div className="whitespace-pre-wrap break-words">
                                    {cell.length > 100 ? (
                                      <>
                                        <div className="mb-2">
                                          {cell.substring(0, 100)}...
                                        </div>
                                        <details className="cursor-pointer">
                                          <summary className="text-blue-600 hover:text-blue-800 text-xs">
                                            전체 보기 ({cell.length}자)
                                          </summary>
                                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                            {cell}
                                          </div>
                                        </details>
                                      </>
                                    ) : (
                                      cell
                                    )}
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 10 && (
                    <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 border-t">
                      ... 외 {parsedData.rows.length - 10}개 행 더 있음
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 추가 결과 섹션 */}
          {importResults && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">4. 추가 결과</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">{importResults.successful}</div>
                    <div className="text-sm text-green-700">성공</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-900">{importResults.failed}</div>
                    <div className="text-sm text-red-700">실패</div>
                  </div>
                </div>

                {importResults.failedItems && importResults.failedItems.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">실패한 항목:</h4>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">행</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">계정 ID</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">오류 내용</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {importResults.failedItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-gray-900">{item.row}</td>
                              <td className="px-3 py-2 text-gray-900">{item.accountId}</td>
                              <td className="px-3 py-2 text-red-700">{item.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => router.push('/influencer-management')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    인플루언서 목록 보기
                  </button>
                  <button
                    onClick={() => {
                      setImportResults(null)
                      setColumnData({})
                      setParsedData({ headers: [], rows: [] })
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    새로 추가하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 템플릿 생성 섹션 (기존) */}
          {(!parsedData.rows || parsedData.rows.length === 0) && (
            <>
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <span className="w-16 h-px bg-gray-300"></span>
                  <span className="text-sm">템플릿 다운로드</span>
                  <span className="w-16 h-px bg-gray-300"></span>
                </div>
              </div>

              {/* 템플릿 다운로드 섹션 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">템플릿 다운로드</h3>
                  <p className="text-sm text-gray-600 mt-1">선택된 컬럼으로 템플릿을 다운로드하세요.</p>
                </div>

                <div className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={downloadTemplate}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      템플릿 다운로드
                    </button>
                    <button
                      onClick={copyTableToClipboard}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      헤더 복사하기
                    </button>
                  </div>

                  {tableData.headers && tableData.headers.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">생성될 헤더:</div>
                      <div className="flex flex-wrap gap-2">
                        {tableData.headers.map((header, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx global>{`
        .user-select-text {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
      `}</style>
    </div>
  )
}