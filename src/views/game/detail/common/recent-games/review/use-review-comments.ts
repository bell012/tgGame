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

type UseReviewCommentsOptions = {
  currentGameId: Ref<string>
  gameImageBaseUrl: string
  defaultCommentAvatarUrl: string
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
  const { currentGameId, gameImageBaseUrl, defaultCommentAvatarUrl, requireLogin, t } = options

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

  const handleCommentAvatarError = (comment: ReviewCommentViewItem) => {
    if (!comment || comment.avatarUrl === defaultCommentAvatarUrl) {
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
      memberName,
      content: normalizeQueryValue(item?.content),
      timeText: formatElapsedTime(createTime),
      avatarUrl: resolveCommentAvatar(item?.memberAvatar),
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

  const requestCommentsList = async (subjectId: string, sortType = currentSortType.value) => {
    if (!subjectId) {
      commentList.value = []
      return
    }

    const { memberRowId } = getAcctInfoFromStorage()
    const memberRowIdNumber = Number(memberRowId)
    const validMemberRowId = Number.isFinite(memberRowIdNumber) ? memberRowIdNumber : undefined

    isCommentLoading.value = true
    try {
      const commentLikeCacheMap = getCommentLikeCacheMap()
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
      commentList.value = rootComments

      await Promise.all(
        commentList.value.map(async item => {
          const parentId = normalizeQueryValue(item.id)
          if (!parentId) {
            item.children = []
            return
          }

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
            item.children = parseCommentRecords(childrenRes?.result).map((childItem, childIndex) =>
              mapCommentItem(
                childItem,
                childIndex,
                `${parentId}-child`,
                subjectId,
                commentLikeCacheMap
              )
            )
          } catch (error) {
            console.error('get child comments failed', error)
            item.children = []
          }
        })
      )
    } catch (error) {
      console.error('getCommentsList failed', error)
      commentList.value = []
    } finally {
      isCommentLoading.value = false
    }
  }

  const requestCommentSubject = async () => {
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
      await requestCommentsList(commentSubjectId.value, currentSortType.value)
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
    await requestCommentSubject()
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
      const replyParentId = normalizeQueryValue(replyTargetComment.value?.id)
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
      await requestCommentsList(subjectId)
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
