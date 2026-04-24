import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'
import { VitePWA } from 'vite-plugin-pwa'
import svgLoader from 'vite-svg-loader'

const themedSvgColorPattern = /^(?:white|#fff(?:fff)?|#b3bec1)$/i
const convertibleImagePattern = /\.(png|jpe?g)$/i

const createWebpAssetsPlugin = (): Plugin => ({
  name: 'tg-game:webp-assets',
  apply: 'build',
  enforce: 'post',
  async generateBundle(_, bundle) {
    const assetEntries = Object.entries(bundle).filter(([, output]) => {
      return output.type === 'asset' && convertibleImagePattern.test(output.fileName)
    })

    await Promise.all(
      assetEntries.map(async ([, output]) => {
        if (output.type !== 'asset') {
          return
        }

        const sourceBuffer =
          typeof output.source === 'string'
            ? Buffer.from(output.source)
            : Buffer.from(output.source)
        const webpSource = await imagemin.buffer(sourceBuffer, {
          plugins: [
            imageminWebp({
              quality: 80
            })
          ]
        })

        this.emitFile({
          type: 'asset',
          fileName: output.fileName.replace(convertibleImagePattern, '.webp'),
          source: webpSource
        })
      })
    )
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                cleanupIds: false // 保留 ID，避免冲突
              }
            }
          },
          {
            name: 'convertColors',
            params: {
              currentColor: themedSvgColorPattern
            }
          },
          {
            name: 'addClassesToSVGElement',
            params: {
              className: 'svg-icon'
            }
          },
          {
            name: 'prefixIds' // 为每个 SVG 的 ID 添加唯一前缀
          }
        ]
      }
    }),
    createWebpAssetsPlugin(),
    viteImagemin({
      filter: /\.(png|jpe?g)$/i,
      mozjpeg: {
        quality: 80
      },

      pngquant: {
        // png 压缩
        quality: [0.7, 0.85],
        speed: 4
      },

      optipng: false,
      svgo: false,
      gifsicle: false,
      jpegTran: false
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mask-icon.svg'],
      manifest: {
        name: 'TG Game',
        short_name: 'TGGame',
        description: 'A Vue3 + TypeScript + Pinia + Tailwind CSS PWA Application',
        theme_color: '#42b883',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: []
        // icons: [
        //   {
        //     src: 'pwa-192x192.png',
        //     sizes: '192x192',
        //     type: 'image/png'
        //   },
        //   {
        //     src: 'pwa-512x512.png',
        //     sizes: '512x512',
        //     type: 'image/png'
        //   },
        //   {
        //     src: 'pwa-512x512.png',
        //     sizes: '512x512',
        //     type: 'image/png',
        //     purpose: 'any maskable'
        //   }
        // ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // 不缓存 index.html，确保每次都能获取最新版本
        globPatterns: ['**/*.{js,css,ico,png,webp,svg,json,woff2}'],
        // 排除 index.html
        globIgnores: ['**/index.html'],
        // 导航请求使用网络优先策略
        navigateFallback: null,
        runtimeCaching: [
          {
            // index.html 使用网络优先策略，确保总是获取最新版本
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 // 24 小时
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://web.txtvv9.top/v1',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
