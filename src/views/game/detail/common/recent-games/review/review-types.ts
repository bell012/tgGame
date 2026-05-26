export type ReviewCommentViewItem = {
  id: string
  memberId: string
  memberName: string
  content: string
  timeText: string
  avatarUrl: string
  isLiked: boolean
  isDisliked: boolean
  likeStorageKey: string
  likeCount: number
  dislikeCount: number
  replyCount: number
  createTime: number
  isChildrenExpanded: boolean
  children: ReviewCommentViewItem[]
}
