import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint'
import fs from 'node:fs'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

const gitignore = fs.existsSync('.gitignore')
  ? fs.readFileSync('.gitignore', 'utf-8').split('\n').filter(Boolean)
  : []
export default [
  {
    ignores: [...gitignore, 'node_modules', 'dist', 'dev-dist']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      vue
    },
    rules: {
      ...vue.configs['flat/recommended'].rules
    }
  },
  {
    plugins: {
      prettier: prettierPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'prettier/prettier': 'error'
    }
  },
  prettierConfig
]
