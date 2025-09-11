// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/no-multiple-template-root': 'off',
    'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    '@stylistic/semi': 'off',
    '@stylistic/comma-dangle': 'off',
    '@stylistic/arrow-parens': 'off',
    'vue/comma-dangle': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
});
