import Api from '@/api'
import type {
  AutoReplyItem,
  AutoReplyType,
  ChatConfig,
  ChatQaConfig,
  OnlineChatCustomer
} from '@/api/interface/chat'
import type { UploadPictureResult } from '@/api/interface/picture'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { prepareUploadImage } from '@/utils/compress-upload-image'
import { getDeviceTraceId } from '@/utils/deviceId'
import { globalShowToast } from '@/utils/toast'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  createMessageId,
  formatChatMessageTime,
  getChatPlainText,
  getChatTimePeriod,
  resolveChatMediaUrl
} from '../shared'
import type {
  ChatImageItem,
  ChatMessage,
  ChatParticipant,
  ChatRedPacket,
  ChatReplyTarget,
  ChatSocketMessage,
  ConversationItem,
  QuickIssue
} from '../types'
import {
  CHAT_CACHE_PAGE_SIZE,
  loadCachedChatMessages,
  saveCachedChatMessage
} from './chat-message-cache'
import { useChatConnection } from './use-chat-connection'

const CHAT_VISITOR_STORAGE_KEY = 'chat_visitor_id'
let hasRequestedWelcomeReminder = false
let welcomeReminderConfigRequest: Promise<ChatConfig | null> | null = null

/** 将未知接口返回值转换为可安全遍历的数组。 */
const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

/** 复用首次欢迎语配置请求，避免布局重建时重复请求同一接口。 */
const requestWelcomeReminderConfig = () => {
  if (welcomeReminderConfigRequest) return welcomeReminderConfigRequest

  welcomeReminderConfigRequest = Api.chat
    .queryChatConfig({ t: Date.now() }, { showErrorToast: false })
    .then(response => (response.code === 'C2' ? (response.result ?? null) : null))
    .catch(() => null)

  return welcomeReminderConfigRequest
}

/** 将后台字符串形式的 qaConfig 安全转换为欢迎语配置对象。 */
const parseChatQaConfig = (value: ChatConfig['qaConfig']): ChatQaConfig | null => {
  if (!value) return null
  if (typeof value === 'object') return value

  try {
    const parsedValue = JSON.parse(value) as unknown
    return parsedValue && typeof parsedValue === 'object' ? (parsedValue as ChatQaConfig) : null
  } catch {
    return null
  }
}

/** 解析 WebSocket 红包消息 content 中的 JSON 数据，异常数据按普通文本处理。 */
const parseChatRedPacket = (value: unknown): ChatRedPacket | null => {
  try {
    const parsedValue = JSON.parse(String(value ?? '')) as Record<string, unknown>
    const id = parsedValue.id
    const status = Number(parsedValue.status)
    const amount = parsedValue.amount

    if ((typeof id !== 'string' && typeof id !== 'number') || (status !== 0 && status !== 1)) {
      return null
    }

    if (typeof amount !== 'string' && typeof amount !== 'number') return null

    return { id, status, amount }
  } catch {
    return null
  }
}

/** 从上传响应中提取图片文件名或地址。 */
const resolveUploadedImagePath = (result: unknown) => {
  if (typeof result === 'string') return result.trim()
  if (!result || typeof result !== 'object') return ''

  const record = result as UploadPictureResult
  return String(record.url || record.path || record.fileName || record.headPortrait || '').trim()
}

/** 判断用户选择的本地文件是否为可发送的视频格式。 */
const isVideoFile = (file: File) =>
  file.type.startsWith('video/') || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(file.name)

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

/** 将当前用户、站点商户编码与当前客服拼成 IndexedDB 会话缓存键。 */
const getConversationCacheKey = (
  memberId: string,
  dealerCode: string,
  conversation: ConversationItem
) => `${memberId}:${dealerCode}:${conversation.id}`

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
  const siteConfigStore = useSiteConfigStore()
  siteConfigStore.syncStoredConfig()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  const { state: connectionState, errorMessage, connect, send, disconnect } = useChatConnection()
  const conversations = ref<ConversationItem[]>([])
  const messages = ref<ChatMessage[]>([])
  const quickIssues = ref<QuickIssue[]>([])
  const autoReplyItems = ref<AutoReplyItem[]>([])
  const autoReplyItemsByIssue = new Map<string, AutoReplyItem[]>()
  const activeConversation = ref<ConversationItem | null>(null)
  const loadingConversations = ref(true)
  const loadingAutoReplies = ref(false)
  const uploadingImage = ref(false)
  const redPacketClaimingMessageIds = ref<string[]>([])
  const claimedRedPacketIds = ref<string[]>([])
  const redPacketSuccessAmount = ref<string | number | null>(null)
  const hasMoreCachedMessages = ref(false)
  const loadingOlderMessages = ref(false)
  let pendingMessageCacheWrite = Promise.resolve()
  let autoReplyRequestId = 0

  /** 直接读取本地 config 中由 /sy/dlicgh 缓存的 customer_service_dealer。 */
  const dealerCode = computed(() => siteConfigStore.getConfigString('customer_service_dealer'))

  /** 直接读取本地 config 中由 /sy/dlicgh 缓存的客服 Socket 主机地址。 */
  const customerServiceUrl = computed(() => siteConfigStore.getConfigString('customer_service_url'))

  /** 当前会员或游客用于查询客服列表和隔离本地缓存的身份 ID。 */
  const currentChatUserId = computed(() => {
    const memberRowId = acctInfo.value?.memberRowId ?? userInfo.value?.rowId
    return memberRowId ? String(memberRowId) : getChatVisitorId()
  })

  /** 构建当前会员或游客写入 Socket 消息的 mine 节点。 */
  const buildMemberParticipant = (): ChatParticipant => {
    const account = String(acctInfo.value?.memberId ?? '').trim()
    const visitorId = getChatVisitorId()
    const isMember = Boolean(account)
    const memberUserId = String(acctInfo.value?.memberRowId ?? userInfo.value?.rowId ?? visitorId)

    return {
      avatar: resolveChatMediaUrl(userInfo.value?.headPortrait),
      dealerCode: dealerCode.value,
      nickName: String(userInfo.value?.nickName || '').trim() || visitorId,
      type: 'member',
      account: account || visitorId,
      userId: isMember ? memberUserId : visitorId
    }
  }

  /** 从当前客服会话生成 Socket 消息的 to 节点，account 使用接口返回的 nickName。 */
  const buildCustomerParticipant = (): ChatParticipant | null => {
    const conversation = activeConversation.value
    if (!conversation) return null
    return {
      avatar: resolveChatMediaUrl(conversation.avatar),
      dealerCode: dealerCode.value,
      nickName: conversation.nickName || '',
      type: 'customer',
      account: conversation.nickName || '',
      userId: conversation.id
    }
  }

  /** 根据引用目标还原 Socket 所需的 replyInfo 字段。 */
  const buildReplyInfo = (replyTarget?: ChatReplyTarget | null) =>
    replyTarget
      ? {
          replyToMsgId: replyTarget.id,
          replyToContent: replyTarget.preview,
          replyToType: replyTarget.replyToType || (replyTarget.photoCount ? 'image' : 'text'),
          replyToUserId: replyTarget.replyToUserId || '',
          replyToUserName: replyTarget.replyToUserName || replyTarget.author,
          quoteText: replyTarget.preview
        }
      : undefined

  /** 使用当前客服和会员身份构建 WebSocket 查询参数地址。 */
  const buildSocketUrl = () => {
    const member = buildMemberParticipant()
    const customer = buildCustomerParticipant()
    const host = customerServiceUrl.value.replace(/^wss?:\/\//i, '').replace(/\/+$/, '')
    if (!customer || !host) return ''

    const socketUrl = `wss://${host}/1`
    const url = new URL(socketUrl)
    const token = String(localStorage.getItem('xAuthToken') ?? '').trim()
    const params = new URLSearchParams({
      d: dealerCode.value,
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

  /** 将当前会话的一条消息串行增量写入 IndexedDB。 */
  const persistActiveConversationMessage = (message: ChatMessage) => {
    if (!activeConversation.value) return pendingMessageCacheWrite

    const cacheKey = getConversationCacheKey(
      currentChatUserId.value,
      dealerCode.value,
      activeConversation.value
    )
    const messageSnapshot = {
      ...message,
      imageList: message.imageList ? [...message.imageList] : undefined
    }

    pendingMessageCacheWrite = pendingMessageCacheWrite
      .catch(() => undefined)
      .then(() => saveCachedChatMessage(cacheKey, messageSnapshot))

    return pendingMessageCacheWrite
  }

  /** 扫描当前会话的已领取红包，用于禁用相同红包 ID 的待领取原消息。 */
  const syncClaimedRedPacketIds = () => {
    claimedRedPacketIds.value = [
      ...new Set(
        messages.value
          .filter(message => message.redPacket?.status === 1)
          .map(message => String(message.redPacket?.id ?? ''))
          .filter(Boolean)
      )
    ]
  }

  /** 从会话消息中找出时间最新的一条；没有消息时返回空值。 */
  const getLatestConversationMessage = (conversationMessages: ChatMessage[]) =>
    conversationMessages.reduce<ChatMessage | null>((latestMessage, message) => {
      if (!latestMessage) return message

      const latestTimestamp = Number(latestMessage.timestamp) || 0
      const messageTimestamp = Number(message.timestamp) || 0
      return messageTimestamp >= latestTimestamp ? message : latestMessage
    }, null)

  /** 用本地缓存历史覆盖会话预览，避免使用客服列表接口的非聊天消息字段。 */
  const hydrateConversationPreview = async (conversation: ConversationItem) => {
    const { messages: conversationMessages } = await loadCachedChatMessages(
      getConversationCacheKey(currentChatUserId.value, dealerCode.value, conversation),
      { limit: 1 }
    )
    const latestMessage = getLatestConversationMessage(conversationMessages)

    return {
      ...conversation,
      lastMessage: latestMessage?.text ?? ''
    }
  }

  /** 将当前已打开会话的消息预览同步到会话列表。 */
  const syncActiveConversationPreview = () => {
    if (!activeConversation.value) return

    const latestMessage = getLatestConversationMessage(messages.value)
    activeConversation.value.lastMessage = latestMessage?.text ?? ''
  }

  /** 将新消息去重写入当前会话，并立即同步到本地缓存。 */
  const upsertMessage = (message: ChatMessage) => {
    const existingIndex = messages.value.findIndex(item => item.id === message.id)
    if (existingIndex === -1) {
      messages.value.push(message)
    } else {
      messages.value[existingIndex] = { ...messages.value[existingIndex], ...message }
    }
    syncClaimedRedPacketIds()
    syncActiveConversationPreview()
    persistActiveConversationMessage(message)
  }

  /** 将服务端 Socket 业务消息转换为聊天页面数据模型。 */
  const mapSocketMessage = (payload: ChatSocketMessage): ChatMessage => {
    const timestamp = Number(payload.timestamp) || Date.now()
    const isOutgoing = payload.mine?.type === 'member'
    const isImage = payload.contentType === 'image'
    const isVideo = payload.contentType === 'video'
    const isAutoReply =
      payload.contentType === 'autoReplyReq' || payload.contentType === 'autoReplyResp'
    const redPacket = payload.contentType === 'redPack' ? parseChatRedPacket(payload.content) : null
    const isRedPacket = Boolean(redPacket)
    const isReply = payload.contentType === 'reply' || Boolean(payload.replyInfo)
    const imageList = toArray<Partial<ChatImageItem>>(payload.imageList).map(mapChatImage)
    const replyInfo = payload.replyInfo

    return {
      id: String(payload.messageId),
      direction: isOutgoing ? 'outgoing' : 'incoming',
      type: isImage
        ? 'image'
        : isVideo
          ? 'video'
          : isAutoReply
            ? 'auto-reply'
            : isRedPacket
              ? 'red-pack'
              : isReply
                ? 'reply'
                : 'text',
      text: isRedPacket ? '' : getChatPlainText(payload.content),
      image: isImage ? resolveChatMediaUrl(imageList[0]?.imgUrl) : undefined,
      video: isVideo ? resolveChatMediaUrl(payload.content) : undefined,
      imageList,
      time: formatChatMessageTime(timestamp),
      period: getChatTimePeriod(timestamp),
      timestamp,
      read: isOutgoing,
      status: isOutgoing ? 'sent' : undefined,
      contentType: payload.contentType,
      socketContent: String(payload.content ?? ''),
      redPacket: redPacket || undefined,
      authorId: String(payload.mine?.userId ?? ''),
      authorName: String(payload.mine?.nickName ?? ''),
      reply: replyInfo
        ? {
            id: String(replyInfo.replyToMsgId ?? ''),
            author: String(replyInfo.replyToUserName ?? ''),
            preview: String(replyInfo.quoteText || replyInfo.replyToContent || ''),
            photoCount: replyInfo.replyToType === 'image' ? 1 : undefined,
            replyToUserId: String(replyInfo.replyToUserId ?? ''),
            replyToUserName: String(replyInfo.replyToUserName ?? ''),
            replyToType: replyInfo.replyToType
          }
        : undefined
    }
  }

  /** 收到红包消息后按协议发送已读回执，通知客服端消息已被客户端接收。 */
  const sendRedPacketReadReceipt = (messageId: string) => {
    const to = buildCustomerParticipant()
    if (!to) return false

    return send({
      type: 'readReceipt',
      messageId: createMessageId(),
      content: '',
      contentType: 'text',
      to,
      msgIds: [messageId]
    })
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
        persistActiveConversationMessage(message)
      }
      return
    }

    if (record.type !== 'msg' || typeof record.messageId !== 'string') return

    const message = mapSocketMessage(record as unknown as ChatSocketMessage)
    upsertMessage(message)

    if (message.type === 'red-pack') {
      sendRedPacketReadReceipt(message.id)
    }

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
          period: message.period,
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

      const customerConversations = toArray<OnlineChatCustomer>(response.result)
        .sort((left, right) => (Number(left.sort) || 0) - (Number(right.sort) || 0))
        .map(item => ({ ...item, id: String(item.id) }))
      conversations.value = await Promise.all(customerConversations.map(hydrateConversationPreview))
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
    const issueKey = String(issue.id)
    const requestId = ++autoReplyRequestId
    const cachedItems = autoReplyItemsByIssue.get(issueKey)

    // 已请求过的分类直接复用内存数据，避免弹层重复出现加载状态。
    if (cachedItems) {
      autoReplyItems.value = cachedItems
      loadingAutoReplies.value = false
      return
    }

    // 切换至未缓存分类时先清空上一个分类的数据，仅展示加载中状态。
    autoReplyItems.value = []
    loadingAutoReplies.value = true

    try {
      const response = await Api.chat.queryAutoReplies(
        { param: { questionType: issue.id } },
        { showErrorToast: false }
      )

      if (response.code !== 'C2') {
        throw new Error(response.message || 'Failed to load auto replies')
      }

      const items = toArray<AutoReplyItem>(response.result)
      autoReplyItemsByIssue.set(issueKey, items)

      // 用户切换分类后，忽略上一次请求的迟到响应。
      if (requestId === autoReplyRequestId) {
        autoReplyItems.value = items
      }
    } catch (error) {
      if (requestId === autoReplyRequestId) {
        autoReplyItems.value = []
        globalShowToast({
          message: error instanceof Error ? error.message : 'Failed to load auto replies',
          type: 'fail'
        })
      }
    } finally {
      if (requestId === autoReplyRequestId) {
        loadingAutoReplies.value = false
      }
    }
  }

  /** 首次进入会话时读取客服欢迎语，并在启用时写入当前会话消息列表。 */
  const loadWelcomeReminder = async (conversation: ConversationItem) => {
    if (hasRequestedWelcomeReminder) return
    hasRequestedWelcomeReminder = true

    try {
      const config = await requestWelcomeReminderConfig()
      const qaConfig = parseChatQaConfig(config?.qaConfig)
      const reminderText = String(qaConfig?.reminderText ?? '').trim()

      if (
        qaConfig?.isEnabled !== true ||
        !reminderText ||
        activeConversation.value?.id !== conversation.id ||
        messages.value.some(message => message.contentType === 'welcome-reminder')
      ) {
        return
      }

      const timestamp = Date.now()
      upsertMessage({
        id: `welcome-reminder:${conversation.id}:${timestamp}`,
        direction: 'incoming',
        type: 'text',
        text: reminderText,
        time: formatChatMessageTime(timestamp),
        period: getChatTimePeriod(timestamp),
        timestamp,
        contentType: 'welcome-reminder'
      })
    } catch {
      // 欢迎语请求失败不影响聊天连接与正常消息发送。
    }
  }

  /** 建立选中客服的连接前读取对应 IndexedDB 消息缓存。 */
  const selectConversation = async (conversation: ConversationItem) => {
    disconnect()
    activeConversation.value = conversation
    messages.value = []
    hasMoreCachedMessages.value = false
    const conversationCacheKey = getConversationCacheKey(
      currentChatUserId.value,
      dealerCode.value,
      conversation
    )
    const cachedPage = await loadCachedChatMessages(conversationCacheKey, {
      limit: CHAT_CACHE_PAGE_SIZE
    })
    if (
      !activeConversation.value ||
      getConversationCacheKey(
        currentChatUserId.value,
        dealerCode.value,
        activeConversation.value
      ) !== conversationCacheKey
    ) {
      return
    }

    const member = buildMemberParticipant()
    // 兼容旧版缓存：补齐原消息作者，保证引用回复可携带正确的用户身份。
    messages.value = cachedPage.messages.map(message => ({
      ...message,
      authorId:
        message.authorId || (message.direction === 'outgoing' ? member.userId : conversation.id),
      authorName:
        message.authorName ||
        (message.direction === 'outgoing' ? member.nickName : conversation.nickName || '')
    }))
    hasMoreCachedMessages.value = cachedPage.hasMore
    syncClaimedRedPacketIds()
    void loadWelcomeReminder(conversation)

    const socketUrl = buildSocketUrl()
    if (!socketUrl) {
      globalShowToast({ message: 'Customer service is unavailable', type: 'fail' })
      return
    }

    connect({
      url: socketUrl,
      onMessage: handleSocketPayload
    })
  }

  /** 读取当前已加载消息之前的一页本地历史，并追加至消息列表顶部。 */
  const loadOlderMessages = async () => {
    if (!activeConversation.value || loadingOlderMessages.value || !hasMoreCachedMessages.value) {
      return
    }

    const oldestMessage = messages.value[0]
    if (!oldestMessage?.id) {
      hasMoreCachedMessages.value = false
      return
    }

    const conversation = activeConversation.value
    const conversationCacheKey = getConversationCacheKey(
      currentChatUserId.value,
      dealerCode.value,
      conversation
    )
    loadingOlderMessages.value = true

    try {
      const cachedPage = await loadCachedChatMessages(conversationCacheKey, {
        before: {
          timestamp: Number(oldestMessage.timestamp) || 0,
          messageId: oldestMessage.id
        },
        limit: CHAT_CACHE_PAGE_SIZE
      })
      if (
        !activeConversation.value ||
        getConversationCacheKey(
          currentChatUserId.value,
          dealerCode.value,
          activeConversation.value
        ) !== conversationCacheKey
      ) {
        return
      }

      const currentMessageIds = new Set(messages.value.map(message => message.id))
      const olderMessages = cachedPage.messages.filter(
        message => !currentMessageIds.has(message.id)
      )
      messages.value = [...olderMessages, ...messages.value]
      hasMoreCachedMessages.value = cachedPage.hasMore
    } finally {
      loadingOlderMessages.value = false
    }
  }

  /** 退出当前客服会话并重置当前会话的临时数据。 */
  const leaveConversation = () => {
    autoReplyRequestId += 1
    disconnect()
    activeConversation.value = null
    messages.value = []
    hasMoreCachedMessages.value = false
    loadingOlderMessages.value = false
    redPacketClaimingMessageIds.value = []
    claimedRedPacketIds.value = []
    autoReplyItems.value = []
    loadingAutoReplies.value = false
  }

  /** 构建并发送文本或自动回复请求，同时先插入 sending 状态消息。 */
  const sendMessage = (
    content: string,
    contentType: ChatSocketMessage['contentType'] = 'text',
    imageList?: ChatImageItem[],
    replyTarget?: ChatReplyTarget | null
  ) => {
    const mine = buildMemberParticipant()
    const to = buildCustomerParticipant()
    const normalizedContent = content.trim()
    if (!to || (!normalizedContent && !imageList?.length)) return false

    const messageId = createMessageId()
    const timestamp = Date.now()
    const replyInfo = buildReplyInfo(replyTarget)
    const payload: ChatSocketMessage = {
      type: 'msg',
      messageId,
      content: normalizedContent,
      contentType,
      mine,
      to,
      imageList,
      replyInfo
    }
    const message: ChatMessage = {
      id: messageId,
      direction: 'outgoing',
      type:
        contentType === 'image'
          ? 'image'
          : contentType === 'video'
            ? 'video'
            : replyTarget
              ? 'reply'
              : contentType === 'text'
                ? 'text'
                : 'auto-reply',
      text: getChatPlainText(normalizedContent),
      image: imageList?.[0]?.imgUrl,
      video: contentType === 'video' ? resolveChatMediaUrl(normalizedContent) : undefined,
      imageList,
      time: formatChatMessageTime(timestamp),
      period: getChatTimePeriod(timestamp),
      timestamp,
      read: false,
      status: 'sending',
      contentType,
      socketContent: normalizedContent,
      authorId: mine.userId,
      authorName: mine.nickName,
      reply: replyTarget || undefined
    }

    upsertMessage(message)

    if (send(payload)) return true

    message.status = 'failed'
    persistActiveConversationMessage(message)
    globalShowToast({ message: 'Customer service is reconnecting', type: 'fail' })
    return false
  }

  /** 发送用户手动输入的普通文本或引用回复消息。 */
  const sendTextMessage = (text: string, replyTarget?: ChatReplyTarget | null) =>
    sendMessage(text, 'text', undefined, replyTarget)

  /** 重新发送连接失败的会员消息，保留原始消息 ID、图片和引用信息。 */
  const retryMessage = (message: ChatMessage) => {
    if (message.direction !== 'outgoing' || message.status !== 'failed') return false

    const mine = buildMemberParticipant()
    const to = buildCustomerParticipant()
    if (!to) return false

    const payload: ChatSocketMessage = {
      type: 'msg',
      messageId: message.id,
      content: message.socketContent ?? message.text ?? '',
      contentType: message.contentType || (message.type === 'image' ? 'image' : 'text'),
      mine,
      to,
      imageList: message.imageList,
      replyInfo: buildReplyInfo(message.reply)
    }

    message.status = 'sending'
    message.read = false
    persistActiveConversationMessage(message)

    if (send(payload)) return true

    message.status = 'failed'
    persistActiveConversationMessage(message)
    globalShowToast({ message: 'Customer service is reconnecting', type: 'fail' })
    return false
  }

  /** 领取待领取红包；成功后保留原消息并追加已领取记录与系统提示。 */
  const claimRedPacket = async (message: ChatMessage) => {
    const redPacket = message.redPacket
    if (!redPacket || redPacket.status !== 0) return false

    const packetId = String(redPacket.id)
    if (
      claimedRedPacketIds.value.includes(packetId) ||
      redPacketClaimingMessageIds.value.includes(message.id)
    ) {
      return false
    }

    redPacketClaimingMessageIds.value = [...redPacketClaimingMessageIds.value, message.id]

    try {
      const response = await Api.chat.receiveRedPackage(
        { id: redPacket.id },
        { showErrorToast: false }
      )
      if (response.code !== 'C2') {
        throw new Error(response.message || 'Failed to claim red packet')
      }

      const timestamp = Date.now()
      const mine = buildMemberParticipant()
      const serviceName = activeConversation.value?.nickName || ''

      // 领取成功后追加会员侧已领取红包，原客服侧待领取记录不替换。
      upsertMessage({
        id: `red-pack-claimed:${message.id}:${timestamp}`,
        direction: 'outgoing',
        type: 'red-pack',
        text: '',
        time: formatChatMessageTime(timestamp),
        period: getChatTimePeriod(timestamp),
        timestamp,
        read: true,
        status: 'sent',
        contentType: 'redPack',
        authorId: mine.userId,
        authorName: mine.nickName,
        redPacket: { ...redPacket, status: 1 }
      })

      // 领取完成后追加系统记录，便于会员在会话历史中确认领取来源。
      upsertMessage({
        id: `red-pack-system:${message.id}:${timestamp}`,
        direction: 'incoming',
        type: 'system',
        text: '',
        time: formatChatMessageTime(timestamp),
        period: getChatTimePeriod(timestamp),
        timestamp,
        contentType: 'redPackClaimed',
        system: { type: 'red-packet-claimed', serviceName }
      })

      redPacketSuccessAmount.value = redPacket.amount
      return true
    } catch (error) {
      globalShowToast({
        message: error instanceof Error ? error.message : 'Failed to claim red packet',
        type: 'fail'
      })
      return false
    } finally {
      redPacketClaimingMessageIds.value = redPacketClaimingMessageIds.value.filter(
        messageId => messageId !== message.id
      )
    }
  }

  /** 关闭领取成功弹窗，保留已写入本地会话缓存的领取记录。 */
  const closeRedPacketSuccess = () => {
    redPacketSuccessAmount.value = null
  }

  /** 发送自动回复问题和接口返回的系统答复，两条消息均立即写入当前会话。 */
  const sendAutoReplyMessage = (item: AutoReplyItem) => {
    const question = String(item.questionTitle ?? '').trim()
    const answer = String(item.content ?? '').trim()
    if (!question || !answer) return false

    const requestSent = sendMessage(`<div>【系统自动回复】</div>${question}`, 'autoReplyReq')
    if (!requestSent) return false

    return sendMessage(
      `<div id="h5SysMsg" style="display:none">${question}</div><div>${answer}</div>`,
      'autoReplyResp'
    )
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

  /** 上传用户选择的视频文件，并以视频地址发送对应的 Socket 消息。 */
  const sendVideoFile = async (file: File) => {
    if (!isVideoFile(file)) {
      globalShowToast({ message: 'Only video files are supported', type: 'fail' })
      return false
    }

    uploadingImage.value = true
    try {
      const extension = file.name.split('.').pop() || 'mp4'
      const fileName = `chat-${Date.now()}.${extension}`
      const response = await Api.picture.upload({ file, fileName })

      if (response.code !== 'C2') {
        throw new Error(response.message || 'Video upload failed')
      }

      const videoPath = resolveUploadedImagePath(response.result)
      if (!videoPath) {
        throw new Error(response.message || 'Video upload failed')
      }

      return sendMessage(resolveChatMediaUrl(videoPath), 'video')
    } catch (error) {
      globalShowToast({
        message: error instanceof Error ? error.message : 'Video upload failed',
        type: 'fail'
      })
      return false
    } finally {
      uploadingImage.value = false
    }
  }

  /** 根据本地文件类型分发图片或视频上传流程。 */
  const sendMediaFile = (file: File) => {
    if (file.type.startsWith('image/')) return sendImageFile(file)
    if (isVideoFile(file)) return sendVideoFile(file)

    globalShowToast({ message: 'Only images and videos are supported', type: 'fail' })
    return Promise.resolve(false)
  }

  /** 并行刷新客服列表与自动回复分类，供客服页面首次进入使用。 */
  const initialize = async () => {
    await Promise.all([loadConversations(), loadQuickIssues()])
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    conversations,
    messages,
    quickIssues,
    autoReplyItems,
    activeConversation,
    loadingConversations,
    loadingAutoReplies,
    uploadingImage,
    redPacketClaimingMessageIds,
    claimedRedPacketIds,
    redPacketSuccessAmount,
    hasMoreCachedMessages,
    loadingOlderMessages,
    connectionState,
    errorMessage,
    initialize,
    selectConversation,
    leaveConversation,
    loadOlderMessages,
    loadAutoReplies,
    sendTextMessage,
    retryMessage,
    claimRedPacket,
    closeRedPacketSuccess,
    sendAutoReplyMessage,
    sendImageFile,
    sendMediaFile
  }
}
