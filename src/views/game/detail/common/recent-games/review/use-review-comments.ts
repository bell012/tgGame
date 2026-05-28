import Api from '@/api'
import { readIsCollections, type GameCommentListItem } from '@/api/interface/game'
import { computed, inject, ref, watch, type Ref } from 'vue'
import type { ReviewCommentViewItem } from './review-types'
import {
  type CommentLikeCacheItem,
  type CommentLikeCacheMap,
  createCommentLikeCacheKey,
  formatElapsedTime,
  normalizeLikeCount,
  normalizePositiveInt,
  normalizeQueryValue,
  parseCommentLikeCacheMap,
  parseCommentRecords,
  toSafeNumber
} from './review-utils'

type LocalAcctInfo = {
  memberId?: string | number
  memberRowId?: string | number
} | null

type TranslateFn = (key: string, ...args: unknown[]) => string

export type ReviewSortValue = 'newest' | 'comments' | 'likes'

type MemberIdentity = {
  memberId: string
  memberRowId: string
}

type UseReviewCommentsOptions = {
  currentGameId: Ref<string>
  gameImageBaseUrl: string
  defaultCommentAvatarUrl: string
  getCurrentUserAvatarUrl: () => string
  getCurrentMemberIdentity: () => MemberIdentity
  requireLogin: () => boolean
  t: TranslateFn
}

const COMMENT_LIKE_STORAGE_KEY = 'gameCommentLikeMap'
const SORT_TYPE_MAP: Record<ReviewSortValue, 1 | 2 | 3> = {
  newest: 1,
  likes: 2,
  comments: 3
}

export const useReviewComments = (options: UseReviewCommentsOptions) => {
  const {
    currentGameId,
    gameImageBaseUrl,
    defaultCommentAvatarUrl,
    getCurrentUserAvatarUrl,
    getCurrentMemberIdentity,
    requireLogin,
    t
  } = options

  const subjectCollectionsRef = inject<Ref<boolean | null> | null>(
    'game-detail-subject-is-collections',
    null
  )

  const commentSubjectId = ref('')
  const ratingCountFromSubject = ref(0)
  const isCommentLoading = ref(false)
  const commentList = ref<ReviewCommentViewItem[]>([])

  const sortMenuRef = ref<HTMLElement | null>(null)
  const sortMenuPopupRef = ref<HTMLElement | null>(null)
  const isSortPopupOpen = ref(false)
  const activeSort = ref<ReviewSortValue>('newest')

  const isCommentPopupOpen = ref(false)
  const replyTargetComment = ref<ReviewCommentViewItem | null>(null)

  const sortOptions = computed(() => [
    { value: 'newest' as const, label: t('gameDetail.sortNewestFirst') },
    { value: 'comments' as const, label: t('gameDetail.sortTopComments') },
    { value: 'likes' as const, label: t('gameDetail.sortTopLikes') }
  ])

  const loadedCommentCount = computed(() => {
    return commentList.value.reduce((sum, comment) => sum + 1 + comment.children.length, 0)
  })

  const currentSortType = computed(() => SORT_TYPE_MAP[activeSort.value] ?? 1)

  const commentInputPlaceholder = computed(() => {
    const memberName = normalizeQueryValue(replyTargetComment.value?.memberName)
    if (!memberName) {
      return t('gameDetail.commentDefaultPlaceholder')
    }
    return t('gameDetail.replyToUser', { name: memberName })
  })

  const sortedCommentList = computed(() => commentList.value)

  const isSameMember = (
    item: { memberId?: unknown; memberRowId?: unknown; memberName?: unknown },
    identity: MemberIdentity
  ) => {
    const itemMemberId = normalizeQueryValue(item.memberId)
    const itemMemberRowId = normalizeQueryValue(item.memberRowId)
    const itemMemberName = normalizeQueryValue(item.memberName)

    if (identity.memberRowId && itemMemberRowId && identity.memberRowId === itemMemberRowId) {
      return true
    }
    if (identity.memberId && itemMemberId && identity.memberId === itemMemberId) {
      return true
    }
    if (identity.memberId && itemMemberName && identity.memberId === itemMemberName) {
      return true
    }
    return false
  }

  const hasCurrentUserComment = computed(() => {
    const identity = getCurrentMemberIdentity()
    if (!identity.memberId && !identity.memberRowId) {
      return false
    }
    return commentList.value.some(comment => isSameMember(comment, identity))
  })

  const getAcctInfoFromStorage = () => {
    if (typeof window === 'undefined') {
      return {
        memberId: '',
        memberRowId: ''
      }
    }
    const rawAcctInfo = window.localStorage.getItem('acctInfo')
    if (!rawAcctInfo) {
      return {
        memberId: '',
        memberRowId: ''
      }
    }

    try {
      const parsed = JSON.parse(rawAcctInfo) as LocalAcctInfo
      return {
        memberId: normalizeQueryValue(parsed?.memberId),
        memberRowId: normalizeQueryValue(parsed?.memberRowId)
      }
    } catch (error) {
      console.error('getAcctInfoFromStorage parse failed', error)
      return {
        memberId: '',
        memberRowId: ''
      }
    }
  }

  const getCommentLikeCacheMap = () => {
    if (typeof window === 'undefined') {
      return {}
    }
    return parseCommentLikeCacheMap(window.localStorage.getItem(COMMENT_LIKE_STORAGE_KEY))
  }

  const saveCommentLikeCacheMap = (cacheMap: CommentLikeCacheMap) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(COMMENT_LIKE_STORAGE_KEY, JSON.stringify(cacheMap))
  }

  const getCommentLikeCacheByKey = (cacheMap: CommentLikeCacheMap, key: string) => {
    const normalizedKey = normalizeQueryValue(key)
    if (!normalizedKey) {
      return null
    }
    return cacheMap[normalizedKey] ?? null
  }

  const setCommentLikeCacheByKey = (key: string, value: CommentLikeCacheItem) => {
    const normalizedKey = normalizeQueryValue(key)
    if (!normalizedKey) {
      return
    }

    const cacheMap = getCommentLikeCacheMap()
    cacheMap[normalizedKey] = {
      isLiked: Boolean(value.isLiked),
      isDisliked: Boolean(value.isDisliked),
      likeCount: normalizeLikeCount(value.likeCount),
      dislikeCount: normalizeLikeCount(value.dislikeCount)
    }
    saveCommentLikeCacheMap(cacheMap)
  }

  const resolveCommentAvatar = (avatar: unknown) => {
    const avatarPath = normalizeQueryValue(avatar)
    if (!avatarPath) {
      return defaultCommentAvatarUrl
    }
    if (/^(data:|blob:|https?:\/\/|\/)/i.test(avatarPath)) {
      return avatarPath
    }
    return gameImageBaseUrl ? `${gameImageBaseUrl}${avatarPath}` : avatarPath
  }

  const resolveCommentItemAvatar = (item: GameCommentListItem) => {
    if (isSameMember(item, getCurrentMemberIdentity())) {
      const currentUserAvatarUrl = normalizeQueryValue(getCurrentUserAvatarUrl())
      if (currentUserAvatarUrl) {
        return currentUserAvatarUrl
      }
    }
    return resolveCommentAvatar(item?.memberAvatar)
  }

  const handleCommentAvatarError = (comment: ReviewCommentViewItem) => {
    if (!comment) {
      return
    }

    if (isSameMember(comment, getCurrentMemberIdentity())) {
      const currentUserAvatarUrl = normalizeQueryValue(getCurrentUserAvatarUrl())
      if (currentUserAvatarUrl && comment.avatarUrl !== currentUserAvatarUrl) {
        comment.avatarUrl = currentUserAvatarUrl
        return
      }
    }

    if (comment.avatarUrl === defaultCommentAvatarUrl) {
      return
    }
    comment.avatarUrl = defaultCommentAvatarUrl
  }

  const mapCommentItem = (
    item: GameCommentListItem,
    index: number,
    fallbackPrefix = 'comment',
    subjectId = '',
    likeCacheMap: CommentLikeCacheMap = {}
  ): ReviewCommentViewItem => {
    const createTime = toSafeNumber(item?.createTime)
    const memberName =
      normalizeQueryValue(item?.memberName ?? item?.memberId) || t('gameDetail.anonymous')
    const id = normalizeQueryValue(item?.id ?? item?.rowId) || `${fallbackPrefix}-${index}`
    const likeStorageKey = createCommentLikeCacheKey(subjectId, id)
    const fallbackLikeCount = Math.max(0, Math.trunc(toSafeNumber(item?.likeCount)))
    const fallbackDislikeCount = Math.max(0, Math.trunc(toSafeNumber(item?.dislikeCount)))
    const cachedLike = getCommentLikeCacheByKey(likeCacheMap, likeStorageKey)

    return {
      id,
      memberId: normalizeQueryValue(item?.memberId ?? item?.memberName),
      memberName,
      content: normalizeQueryValue(item?.content),
      timeText: formatElapsedTime(createTime),
      avatarUrl: resolveCommentItemAvatar(item),
      isLiked: Boolean(cachedLike?.isLiked),
      isDisliked: Boolean(cachedLike?.isDisliked),
      likeStorageKey,
      likeCount: cachedLike ? normalizeLikeCount(cachedLike.likeCount) : fallbackLikeCount,
      dislikeCount: cachedLike
        ? normalizeLikeCount(
            cachedLike.isDisliked || cachedLike.dislikeCount > 0
              ? cachedLike.dislikeCount
              : fallbackDislikeCount
          )
        : fallbackDislikeCount,
      replyCount: Math.max(0, Math.trunc(toSafeNumber(item?.replyCount))),
      createTime,
      isChildrenExpanded: false,
      children: []
    }
  }

  const fetchChildCommentsForParent = async (
    parentComment: ReviewCommentViewItem,
    subjectId: string,
    sortType = currentSortType.value
  ) => {
    const parentId = normalizeQueryValue(parentComment.id)
    if (!parentId) {
      parentComment.children = []
      return
    }

    const { memberRowId } = getAcctInfoFromStorage()
    const memberRowIdNumber = Number(memberRowId)
    const validMemberRowId = Number.isFinite(memberRowIdNumber) ? memberRowIdNumber : undefined
    const commentLikeCacheMap = getCommentLikeCacheMap()

    try {
      const childrenRes = await Api.game.getCommentsList(
        {
          subjectId,
          sortType,
          current: 1,
          size: 100,
          parent: parentId,
          root: null,
          memberRowId: validMemberRowId
        },
        {
          showSuccessToast: false,
          showErrorToast: true
        }
      )
      parentComment.children = parseCommentRecords(childrenRes?.result).map(
        (childItem, childIndex) =>
          mapCommentItem(childItem, childIndex, `${parentId}-child`, subjectId, commentLikeCacheMap)
      )
      parentComment.replyCount = Math.max(parentComment.replyCount, parentComment.children.length)
    } catch (error) {
      console.error('get child comments failed', error)
      parentComment.children = []
    }
  }

  const applyPreviousCommentState = (
    nextComments: ReviewCommentViewItem[],
    previousComments: ReviewCommentViewItem[],
    preserveExpandedState = true
  ) => {
    const previousCommentMap = new Map(previousComments.map(comment => [comment.id, comment]))
    nextComments.forEach(comment => {
      const previous = previousCommentMap.get(comment.id)
      if (!previous) {
        return
      }
      if (preserveExpandedState) {
        comment.isChildrenExpanded = previous.isChildrenExpanded
        comment.children = previous.children
      }
    })
  }

  const requestCommentsList = async (
    subjectId: string,
    sortType = currentSortType.value,
    options: { refreshChildren?: boolean; preserveExpandedState?: boolean } = {}
  ) => {
    const { refreshChildren = true, preserveExpandedState = true } = options
    if (!subjectId) {
      commentList.value = []
      return
    }

    const { memberRowId } = getAcctInfoFromStorage()
    const memberRowIdNumber = Number(memberRowId)
    const validMemberRowId = Number.isFinite(memberRowIdNumber) ? memberRowIdNumber : undefined

    const shouldShowLoading = commentList.value.length === 0
    if (shouldShowLoading) {
      isCommentLoading.value = true
    }

    try {
      const commentLikeCacheMap = getCommentLikeCacheMap()
      const previousComments = commentList.value
      const res = await Api.game.getCommentsList(
        {
          subjectId,
          sortType,
          current: 1,
          size: 100,
          root: '0',
          parent: '0',
          memberRowId: validMemberRowId
        },
        {
          showSuccessToast: false,
          showErrorToast: true
        }
      )
      const rootComments = parseCommentRecords(res?.result).map((item, index) =>
        mapCommentItem(item, index, 'root-comment', subjectId, commentLikeCacheMap)
      )
      applyPreviousCommentState(rootComments, previousComments, preserveExpandedState)
      commentList.value = rootComments

      if (refreshChildren) {
        await Promise.all(
          commentList.value.map(item => fetchChildCommentsForParent(item, subjectId, sortType))
        )
      }
    } catch (error) {
      console.error('getCommentsList failed', error)
      commentList.value = []
    } finally {
      isCommentLoading.value = false
    }
  }

  const requestCommentSubject = async (options: { preserveExpandedState?: boolean } = {}) => {
    const gameId = currentGameId.value
    if (!gameId) {
      commentSubjectId.value = ''
      ratingCountFromSubject.value = 0
      commentList.value = []
      return
    }

    try {
      const { memberRowId } = getAcctInfoFromStorage()
      const res = await Api.game.getCommentSubject(
        {
          gameId,
          sortType: currentSortType.value,
          memberRowId: memberRowId || undefined
        },
        {
          showSuccessToast: false,
          showErrorToast: true
        }
      )
      const result = res?.result
      if (subjectCollectionsRef && result && typeof result === 'object') {
        const raw = (result as { isCollections?: unknown }).isCollections
        subjectCollectionsRef.value = readIsCollections(raw)
      }
      ratingCountFromSubject.value = Math.max(
        normalizePositiveInt(result?.scoreNum),
        normalizePositiveInt(result?.ratingNum),
        normalizePositiveInt(result?.ratingCount),
        normalizePositiveInt(result?.scoreCount),
        normalizePositiveInt(result?.commentNum),
        normalizePositiveInt(result?.commentCount),
        normalizePositiveInt(result?.total)
      )
      commentSubjectId.value = normalizeQueryValue(result?.subjectId ?? result?.id ?? result?.rowId)
      await requestCommentsList(commentSubjectId.value, currentSortType.value, options)
    } catch (error) {
      console.error('getCommentSubject failed', error)
      commentSubjectId.value = ''
      ratingCountFromSubject.value = 0
      commentList.value = []
    }
  }

  const selectSort = async (value: ReviewSortValue) => {
    /**
     *  排序类别：1，时间排序，2，点赞数，3，评论回复数(默认是1)
     *  private Integer sortType;
     */
    activeSort.value = value
    isSortPopupOpen.value = false
    await requestCommentSubject({ preserveExpandedState: false })
  }

  const openCommentPopup = () => {
    if (!requireLogin()) {
      return
    }
    replyTargetComment.value = null
    isCommentPopupOpen.value = true
  }

  const openReplyCommentPopup = (comment: ReviewCommentViewItem) => {
    if (!requireLogin()) {
      return
    }
    replyTargetComment.value = comment
    isCommentPopupOpen.value = true
  }

  const toggleLike = (comment: ReviewCommentViewItem) => {
    const likeStorageKey = normalizeQueryValue(comment.likeStorageKey)
    if (!likeStorageKey) {
      return
    }

    const nextIsLiked = !comment.isLiked
    const shouldDeductDislike = nextIsLiked && comment.isDisliked
    const nextLikeCount = nextIsLiked
      ? normalizeLikeCount(comment.likeCount + 1)
      : normalizeLikeCount(comment.likeCount - 1)
    const nextDislikeCount = shouldDeductDislike
      ? normalizeLikeCount(comment.dislikeCount - 1)
      : comment.dislikeCount

    comment.isLiked = nextIsLiked
    if (nextIsLiked) {
      comment.isDisliked = false
      if (shouldDeductDislike) {
        comment.dislikeCount = nextDislikeCount
      }
    }
    comment.likeCount = nextLikeCount
    setCommentLikeCacheByKey(likeStorageKey, {
      isLiked: nextIsLiked,
      isDisliked: comment.isDisliked,
      likeCount: nextLikeCount,
      dislikeCount: normalizeLikeCount(comment.dislikeCount)
    })
  }

  const toggleDislike = (comment: ReviewCommentViewItem) => {
    const likeStorageKey = normalizeQueryValue(comment.likeStorageKey)
    if (!likeStorageKey) {
      return
    }

    const nextIsDisliked = !comment.isDisliked
    const shouldDeductLike = nextIsDisliked && comment.isLiked
    const nextDislikeCount = nextIsDisliked
      ? normalizeLikeCount(comment.dislikeCount + 1)
      : normalizeLikeCount(comment.dislikeCount - 1)
    const nextLikeCount = shouldDeductLike
      ? normalizeLikeCount(comment.likeCount - 1)
      : comment.likeCount

    if (shouldDeductLike) {
      comment.isLiked = false
      comment.likeCount = nextLikeCount
    }
    comment.isDisliked = nextIsDisliked
    comment.dislikeCount = nextDislikeCount

    setCommentLikeCacheByKey(likeStorageKey, {
      isLiked: comment.isLiked,
      isDisliked: nextIsDisliked,
      likeCount: normalizeLikeCount(comment.likeCount),
      dislikeCount: nextDislikeCount
    })
  }

  const toggleChildrenVisible = (comment: ReviewCommentViewItem) => {
    if (!comment.children.length) {
      return
    }
    comment.isChildrenExpanded = !comment.isChildrenExpanded
  }

  const submitComment = async (content: string) => {
    if (!requireLogin()) {
      return
    }

    const commentContent = String(content ?? '').trim()
    if (!commentContent) {
      return
    }

    let subjectId = commentSubjectId.value
    if (!subjectId) {
      await requestCommentSubject()
      subjectId = commentSubjectId.value
    }
    if (!subjectId) {
      console.error('publishComment skipped: subjectId is empty')
      return
    }

    const { memberId, memberRowId } = getAcctInfoFromStorage()
    const memberRowIdNumber = Number(memberRowId)
    if (!memberId || !Number.isFinite(memberRowIdNumber)) {
      console.error('publishComment skipped: memberId/memberRowId is invalid')
      return
    }

    try {
      const replyTarget = replyTargetComment.value
      const replyParentId = normalizeQueryValue(replyTarget?.id)
      const isReplyComment = Boolean(replyParentId)
      await Api.game.publishComment(
        {
          subjectId,
          memberId,
          memberRowId: Math.trunc(memberRowIdNumber),
          content: commentContent,
          root: isReplyComment ? '1' : '0',
          parent: isReplyComment ? replyParentId : '0',
          replyIndex: ''
        },
        {
          showSuccessToast: false,
          showErrorToast: true
        }
      )

      if (isReplyComment && replyParentId) {
        const parentComment = commentList.value.find(item => item.id === replyParentId)
        if (parentComment) {
          await fetchChildCommentsForParent(parentComment, subjectId)
          parentComment.isChildrenExpanded = true
        }
      } else {
        await requestCommentsList(subjectId, currentSortType.value, { refreshChildren: false })
      }

      replyTargetComment.value = null
    } catch (error) {
      console.error('publishComment failed', error)
    }
  }

  const handleSortMenuOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node
    if (sortMenuRef.value?.contains(target)) {
      return
    }
    if (sortMenuPopupRef.value?.contains(target)) {
      return
    }
    isSortPopupOpen.value = false
  }

  watch(isCommentPopupOpen, isOpen => {
    if (!isOpen) {
      replyTargetComment.value = null
    }
  })

  return {
    ratingCountFromSubject,
    loadedCommentCount,
    hasCurrentUserComment,
    isCommentLoading,
    sortedCommentList,
    sortMenuRef,
    sortMenuPopupRef,
    isSortPopupOpen,
    activeSort,
    sortOptions,
    isCommentPopupOpen,
    commentInputPlaceholder,
    selectSort,
    openCommentPopup,
    openReplyCommentPopup,
    toggleLike,
    toggleDislike,
    toggleChildrenVisible,
    submitComment,
    handleCommentAvatarError,
    requestCommentSubject,
    handleSortMenuOutsideClick
  }
}
