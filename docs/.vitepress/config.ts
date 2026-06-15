import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Notion WebUI',
  description: 'Zed Editor → Notion コンテンツ送信 & Obsidian連携ツール',
  lang: 'ja-JP',
  base: '/notion-webui/',
  lastUpdated: true,
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'Notion WebUI',
    nav: [
      { text: 'ガイド', link: '/guide/quickstart', activeMatch: '/guide/' },
      { text: 'API', link: '/guide/api-reference', activeMatch: '/api/' },
    ],
    sidebar: [
      {
        text: 'はじめに',
        items: [
          { text: '概要', link: '/' },
          { text: 'クイックスタート', link: '/guide/quickstart' },
        ],
      },
      {
        text: '使い方',
        items: [
          { text: '基本操作', link: '/guide/usage' },
          { text: '設定', link: '/guide/configuration' },
        ],
      },
      {
        text: '連携機能',
        items: [
          { text: 'Zed 拡張', link: '/guide/zed-extension' },
          { text: 'Obsidian 連携', link: '/guide/obsidian-integration' },
        ],
      },
      {
        text: 'リファレンス',
        items: [
          { text: 'API リファレンス', link: '/guide/api-reference' },
          { text: 'デプロイ', link: '/guide/deployment' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/watanabe3tipapa/notion-webui' },
    ],
    footer: {
      message: 'MIT License',
    },
    editLink: {
      pattern: 'https://github.com/watanabe3tipapa/notion-webui/edit/main/docs/:path',
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/notion-webui/favicon.svg' }],
    ['meta', { name: 'og:title', content: 'Notion WebUI' }],
    ['meta', { name: 'og:description', content: 'Zed Editor → Notion コンテンツ送信 & Obsidian連携ツール' }],
  ],
});
