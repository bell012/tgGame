export type ApiBusinessResponse = {
  code?: string
  success?: boolean
  message?: string
}

export class ApiBusinessError extends Error {
  code?: string

  constructor(response?: ApiBusinessResponse, fallbackMessage = 'Business request failed') {
    super(response?.message || fallbackMessage)
    this.name = 'ApiBusinessError'
    this.code = response?.code
  }
}

export const isApiBusinessSuccess = (response?: ApiBusinessResponse) => {
  if (typeof response?.code === 'string') {
    return response.code === 'C2'
  }

  return response?.success === true
}

export const ensureApiBusinessSuccess = <T extends ApiBusinessResponse>(
  response: T,
  fallbackMessage = 'Business request failed'
) => {
  if (isApiBusinessSuccess(response)) {
    return response
  }

  throw new ApiBusinessError(response, fallbackMessage)
}
