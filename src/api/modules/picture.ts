import {
  buildCommonRequestHeaders,
  normalizeApiResponseMessage,
  resolveRequestUrl,
  shouldHandleAuthExpiredCode,
  triggerAuthExpiredLogout
} from '@/utils/request'
import type { UploadPictureForm, UploadPictureResponse } from '@/api/interface/picture'

/**
 * 上传头像图片
 */
async function parseUploadResponse(response: Response): Promise<UploadPictureResponse> {
  const rawText = await response.text()

  if (!rawText) {
    return {
      code: String(response.status),
      message: response.statusText,
      success: response.ok
    }
  }

  try {
    return JSON.parse(rawText) as UploadPictureResponse
  } catch {
    return {
      code: String(response.status),
      message: rawText,
      success: response.ok,
      result: rawText
    }
  }
}

export async function upload({
  file,
  fileName
}: UploadPictureForm): Promise<UploadPictureResponse> {
  const formData = new FormData()

  if (fileName) {
    formData.append('file', file, fileName)
  } else {
    formData.append('file', file)
  }

  const response = await fetch(resolveRequestUrl('/picture/upload'), {
    method: 'POST',
    headers: buildCommonRequestHeaders('/picture/upload'),
    body: formData
  })

  const result = normalizeApiResponseMessage(await parseUploadResponse(response))

  if (response.status === 401 || shouldHandleAuthExpiredCode(result.code)) {
    triggerAuthExpiredLogout()
    throw new Error(result.message || response.statusText || '登录已失效，请重新登录')
  }

  if (!response.ok) {
    throw new Error(result.message || response.statusText || 'Upload failed')
  }

  return result
}
