import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // core no-unused-vars does not see JSX use like <motion.div>, or a component
      // renamed while destructuring a param ({ icon: Icon }) and rendered as <Icon />
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^(?:[A-Z_]|motion$)', argsIgnorePattern: '^[A-Z_]' },
      ],
    },
  },
  {
    // shadcn primitives export variant helpers and contexts export hooks next to
    // their component; fast refresh just does a full reload for these files
    files: ['src/components/ui/**', 'src/contexts/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
