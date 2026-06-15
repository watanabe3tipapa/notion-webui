import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {}),
};
