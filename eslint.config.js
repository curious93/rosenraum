// @ts-check
import nextConfig from 'eslint-config-next'
import jsdoc from 'eslint-plugin-jsdoc'

const config = [
  ...nextConfig,

  // JSDoc enforcement — alle exportierten APIs müssen dokumentiert sein
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': ['error', {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true,
        },
        contexts: [
          'TSTypeAliasDeclaration',
          'TSInterfaceDeclaration',
        ],
      }],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'error',
    },
  },

  // Vendored shadcn/ui primitives + dev-only preview pages are exempt from the
  // JSDoc-everything rule — they stay idiomatic so they remain upgradable.
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/app/(preview)/**/*.{ts,tsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
    },
  },
]

export default config
