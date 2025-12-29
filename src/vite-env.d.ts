/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// SVG 作为组件导入
declare module '*.svg?component' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

// SVG 作为 URL 导入（默认）
declare module '*.svg' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
