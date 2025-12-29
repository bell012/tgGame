export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16, // 1rem = 16px
      unitPrecision: 5, // rem 单位的小数位数
      propList: ['*'], // 需要转换的属性，* 表示所有
      selectorBlackList: [], // 不转换的选择器
      replace: true, // 直接替换而不是添加备用属性
      mediaQuery: false, // 是否转换媒体查询中的 px
      minPixelValue: 0, // 最小转换的 px 值
    },
  },
}

