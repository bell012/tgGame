/**
 * 图片上传相关接口类型定义
 */

/**
 * 上传图片接口
 */
export interface UploadPictureForm {
  file: Blob | File
  fileName?: string
}

export interface UploadPictureResult {
  headPortrait?: string
  url?: string
  path?: string
  fileName?: string
}

export interface UploadPictureResponse {
  code: string
  message: string
  success: boolean
  result?: string | UploadPictureResult
}
