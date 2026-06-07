// @ts-check
import nextConfig from 'eslint-config-next'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
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
]
