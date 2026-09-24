import Api from '@/api'
import type { AutoReplyItem, AutoReplyType, OnlineChatCustomer } from '@/api/interface/chat'
import type { UploadPictureResult } from '@/api/interface/picture'
import { useUserStore } from '@/stores/user'
import { getDeviceTraceId } from '@/utils/deviceId'
import { prepareUploadImage } from '@/utils/compress-upload-image'
import { globalShowToast } from '@/utils/toast'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'
import { createMessageId, formatChatTime, getChatPlainText, resolveChatMediaUrl } from '../shared'
import type {
  ChatImageItem,
  ChatMessage,
  ChatParticipant,
  ChatSocketMessage,
  ConversationItem,
  QuickIssue
} from '../types'
import { loadCachedChatMessages, saveCachedChatMessages } from './chat-message-cache'
import { useChatConnection } from './use-chat-connection'

const CHAT_VISITOR_STORAGE_KEY = 'chat_visitor_id'
const TEST_CHAT_SOCKET_URL = 'wss://test-h.d1dkf.com/1'

/** 将未知接口返回值转换为可安全遍历的数组。 */
const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

/** 从上传响应中提取图片文件名或地址。 */
const resolveUploadedImagePath = (result: unknown) => {
  if (typeof result === 'string') return result.trim()
  if (!result || typeof result !== 'object') return ''

  const record = result as UploadPictureResult
  return String(record.url || record.path || record.fileName || record.headPortrait || '').trim()
}

/** 读取或生成游客身份，确保同一浏览器会话可复用聊天缓存。 */
const getChatVisitorId = () => {
  const existingValue = localStorage.getItem(CHAT_VISITOR_STORAGE_KEY)
  if (existingValue) return existingValue

  const visitorId = `TEMP_${getDeviceTraceId()
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-16)}`
  localStorage.setItem(CHAT_VISITOR_STORAGE_KEY, visitorId)
  return visitorId
}

/** 将服务端图片字段补全为页面与 Socket 共用的图片结构。 */
const mapChatImage = (image: Partial<ChatImageItem>): ChatImageItem => ({
  imgUrl: resolveChatMediaUrl(image.imgUrl),
  fileName: String(image.fileName ?? ''),
  fileFormat: String(image.fileFormat ?? ''),
  imgSize: String(image.imgSize ?? ''),
  imageWidth: Number(image.imageWidth) || 0,
  imageHeight: Number(image.imageHeight) || 0
})

/** 将当前用户与当前客服拼成 IndexedDB 会话缓存键。 */
const getConversationCacheKey = (memberId: string, conversation: ConversationItem) =>
  `${memberId}:${conversation.dealerCode}:${conversation.id}`

/** 读取原始图片的尺寸，无法读取时以零值降级。 */
const getImageDimensions = (file: Blob) =>
  new Promise<{ width: number; height: number }>(resolve => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: 0, height: 0 })
    }
    image.src = objectUrl
  })

/** 管理客服列表、Socket 消息、本地缓存、自动回复和图片发送的运行时状态。 */
export function useChatRuntime() {
  const userStore = useUserStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  const { state: connectionState, errorMessage, connect, send, disconnect } = useChatConnection()
  const conversations = ref<ConversationItem[]>([])
  const messages = ref<ChatMessage[]>([])
  const quickIssues = ref<QuickIssue[]>([])
  const autoReplyItems = ref<AutoReplyItem[]>([])
  const activeConversation = ref<ConversationItem | null>(null)
  const loadingConversations = ref(false)
  const loadingAutoReplies = ref(false)
  const uploadingImage = ref(false)

  /** 当前会员或游客用于查询客服列表和隔离本地缓存的身份 ID。 */
  const currentChatUserId = computed(() => {
    const memberRowId = acctInfo.value?.memberRowId ?? userInfo.value?.rowId
    return memberRowId ? String(memberRowId) : getChatVisitorId()
  })

  /** 判断当前会话是否已经获得服务端所需的客服账号与商户编码。 */
  const canConnectActiveConversation = computed(() =>
    Boolean(activeConversation.value?.account && activeConversation.value.dealerCode)
  )

  /** 构建当前会员或游客写入 Socket 消息的 mine 节点。 */
  const buildMemberParticipant = (): ChatParticipant => {
    const account = String(acctInfo.value?.memberId ?? userInfo.value?.memberId ?? '').trim()
    const visitorId = getChatVisitorId()
    const isMember = Boolean(account)
    const memberUserId = String(acctInfo.value?.memberRowId ?? userInfo.value?.rowId ?? visitorId)

    return {
      avatar: resolveChatMediaUrl(userInfo.value?.headPortrait),
      dealerCode: activeConversation.value?.dealerCode ?? '',
      nickName: String(userInfo.value?.nickName ?? account ?? visitorId).trim() || visitorId,
      type: 'member',
      account: account || visitorId,
      userId: isMember ? memberUserId : visitorId
    }
  }

  /** 从当前客服会话生成 Socket 消息的 to 节点。 */
  const buildCustomerParticipant = (): ChatParticipant | null => {
    const conversation = activeConversation.value
    if (!conversation?.account || !conversation.dealerCode) return null

    return {
      avatar: resolveChatMediaUrl(conversation.avatar),
      dealerCode: conversation.dealerCode,
      nickName: conversation.nickName || conversation.account,
      type: 'customer',
      account: conversation.account,
      userId: conversation.id
    }
  }

  /** 使用当前客服和会员身份构建 WebSocket 查询参数地址。 */
  const buildSocketUrl = () => {
    const member = buildMemberParticipant()
    const customer = buildCustomerParticipant()
    if (!customer) return ''

    const socketUrl = String(import.meta.env.VITE_CHAT_WS_URL || TEST_CHAT_SOCKET_URL).trim()
    const url = new URL(socketUrl)
    const token = String(localStorage.getItem('xAuthToken') ?? '').trim()
    const params = new URLSearchParams({
      d: customer.dealerCode,
      u: member.userId,
      t: getDeviceTraceId(),
      account: member.account,
      nickName: member.nickName,
      avatar: member.avatar,
      customerId: customer.userId
    })

    if (token) {
      params.set('token', token)
    }

    params.forEach((value, key) => url.searchParams.set(key, value))
    return url.toString()
  }

  /** 将当前消息列表异步写入选中客服对应的 IndexedDB 缓存。 */
  const persistActiveConversationMessages = () => {
    if (!activeConversation.value) return
    void saveCachedChatMessages(
      getConversationCacheKey(currentChatUserId.value, activeConversation.value),
      messages.value
    )
  }

  /** 将新消息去重写入当前会话，并立即同步到本地缓存。 */
  const upsertMessage = (message: ChatMessage) => {
    const existingIndex = messages.value.findIndex(item => item.id === message.id)
    if (existingIndex === -1) {
      messages.value.push(message)
    } else {
      messages.value[existingIndex] = { ...messages.value[existingIndex], ...message }
    }
    persistActiveConversationMessages()
  }

  /** 将服务端 Socket 业务消息转换为聊天页面数据模型。 */
  const mapSocketMessage = (payload: ChatSocketMessage): ChatMessage => {
    const isOutgoing = payload.mine?.type === 'member'
    const isImage = payload.contentType === 'image'
    const isAutoReply =
      payload.contentType === 'autoReplyReq' || payload.contentType === 'autoReplyResp'
    const imageList = toArray<Partial<ChatImageItem>>(payload.imageList).map(mapChatImage)

    return {
      id: String(payload.messageId),
      direction: isOutgoing ? 'outgoing' : 'incoming',
      type: isImage ? 'image' : isAutoReply ? 'auto-reply' : 'text',
      text: getChatPlainText(payload.content),
      image: isImage ? resolveChatMediaUrl(imageList[0]?.imgUrl) : undefined,
      imageList,
      time: formatChatTime(Number(payload.timestamp) || Date.now()),
      timestamp: Number(payload.timestamp) || Date.now(),
      read: isOutgoing,
      status: isOutgoing ? 'sent' : undefined,
      contentType: payload.contentType
    }
  }

  /** 处理连接配置、发送确认和客服消息推送。 */
  const handleSocketPayload = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return

    const record = payload as Record<string, unknown>
    if (record.type === 'ack' && typeof record.messageId === 'string') {
      const message = messages.value.find(item => item.id === record.messageId)
      if (message) {
        message.status = 'sent'
        message.read = true
        persistActiveConversationMessages()
      }
      return
    }

    if (record.type !== 'msg' || typeof record.messageId !== 'string') return

    const message = mapSocketMessage(record as unknown as ChatSocketMessage)
    upsertMessage(message)

    // 图文自动回复可能在同一条响应中附带多张图片，按独立图片消息展示。
    if (message.type === 'auto-reply' && message.imageList?.length) {
      message.imageList.forEach((image, index) => {
        upsertMessage({
          id: `${message.id}:image:${index}`,
          direction: message.direction,
          type: 'image',
          image: image.imgUrl,
          imageList: [image],
          time: message.time,
          timestamp: message.timestamp,
          read: message.read,
          status: message.status,
          contentType: 'image'
        })
      })
    }
  }

  /** 请求在线客服列表并按后端排序字段稳定展示。 */
  const loadConversations = async () => {
    loadingConversations.value = true

    try {
      const response = await Api.chat.queryOnlineCustomer(
        { userId: currentChatUserId.value },
        { showErrorToast: false }
      )

      if (response.code !== 'C2') {
        throw new Error(response.message || 'Failed to load customer service list')
      }

      conversations.value = toArray<OnlineChatCustomer>(response.result)
        .sort((left, right) => (Number(left.sort) || 0) - (Number(right.sort) || 0))
        .map(item => ({ ...item, id: String(item.id) }))
    } catch (error) {
      conversations.value = []
      globalShowToast({
        message: error instanceof Error ? error.message : 'Failed to load customer service list',
        type: 'fail'
      })
    } finally {
      loadingConversations.value = false
    }
  }

  /** 请求自动回复分类，并转换为快捷问题入口。 */
  const loadQuickIssues = async () => {
    try {
      const response = await Api.chat.queryAutoReplyTypes({ showErrorToast: false })
      if (response.code !== 'C2') {
        throw new Error(response.message || 'Failed to load auto replies')
      }

      quickIssues.value = toArray<AutoReplyType>(response.result)
    } catch {
      quickIssues.value = []
    }
  }

  /** 请求选中自动回复分类下可发送的问题。 */
  const loadAutoReplies = async (issue: QuickIssue) => {
    loadingAutoReplies.value = true

    try {
      const response = await Api.chat.queryAutoReplies(
        { questionType: issue.id },
        { showErrorToast: false }
      )

      if (response.code !== 'C2') {
        throw new Error(response.message || 'Failed to load auto replies')
      }

      autoReplyItems.value = toArray<AutoReplyItem>(response.result)
    } catch (error) {
      autoReplyItems.value = []
      globalShowToast({
        message: error instanceof Error ? error.message : 'Failed to load auto replies',
        type: 'fail'
      })
    } finally {
      loadingAutoReplies.value = false
    }
  }

  /** 建立选中客服的连接前读取对应 IndexedDB 消息缓存。 */
  const selectConversation = async (conversation: ConversationItem) => {
    disconnect()
    activeConversation.value = conversation
    messages.value = await loadCachedChatMessages(
      getConversationCacheKey(currentChatUserId.value, conversation)
    )

    if (!canConnectActiveConversation.value) {
      globalShowToast({ message: 'Customer service account is unavailable', type: 'fail' })
      return
    }

    connect({
      url: buildSocketUrl(),
      onMessage: handleSocketPayload
    })
  }

  /** 退出当前客服会话并重置当前会话的临时数据。 */
  const leaveConversation = () => {
    persistActiveConversationMessages()
    disconnect()
    activeConversation.value = null
    messages.value = []
    autoReplyItems.value = []
  }

  /** 构建并发送文本或自动回复请求，同时先插入 sending 状态消息。 */
  const sendMessage = (
    content: string,
    contentType: ChatSocketMessage['contentType'] = 'text',
    imageList?: ChatImageItem[]
  ) => {
    const mine = buildMemberParticipant()
    const to = buildCustomerParticipant()
    const normalizedContent = content.trim()
    if (!to || (!normalizedContent && !imageList?.length)) return false

    const messageId = createMessageId()
    const payload: ChatSocketMessage = {
      type: 'msg',
      messageId,
      content: normalizedContent,
      contentType,
      mine,
      to,
      imageList
    }
    const message: ChatMessage = {
      id: messageId,
      direction: 'outgoing',
      type: contentType === 'image' ? 'image' : contentType === 'text' ? 'text' : 'auto-reply',
      text: getChatPlainText(normalizedContent),
      image: imageList?.[0]?.imgUrl,
      imageList,
      time: formatChatTime(),
      timestamp: Date.now(),
      read: false,
      status: 'sending',
      contentType
    }

    upsertMessage(message)

    if (send(payload)) return true

    message.status = 'failed'
    persistActiveConversationMessages()
    globalShowToast({ message: 'Customer service is reconnecting', type: 'fail' })
    return false
  }

  /** 发送用户手动输入的普通文本消息。 */
  const sendTextMessage = (text: string) => sendMessage(text, 'text')

  /** 发送自动回复问题请求，等待服务端推送 autoReplyResp 内容。 */
  const sendAutoReplyMessage = (item: AutoReplyItem) => {
    const question = String(item.questionTitle ?? '').trim()
    if (!question) return false
    return sendMessage(`<div>【系统自动回复】</div>${question}`, 'autoReplyReq')
  }

  /** 上传用户选中的图片，成功后将上传地址作为 image Socket 消息发送。 */
  const sendImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      globalShowToast({ message: 'Only image files are supported', type: 'fail' })
      return false
    }

    uploadingImage.value = true
    try {
      const [{ width, height }, uploadFile] = await Promise.all([
        getImageDimensions(file),
        prepareUploadImage(file)
      ])
      const extension =
        uploadFile.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop() || 'png'
      const fileName = `chat-${Date.now()}.${extension}`
      const response = await Api.picture.upload({ file: uploadFile, fileName })

      if (response.code !== 'C2') {
        throw new Error(response.message || 'Image upload failed')
      }

      const imagePath = resolveUploadedImagePath(response.result)
      if (!imagePath) {
        throw new Error(response.message || 'Image upload failed')
      }

      const image: ChatImageItem = {
        imgUrl: resolveChatMediaUrl(imagePath),
        fileName,
        fileFormat: extension,
        imgSize: String(uploadFile.size),
        imageWidth: width,
        imageHeight: height
      }

      return sendMessage('', 'image', [image])
    } catch (error) {
      globalShowToast({
        message: error instanceof Error ? error.message : 'Image upload failed',
        type: 'fail'
      })
      return false
    } finally {
      uploadingImage.value = false
    }
  }

  /** 并行刷新客服列表与自动回复分类，供客服页面首次进入使用。 */
  const initialize = async () => {
    await Promise.all([loadConversations(), loadQuickIssues()])
  }

  onBeforeUnmount(disconnect)

  return {
    conversations,
    messages,
    quickIssues,
    autoReplyItems,
    activeConversation,
    loadingConversations,
    loadingAutoReplies,
    uploadingImage,
    connectionState,
    errorMessage,
    initialize,
    selectConversation,
    leaveConversation,
    loadAutoReplies,
    sendTextMessage,
    sendAutoReplyMessage,
    sendImageFile
  }
}
