/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-svg-loader" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  export interface GlobalComponents {
    SmartImage: (typeof import('@/components/common/SmartImage.vue'))['default']
  }
}

// SVG 作为组件导入
declare module '*.svg?component' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module '*.svg?skipsvgo' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module '*.svg?url' {
  const content: string
  export default content
}

// SVG 作为 URL 导入（默认）
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.avif' {
  const content: string
  export default content
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_GAME_IMAGE_BASE_URL: string
    readonly VITE_SITE_CODE: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

declare module 'axios' {
  interface AxiosRequestConfig {
    directEncryptedPayload?: boolean
    skipRequestEncryption?: boolean
  }
}

export {}
