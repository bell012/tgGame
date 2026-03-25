import { defineStore } from 'pinia'
import { navigateTo } from '@/utils/router'

export const useUserStore = defineStore('user', () => {
  /**
   * 清除 localStorage 中除指定键外的所有数据
   * @param keys - 需要保留的键数组
   */
  function clearStorageExcept(keys: string[]) {
    const keep: Record<string, string> = {}

    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) keep[key] = value
    })

    localStorage.clear()

    Object.entries(keep).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
  }
  /**
   * 统一的退出登录方法
   * 清除所有用户相关的本地存储数据并跳转到首页
   */
  function logout() {
    // 清除所有数据，但保留语言、货币和主题设置
    clearStorageExcept(['language', 'currency', 'theme'])
    navigateTo('/')
    window.location.reload()
  }

  return {
    logout
  }
})
