'use client'

import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense, useRef } from 'react'
import { nanoid } from 'nanoid'
import { RichTextEditor } from '@/components/TemplateEditor'
import { ConditionsModal, UserVariableModal } from '@/components/EmailTemplateComponents'

function SurveyInfluencerConnectContent() {
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  const [template, setTemplate] = useState(null)
  const [influencers, setInfluencers] = useState([])
  const [influencersWithEmailHistory, setInfluencersWithEmailHistory] = useState([]) // 메일 발송 기록이 있는 인플루언서들
  const [connectedInfluencers, setConnectedInfluencers] = useState([])
  const [selectedInfluencers, setSelectedInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatedLinks, setGeneratedLinks] = useState({}) // Store generated links for each connection
  const [influencerResponses, setInfluencerResponses] = useState({}) // Track which influencers have responded
  const [actualSurveyTemplateId, setActualSurveyTemplateId] = useState(null) // 실제 사용할 캠페인 템플릿 ID
  const [showEmailForm, setShowEmailForm] = useState(false) // 캠페인 메일 생성 폼 표시 여부
  const [createdEmailTemplate, setCreatedEmailTemplate] = useState(null) // 생성된 메일 템플릿

  // 캠페인 메일 폼 관련 상태
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    content: ''
  })
  const [sendingEmails, setSendingEmails] = useState(false)
  const [influencerFields, setInfluencerFields] = useState([])
  const [variableInputs, setVariableInputs] = useState({})
  const [activeField, setActiveField] = useState(null) // 'subject' or 'content'
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [showUserVariableModal, setShowUserVariableModal] = useState(false)
  const [editingConditionVariable, setEditingConditionVariable] = useState(null)

  // useRef for variable insertion functions
  const contentInsertFnRef = useRef(null)
  const [conditionalRules, setConditionalRules] = useState({})
  const [userVariables, setUserVariables] = useState({})

  // 필터링 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredInfluencers, setFilteredInfluencers] = useState([])

  // 네비게이션 탭 상태
  const [activeTab, setActiveTab] = useState('campaign') // 'mail' 또는 'campaign'

  // 메일 탭 클릭 핸들러
  const handleMailTabClick = () => {
    router.push(`/influencer-connect?templateId=${templateId}`)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (dbUser && templateId) {
      loadData()
    } else if (dbUser && !templateId) {
      router.push('/survey-templates')
    }
  }, [dbUser, templateId, router])

  // 인플루언서 필드들 로드
  useEffect(() => {
    if (dbUser && showEmailForm) {
      loadInfluencerFields()
    }
  }, [dbUser, showEmailForm])

  // 필터링 로직
  useEffect(() => {
    // 캠페인 페이지에서는 메일 발송 기록이 있는 인플루언서들만 표시
    let filtered = [...influencersWithEmailHistory]

    if (searchTerm) {
      filtered = filtered.filter(influencer => {
        const term = searchTerm.toLowerCase()
        return (
          influencer.accountId?.toLowerCase().includes(term) ||
          influencer.email?.toLowerCase().includes(term) ||
          influencer.fieldData?.name?.toLowerCase().includes(term)
        )
      })
    }

    setFilteredInfluencers(filtered)
  }, [searchTerm, influencersWithEmailHistory])

  const loadData = async () => {
    try {
      setLoading(true)

      // templateId가 메일 템플릿 ID인 경우, 연결된 캠페인 템플릿을 찾아야 함
      // 먼저 메일 템플릿을 조회해서 연결된 캠페인 템플릿 ID를 가져옴
      const emailTemplateResponse = await fetch(`/api/email-templates?userId=${dbUser.id}`)
      let surveyTemplateId = templateId // 기본적으로는 templateId를 그대로 사용

      if (emailTemplateResponse.ok) {
        const emailData = await emailTemplateResponse.json()
        const emailTemplate = emailData.templates?.find(t => t.id === parseInt(templateId))
        if (emailTemplate && emailTemplate.surveyTemplateId) {
          surveyTemplateId = emailTemplate.surveyTemplateId
        }
      }

      // 실제 사용할 캠페인 템플릿 ID를 상태에 저장
      setActualSurveyTemplateId(surveyTemplateId)

      // 템플릿 정보, 인플루언서 목록, 메일 발송 기록이 있는 인플루언서 목록을 병렬로 로드
      const [templateResponse, influencersResponse, emailHistoryResponse] = await Promise.all([
        fetch(`/api/survey-templates/${surveyTemplateId}?userId=${dbUser.id}`),
        fetch(`/api/influencers?userId=${dbUser.id}`),
        fetch(`/api/influencers/email-history?userId=${dbUser.id}`)
      ])

      if (templateResponse.ok) {
        const templateData = await templateResponse.json()
        setTemplate(templateData.template)
      } else {
        alert('연결된 캠페인 템플릿을 찾을 수 없습니다. 먼저 메일 템플릿에서 캠페인을 연결해주세요.')
        router.push('/email-templates')
        return
      }

      let influencersList = []
      if (influencersResponse.ok) {
        const influencersData = await influencersResponse.json()
        influencersList = influencersData.influencers || []
        setInfluencers(influencersList)
      }

      // 메일 발송 기록이 있는 인플루언서 목록 처리
      if (emailHistoryResponse.ok) {
        const emailHistoryData = await emailHistoryResponse.json()
        setInfluencersWithEmailHistory(emailHistoryData.influencers || [])
      }

      // 연결된 인플루언서 목록 로드
      const connectionsResponse = await fetch(`/api/survey-template-connections?templateId=${surveyTemplateId}&userId=${dbUser.id}`)
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json()
        const connections = connectionsData.connections || []

        // 인플루언서 정보와 함께 연결 데이터 구성
        const connectionsWithInfluencers = connections.map(conn => {
          const influencer = influencersList.find(inf => inf.id === conn.influencerId)
          return {
            ...conn,
            influencer: influencer || { id: conn.influencerId, accountId: 'Unknown', fieldData: { name: 'Unknown' } }
          }
        })

        setConnectedInfluencers(connectionsWithInfluencers)

        // 생성된 링크들을 상태에 설정
        const savedLinks = {}
        connections.forEach(conn => {
          if (conn.link && conn.linkRef) {
            savedLinks[conn.influencerId] = {
              link: conn.link,
              ref: conn.linkRef
            }
          }
        })
        setGeneratedLinks(savedLinks)
      }

      // 각 인플루언서의 응답 여부 확인
      try {
        const responsesResponse = await fetch(`/api/survey-responses/${actualSurveyTemplateId || templateId}?userId=${dbUser.id}`)
        if (responsesResponse.ok) {
          const responsesData = await responsesResponse.json()
          const responseMap = {}

          // 응답한 인플루언서 ID 목록 만들기
          Object.values(responsesData.responsesByInfluencer || {}).forEach(data => {
            if (data.influencer) {
              responseMap[data.influencer.id] = true
            }
          })

          setInfluencerResponses(responseMap)
        }
      } catch (error) {
        console.error('Error loading responses:', error)
      }

      // 이 survey 템플릿과 연결된 캠페인 메일 템플릿 찾기
      try {
        const campaignEmailResponse = await fetch(`/api/email-templates?userId=${dbUser.id}`)
        if (campaignEmailResponse.ok) {
          const campaignEmailData = await campaignEmailResponse.json()
          // surveyTemplateId가 현재 템플릿 ID와 일치하는 캠페인 템플릿 찾기
          const campaignTemplate = campaignEmailData.templates?.find(t =>
            t.surveyTemplateId === surveyTemplateId.toString() &&
            t.name.startsWith('Campaign: ')
          )
          if (campaignTemplate) {
            setCreatedEmailTemplate(campaignTemplate)
          }
        }
      } catch (error) {
        console.error('Error loading campaign email template:', error)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      alert('데이터 로딩 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInfluencerToggle = (influencer) => {
    const isSelected = selectedInfluencers.find(sel => sel.id === influencer.id)
    if (isSelected) {
      setSelectedInfluencers(selectedInfluencers.filter(sel => sel.id !== influencer.id))
    } else {
      setSelectedInfluencers([...selectedInfluencers, influencer])
    }
  }

  const handleSelectAll = () => {
    const unconnectedInfluencers = filteredInfluencers.filter(influencer => !isConnected(influencer))

    if (selectedInfluencers.length === unconnectedInfluencers.length) {
      setSelectedInfluencers([])
    } else {
      setSelectedInfluencers([...unconnectedInfluencers])
    }
  }

  const isConnected = useCallback((influencer) => {
    return connectedInfluencers.some(conn => conn.influencerId === influencer.id)
  }, [connectedInfluencers])

  const isSelected = useCallback((influencer) => {
    return selectedInfluencers.some(sel => sel.id === influencer.id)
  }, [selectedInfluencers])

  const generateInfluencerLink = (influencer) => {
    // 인플루언서별 고유 링크 생성 (랜덤 문자열 사용)
    const randomString = nanoid(12) // 12자리 랜덤 문자열
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${baseUrl}/survey/${actualSurveyTemplateId || templateId}?ref=${randomString}&influencer=${influencer.id}`
    return { link, ref: randomString }
  }

  const handleGenerateLink = (influencer) => {
    const { link, ref } = generateInfluencerLink(influencer)
    setGeneratedLinks(prev => ({
      ...prev,
      [influencer.id]: { link, ref }
    }))
  }

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      alert('링크가 클립보드에 복사되었습니다!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  const handleSaveConnections = async () => {
    if (selectedInfluencers.length === 0) {
      alert('연결할 인플루언서를 선택해주세요.')
      return
    }

    setSaving(true)
    try {
      // 각 인플루언서에 대해 연결 생성
      const promises = selectedInfluencers.map(influencer => {
        const { link, ref } = generateInfluencerLink(influencer)
        return fetch('/api/survey-template-connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateId: actualSurveyTemplateId || templateId,
            influencerId: influencer.id,
            userId: dbUser.id,
            linkRef: ref,
            link
          })
        })
      })

      const results = await Promise.allSettled(promises)
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok)
      const failed = results.filter(result => result.status === 'rejected' || !result.value.ok)

      if (successful.length > 0) {
        // 성공한 연결들의 데이터 가져오기
        const connectionData = await Promise.all(
          successful.map(result => result.value.json())
        )

        // 연결된 인플루언서 목록에 추가
        const newConnections = connectionData.map((data, index) => ({
          ...data.connection,
          influencer: selectedInfluencers.find(inf => inf.id === data.connection.influencerId)
        }))

        setConnectedInfluencers([...connectedInfluencers, ...newConnections])

        // 생성된 링크들을 상태에 저장
        const newLinks = {}
        newConnections.forEach(conn => {
          newLinks[conn.influencerId] = {
            link: conn.link,
            ref: conn.linkRef
          }
        })
        setGeneratedLinks(prev => ({ ...prev, ...newLinks }))

        // 선택 목록에서 성공한 인플루언서들 제거
        const successfulIds = newConnections.map(conn => conn.influencerId)
        setSelectedInfluencers(selectedInfluencers.filter(inf => !successfulIds.includes(inf.id)))
      }

      if (failed.length > 0) {
        alert(`${successful.length}명 연결 성공, ${failed.length}명 연결 실패 (이미 연결된 인플루언서 포함)`)
      } else {
        alert(`${successful.length}명의 인플루언서가 성공적으로 연결되었습니다.`)
      }
    } catch (error) {
      console.error('Error saving connections:', error)
      alert('연결 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async (influencer) => {
    try {
      const response = await fetch(`/api/survey-template-connections?templateId=${actualSurveyTemplateId || templateId}&influencerId=${influencer.id}&userId=${dbUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConnectedInfluencers(connectedInfluencers.filter(conn => conn.influencerId !== influencer.id))

        // 생성된 링크도 제거
        setGeneratedLinks(prev => {
          const newLinks = { ...prev }
          delete newLinks[influencer.id]
          return newLinks
        })

        alert('인플루언서 연결이 성공적으로 해제되었습니다.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '연결 해제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error disconnecting influencer:', error)
      alert('연결 해제 중 오류가 발생했습니다.')
    }
  }

  // 인플루언서 필드들 로드
  const loadInfluencerFields = async () => {
    try {
      const response = await fetch('/api/influencer-fields')
      if (response.ok) {
        const data = await response.json()
        setInfluencerFields(data.fields || [])
      }
    } catch (error) {
      console.error('Error loading influencer fields:', error)
    }
  }

  // 메일 템플릿 생성
  const handleCreateEmailTemplate = async () => {
    if (!emailFormData.subject.trim() || !emailFormData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    setSendingEmails(true)

    try {
      // 메일 템플릿 생성
      const templateResponse = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: dbUser.id,
          name: `Campaign: ${template?.title || 'Untitled'}`,
          subject: emailFormData.subject,
          content: emailFormData.content,
          userVariables,
          conditionalRules,
          surveyTemplateId: actualSurveyTemplateId || templateId  // survey 템플릿과 연결
        })
      })

      if (templateResponse.ok) {
        const templateData = await templateResponse.json()
        setCreatedEmailTemplate(templateData.template)
        alert('메일 템플릿이 성공적으로 생성되었습니다!')

        // 폼 초기화
        setEmailFormData({ subject: '', content: '' })
        setShowEmailForm(false)
      } else {
        const errorData = await templateResponse.json()
        alert(errorData.error || '메일 템플릿 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error creating email template:', error)
      alert('메일 템플릿 생성 중 오류가 발생했습니다.')
    } finally {
      setSendingEmails(false)
    }
  }

  // 생성된 템플릿으로 메일 발송
  const handleSendEmailsWithTemplate = async () => {
    if (!createdEmailTemplate) {
      alert('생성된 메일 템플릿이 없습니다.')
      return
    }

    if (connectedInfluencers.length === 0) {
      alert('연결된 인플루언서가 없습니다.')
      return
    }

    if (!confirm(`${connectedInfluencers.length}명의 인플루언서에게 생성된 템플릿으로 메일을 전송하시겠습니까?`)) {
      return
    }

    setSendingEmails(true)

    try {
      // 연결된 인플루언서들에게 메일 전송
      const emailPromises = connectedInfluencers.map(async (connection) => {
        if (!connection.influencer?.email) {
          return { success: false, influencer: connection.influencer, error: '이메일 주소 없음' }
        }

        try {
          // 각 인플루언서별 고유 캠페인 폼 링크 생성
          const linkData = generatedLinks[connection.influencer.id]
          let campaignFormLink = ''

          if (linkData && linkData.link) {
            // 이미 생성된 링크가 있으면 사용
            campaignFormLink = linkData.link
          } else {
            // 새 링크 생성
            const { link, ref } = generateInfluencerLink(connection.influencer)
            campaignFormLink = link

            // 생성된 링크를 상태에 저장
            setGeneratedLinks(prev => ({
              ...prev,
              [connection.influencer.id]: { link, ref }
            }))
          }

          const response = await fetch('/api/emails/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              templateId: createdEmailTemplate.id,
              influencerId: connection.influencer.id,
              userId: dbUser.id,
              userVariables,
              senderName: dbUser.senderName || dbUser.email,
              campaignFormLink: campaignFormLink  // 캠페인 폼 링크를 별도 필드로 전달
            })
          })

          if (response.ok) {
            return { success: true, influencer: connection.influencer }
          } else {
            const errorData = await response.json()
            return { success: false, influencer: connection.influencer, error: errorData.error }
          }
        } catch (error) {
          return { success: false, influencer: connection.influencer, error: error.message }
        }
      })

      const results = await Promise.all(emailPromises)
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (failed.length === 0) {
        alert(`모든 메일이 성공적으로 전송되었습니다! (${successful.length}명)`)
      } else {
        alert(`${successful.length}명에게 성공, ${failed.length}명에게 실패했습니다.`)
        console.log('Failed emails:', failed)
      }

    } catch (error) {
      console.error('Error sending emails with template:', error)
      alert('메일 전송 중 오류가 발생했습니다.')
    } finally {
      setSendingEmails(false)
    }
  }

  // 캠페인 메일 전송
  const handleSendCampaignEmails = async () => {
    if (!emailFormData.subject.trim() || !emailFormData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    if (connectedInfluencers.length === 0) {
      alert('연결된 인플루언서가 없습니다.')
      return
    }

    if (!confirm(`${connectedInfluencers.length}명의 인플루언서에게 캠페인 메일을 전송하시겠습니까?`)) {
      return
    }

    setSendingEmails(true)

    try {
      // 먼저 임시 이메일 템플릿을 생성
      const campaignTemplateResponse = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: dbUser.id,
          name: `Campaign: ${template?.title || 'Untitled'}`,
          subject: emailFormData.subject,
          content: emailFormData.content,
          userVariables,
          conditionalRules
        })
      })

      let templateId
      if (campaignTemplateResponse.ok) {
        const templateData = await campaignTemplateResponse.json()
        templateId = templateData.template.id
      } else {
        alert('캠페인 템플릿 생성에 실패했습니다.')
        return
      }

      // 연결된 인플루언서들에게 메일 전송
      const emailPromises = connectedInfluencers.map(async (connection) => {
        if (!connection.influencer?.email) {
          return { success: false, influencer: connection.influencer, error: '이메일 주소 없음' }
        }

        try {
          // 각 인플루언서별 고유 캠페인 폼 링크 생성
          const linkData = generatedLinks[connection.influencer.id]
          let campaignFormLink = ''

          if (linkData && linkData.link) {
            // 이미 생성된 링크가 있으면 사용
            campaignFormLink = linkData.link
          } else {
            // 새 링크 생성
            const { link, ref } = generateInfluencerLink(connection.influencer)
            campaignFormLink = link

            // 생성된 링크를 상태에 저장
            setGeneratedLinks(prev => ({
              ...prev,
              [connection.influencer.id]: { link, ref }
            }))
          }

          const response = await fetch('/api/emails/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              templateId: templateId,
              influencerId: connection.influencer.id,
              userId: dbUser.id,
              userVariables,
              senderName: dbUser.senderName || dbUser.email,
              campaignFormLink: campaignFormLink  // 캠페인 폼 링크를 별도 필드로 전달
            })
          })

          if (response.ok) {
            return { success: true, influencer: connection.influencer }
          } else {
            const errorData = await response.json()
            return { success: false, influencer: connection.influencer, error: errorData.error }
          }
        } catch (error) {
          return { success: false, influencer: connection.influencer, error: error.message }
        }
      })

      const results = await Promise.all(emailPromises)
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (failed.length === 0) {
        alert(`모든 메일이 성공적으로 전송되었습니다! (${successful.length}명)`)
      } else {
        alert(`${successful.length}명에게 성공, ${failed.length}명에게 실패했습니다.`)
        console.log('Failed emails:', failed)
      }

      // 폼 초기화
      setEmailFormData({ subject: '', content: '' })
      setShowEmailForm(false)

    } catch (error) {
      console.error('Error sending campaign emails:', error)
      alert('메일 전송 중 오류가 발생했습니다.')
    } finally {
      setSendingEmails(false)
    }
  }

  // 변수 삽입 핸들러
  const handleVariableInsert = useCallback((variable) => {
    const targetField = activeField || 'content' // 기본값: content 필드

    if (targetField === 'subject') {
      // 제목 필드에 변수 삽입
      setEmailFormData(prev => ({
        ...prev,
        subject: prev.subject + `{{${variable}}}`
      }))
    } else if (targetField === 'content' && contentInsertFnRef.current) {
      contentInsertFnRef.current(variable)
    }
  }, [activeField])

  // 조건문 모달 열기
  const openConditionsModal = useCallback((fieldName) => {
    setEditingConditionVariable(fieldName)
    setShowConditionsModal(true)
  }, [])

  // 변수 치환 함수 (미리보기용)
  const replaceVariables = useCallback((text) => {
    if (!text) return text

    let result = text

    // 일반 텍스트인 경우 줄바꿈을 <br>로 변환
    const hasHtmlTags = /<[^>]+>/g.test(text)
    if (!hasHtmlTags) {
      result = result.replace(/\n/g, '<br>')
    }

    // 사용자 변수들의 기본값
    const userSampleData = {}
    Object.entries(userVariables).forEach(([_, group]) => {
      Object.entries(group.variables || {}).forEach(([variableKey, variable]) => {
        userSampleData[variableKey] = variable.defaultValue || `샘플 ${variable.alias || variableKey}`
      })
    })

    // 인플루언서 필드들의 샘플 데이터 생성
    const influencerSampleData = {}
    influencerFields.forEach(field => {
      switch (field.fieldType) {
        case 'TEXT':
        case 'LONG_TEXT':
          if (field.key === 'name') influencerSampleData[field.key] = '김인플루'
          else if (field.key === 'accountId') influencerSampleData[field.key] = '@sample_influencer'
          else influencerSampleData[field.key] = `샘플 ${field.label}`
          break
        case 'NUMBER':
          if (field.key === 'followers') influencerSampleData[field.key] = '10000'
          else influencerSampleData[field.key] = '100'
          break
      }
    })

    // 캠페인 폼 링크 샘플 데이터 추가
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    influencerSampleData['campaignFormLink'] = `${baseUrl}/survey/${actualSurveyTemplateId || templateId}?ref=sample123&influencer=sample`

    // 모든 샘플 데이터 병합
    const allSampleData = { ...userSampleData, ...influencerSampleData }

    // {{변수명}} 형태의 변수들을 치환
    Object.keys(allSampleData).forEach(key => {
      const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      const valueToUse = variableInputs[key] !== undefined ? variableInputs[key] : allSampleData[key]
      const styledValue = `<span style="color: #7c3aed; font-weight: 600; text-decoration: underline;">${valueToUse || `{{${key}}}`}</span>`
      result = result.replace(variablePattern, styledValue)
    })

    return result
  }, [userVariables, influencerFields, variableInputs])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    )
  }

  if (!user || !template) {
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
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push('/survey-templates')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-4 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  캠페인 템플릿으로 돌아가기
                </button>

                {/* 네비게이션 탭 */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={handleMailTabClick}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'mail'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      메일
                    </button>
                    <button
                      onClick={() => setActiveTab('campaign')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'campaign'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      캠페인
                    </button>
                  </nav>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">인플루언서 연결</h1>
                <p className="text-gray-600">캠페인 "{template.title}"에 인플루언서를 연결하고 개별 링크를 생성하세요.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* 생성된 메일 템플릿 표시 */}
            {createdEmailTemplate && (
              <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200">
                <div className="p-6 border-b border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-purple-700">생성된 캠페인 메일 템플릿</h2>
                      <p className="text-sm text-purple-600 mt-1">
                        방금 생성한 메일 템플릿입니다. 이 템플릿을 사용해 연결된 인플루언서에게 메일을 발송할 수 있습니다.
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSendEmailsWithTemplate()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
                        disabled={connectedInfluencers.length === 0}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>메일 발송</span>
                      </button>
                      <button
                        onClick={() => setCreatedEmailTemplate(null)}
                        className="text-purple-600 hover:text-purple-800 px-3 py-2 text-sm font-medium"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 제목 표시 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        메일 제목
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <div
                          className="text-gray-900 font-medium"
                          dangerouslySetInnerHTML={{ __html: replaceVariables(createdEmailTemplate.subject) }}
                        />
                      </div>
                    </div>

                    {/* 내용 표시 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        메일 내용 (미리보기)
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-purple-200 max-h-48 overflow-y-auto">
                        <div
                          className="text-gray-900 text-sm"
                          style={{ whiteSpace: 'pre-wrap' }}
                          dangerouslySetInnerHTML={{ __html: replaceVariables(createdEmailTemplate.content) }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <div className="flex items-center text-sm text-purple-700">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">템플릿 ID: {createdEmailTemplate.id}</span>
                      <span className="mx-2">•</span>
                      <span>생성일시: {new Date(createdEmailTemplate.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 연결된 인플루언서 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-green-700">연결된 인플루언서</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      현재 캠페인에 연결된 인플루언서들과 개별 링크입니다. ({connectedInfluencers.length}명)
                    </p>
                  </div>
                  {connectedInfluencers.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowEmailForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>캠페인 메일 생성</span>
                      </button>
                      <button
                        onClick={() => router.push(`/survey-responses/${actualSurveyTemplateId || templateId}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>모든 응답 보기</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {connectedInfluencers.length > 0 ? (
                  <div className="space-y-4">
                    {connectedInfluencers.map((connection) => {
                      const linkData = generatedLinks[connection.influencer.id]
                      return (
                        <div
                          key={connection.id}
                          className="border border-green-200 bg-green-50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-medium text-sm">
                                  {(connection.influencer.fieldData?.name || connection.influencer.accountId || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {connection.influencer.fieldData?.name || '이름 없음'}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  @{connection.influencer.accountId}
                                </p>
                                {connection.influencer.email && (
                                  <p className="text-xs text-purple-600 font-medium truncate">
                                    📧 {connection.influencer.email}
                                  </p>
                                )}
                                {connection.influencer.fieldData?.followers && (
                                  <p className="text-xs text-gray-400">
                                    팔로워: {connection.influencer.fieldData.followers.toLocaleString()}명
                                  </p>
                                )}
                                {/* 응답 여부 표시 */}
                                <div className="mt-2">
                                  {influencerResponses[connection.influencer.id] ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      응답 완료
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                      응답 대기
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDisconnect(connection.influencer)}
                                disabled={saving}
                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                해제
                              </button>
                            </div>
                          </div>

                          {/* 개별 링크 섹션 */}
                          <div className="border-t border-green-200 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">개별 캠페인 링크</span>
                              {!linkData && (
                                <button
                                  onClick={() => handleGenerateLink(connection.influencer)}
                                  className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  링크 생성
                                </button>
                              )}
                            </div>

                            {linkData ? (
                              <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">생성된 링크:</span>
                                  <button
                                    onClick={() => handleCopyLink(linkData.link)}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center space-x-1 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>복사</span>
                                  </button>
                                </div>
                                <div className="text-xs font-mono bg-gray-50 p-2 rounded text-gray-700 break-all">
                                  {linkData.link}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  참조 ID: {linkData.ref}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white p-3 rounded-lg border text-center">
                                <p className="text-xs text-gray-500">링크를 생성하려면 위의 "링크 생성" 버튼을 클릭하세요.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">아직 연결된 인플루언서가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 검색 필터 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">인플루언서 검색</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="이름, 계정 ID, 이메일로 검색..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* 전체 인플루언서 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">메일 발송 기록이 있는 인플루언서</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      이전에 메일을 발송한 적이 있는 인플루언서들입니다. 체크박스로 여러 인플루언서를 선택한 후 캠페인에 연결하세요. ({selectedInfluencers.length}명 선택됨)
                      <br />
                      <span className="text-blue-600 text-xs">
                        총 {influencersWithEmailHistory.length}명의 인플루언서에게 메일 발송 기록이 있습니다.
                      </span>
                      {searchTerm && (
                        <span className="ml-2 text-purple-600">
                          - 필터링됨: {filteredInfluencers.filter(inf => !isConnected(inf)).length}명 표시 중
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const unconnectedInfluencers = filteredInfluencers.filter(influencer => !isConnected(influencer))
                      const isAllSelected = unconnectedInfluencers.length > 0 && selectedInfluencers.length === unconnectedInfluencers.length

                      return unconnectedInfluencers.length > 0 && (
                        <button
                          onClick={handleSelectAll}
                          className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          {isAllSelected ? '전체 해제' : '전체 선택'}
                        </button>
                      )
                    })()}
                    {selectedInfluencers.length > 0 && (
                      <button
                        onClick={handleSaveConnections}
                        disabled={saving}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        {saving ? '연결 중...' : `${selectedInfluencers.length}명 연결하기`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {(() => {
                  const unconnectedInfluencers = filteredInfluencers.filter(influencer => !isConnected(influencer))

                  return unconnectedInfluencers.length > 0 ? (
                    <div className="space-y-3">
                      {unconnectedInfluencers.map((influencer) => {
                        const selected = isSelected(influencer)

                        return (
                          <div
                            key={influencer.id}
                            onClick={() => handleInfluencerToggle(influencer)}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              selected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {/* 체크박스 */}
                              <div className="flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 pointer-events-none"
                                />
                              </div>

                              {/* 아바타 */}
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 font-medium text-sm">
                                    {(influencer.fieldData?.name || influencer.accountId || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* 정보 */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {influencer.fieldData?.name || '이름 없음'}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  @{influencer.accountId}
                                </p>
                                {influencer.email && (
                                  <p className="text-xs text-purple-600 font-medium truncate">
                                    📧 {influencer.email}
                                  </p>
                                )}
                                {influencer.fieldData?.followers && (
                                  <p className="text-xs text-gray-400">
                                    팔로워: {influencer.fieldData.followers.toLocaleString()}명
                                  </p>
                                )}
                                {/* 메일 발송 통계 표시 */}
                                {influencer.emailStats && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                                    <p className="text-xs text-blue-600 font-medium">
                                      📧 메일 발송: {influencer.emailStats.totalSent}회
                                    </p>
                                    {influencer.emailStats.lastSentAt && (
                                      <p className="text-xs text-gray-500">
                                        마지막 발송: {new Date(influencer.emailStats.lastSentAt).toLocaleDateString('ko-KR')}
                                      </p>
                                    )}
                                    {influencer.emailStats.templatesUsed.length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        사용 템플릿: {influencer.emailStats.templatesUsed.slice(0, 2).join(', ')}
                                        {influencer.emailStats.templatesUsed.length > 2 && ` 외 ${influencer.emailStats.templatesUsed.length - 2}개`}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {influencer.fieldData?.categories && Array.isArray(influencer.fieldData.categories) && influencer.fieldData.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {influencer.fieldData.categories.slice(0, 3).map((category, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {category}
                                      </span>
                                    ))}
                                    {influencer.fieldData.categories.length > 3 && (
                                      <span className="text-xs text-gray-400">
                                        +{influencer.fieldData.categories.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">연결 가능한 인플루언서가 없습니다</h3>
                      <p className="text-gray-600 mb-6">
                        모든 인플루언서가 이미 연결되었거나 아직 인플루언서를 추가하지 않았습니다.
                      </p>
                      <button
                        onClick={() => router.push('/influencer-management')}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        인플루언서 관리로 이동
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 캠페인 메일 생성 폼 모달 */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">캠페인 메일 생성</h2>
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  메일 제목
                </label>
                <input
                  type="text"
                  value={emailFormData.subject}
                  onChange={(e) => setEmailFormData(prev => ({ ...prev, subject: e.target.value }))}
                  onFocus={() => setActiveField('subject')}
                  placeholder="캠페인 메일 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  메일 내용
                </label>
                <div onFocus={() => setActiveField('content')}>
                  <RichTextEditor
                    value={emailFormData.content}
                    onChange={(value) => setEmailFormData(prev => ({ ...prev, content: value }))}
                    placeholder="캠페인 메일 내용을 입력하세요"
                    onInsertVariable={(fn) => {
                      contentInsertFnRef.current = fn
                    }}
                  />
                </div>
              </div>

              {/* 변수 관리 섹션 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 사용 가능한 변수 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      사용 가능한 변수 (클릭하여 삽입)
                    </h4>

                    <div className="space-y-4">
                      {/* 사용자 변수들 */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">사용자 변수</h5>
                          <button
                            type="button"
                            onClick={() => setShowUserVariableModal(true)}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border hover:bg-gray-200 transition-colors"
                            title="변수 관리"
                          >
                            관리
                          </button>
                        </div>
                        <div className="space-y-2">
                          {Object.keys(userVariables).length === 0 ? (
                            <p className="text-sm text-gray-500">사용자 변수가 없습니다. '관리' 버튼을 클릭해서 변수를 만드세요.</p>
                          ) : (
                            Object.entries(userVariables).map(([groupName, group]) => (
                              <div key={groupName} className="border-l-3 border-purple-200 pl-3">
                                <div className="text-sm font-medium text-gray-600 mb-2">{group.displayName}</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(group.variables || {}).map(([variableKey, variable]) => (
                                    <button
                                      key={variableKey}
                                      type="button"
                                      onClick={() => handleVariableInsert(variableKey)}
                                      className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                                      title={`{{${variableKey}}}`}
                                    >
                                      {variable.alias || variableKey}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 인플루언서 필드들 (텍스트 타입만) */}
                      {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-3">인플루언서 정보</h5>
                          <div className="flex flex-wrap gap-2">
                            {/* 캠페인 폼 링크 변수 (항상 표시) */}
                            <button
                              type="button"
                              onClick={() => handleVariableInsert('campaignFormLink')}
                              className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors font-medium"
                              title="각 인플루언서별 고유 캠페인 폼 링크"
                            >
                              📝 캠페인 폼 링크
                            </button>
                            {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').map((field) => (
                              <button
                                key={field.key}
                                type="button"
                                onClick={() => handleVariableInsert(field.key)}
                                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                title={field.tooltip || field.label}
                              >
                                {field.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 인플루언서 필드가 없는 경우에도 캠페인 폼 링크는 표시 */}
                      {influencerFields.filter(field => field.fieldType === 'TEXT' || field.fieldType === 'LONG_TEXT').length === 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-3">인플루언서 정보</h5>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleVariableInsert('campaignFormLink')}
                              className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors font-medium"
                              title="각 인플루언서별 고유 캠페인 폼 링크"
                            >
                              📝 캠페인 폼 링크
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 조건문 변수들 */}
                      {influencerFields.filter(field => field.fieldType === 'NUMBER').length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-3">조건문 변수 (숫자 필드)</h5>
                          <div className="space-y-3">
                            {influencerFields.filter(field => field.fieldType === 'NUMBER').map((field) => (
                              <div key={field.key} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">{field.label}</span>
                                  <button
                                    type="button"
                                    onClick={() => openConditionsModal(field.key)}
                                    className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                                    title="조건 변수 관리"
                                  >
                                    + 조건 추가
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {conditionalRules[field.key] && conditionalRules[field.key].variables ? (
                                    Object.entries(conditionalRules[field.key].variables).map(([varKey, varData]) => (
                                      <button
                                        key={varKey}
                                        type="button"
                                        onClick={() => handleVariableInsert(varKey)}
                                        className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                                        title={`{{${varKey}}}`}
                                      >
                                        {varData.alias || varKey}
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-400">조건 변수가 없습니다</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 실시간 미리보기 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      실시간 미리보기
                    </h4>

                    {/* 제목 미리보기 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제목 미리보기
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] flex items-center">
                        <div className="text-gray-900 font-medium">
                          {emailFormData.subject ? (
                            <div dangerouslySetInnerHTML={{ __html: replaceVariables(emailFormData.subject) }} />
                          ) : (
                            <span className="text-gray-400">제목을 입력해주세요</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 내용 미리보기 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        내용 미리보기
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                        <div className="text-gray-900" style={{ whiteSpace: 'pre-wrap' }}>
                          {emailFormData.content ? (
                            <div dangerouslySetInnerHTML={{ __html: replaceVariables(emailFormData.content) }} />
                          ) : (
                            <span className="text-gray-400">내용을 입력해주세요</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateEmailTemplate}
                  disabled={!emailFormData.subject || !emailFormData.content || sendingEmails}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {sendingEmails ? '생성 중...' : '메일 템플릿 생성'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 조건문 설정 모달 */}
      {showConditionsModal && (
        <ConditionsModal
          field={influencerFields.find(f => f.key === editingConditionVariable)}
          variableName={editingConditionVariable}
          variableInfo={(() => {
            // 사용자 변수인지 확인
            for (const [, group] of Object.entries(userVariables)) {
              if (group.variables && group.variables[editingConditionVariable]) {
                return {
                  type: 'user',
                  label: group.variables[editingConditionVariable].alias || editingConditionVariable,
                  group: group.displayName
                }
              }
            }
            // 인플루언서 필드
            const field = influencerFields.find(f => f.key === editingConditionVariable)
            if (field) {
              return {
                type: 'influencer',
                label: field.label
              }
            }
            return null
          })()}
          initialRules={conditionalRules[editingConditionVariable] || { variables: {} }}
          onSave={(rules) => {
            setConditionalRules(prev => ({
              ...prev,
              [editingConditionVariable]: rules
            }))
            setShowConditionsModal(false)
          }}
          onClose={() => setShowConditionsModal(false)}
        />
      )}

      {/* 사용자 변수 설정 모달 */}
      {showUserVariableModal && (
        <UserVariableModal
          isOpen={showUserVariableModal}
          userVariables={userVariables}
          setUserVariables={setUserVariables}
          onClose={() => setShowUserVariableModal(false)}
        />
      )}
    </div>
  )
}

export default function SurveyInfluencerConnect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen bg-white"></main>
      </div>
    }>
      <SurveyInfluencerConnectContent />
    </Suspense>
  )
}