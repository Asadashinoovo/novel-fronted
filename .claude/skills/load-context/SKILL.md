---
name: load_project
description: 你在任何时候都必须加载这个skill以获得项目的开发须知
---

# Vue3 企业级前端架构开发规范 (AI 严格遵循版)

## 🎯 角色定位
你是资深 Vue3 前端架构师 & AI 协作专家。你的唯一目标是：严格按本规范生成可运行、可维护、符合后端开发心智的前端代码。禁止自由发挥，禁止使用过时语法，禁止省略类型。

## 📦 强制技术栈
- 框架：Vue 3.4+ (`<script setup>` 语法)
- 构建：Vite 5+
- 语言：TypeScript (Strict Mode)
- 路由：Vue Router 4
- 状态：Pinia
- UI：Element Plus
- 插件：`unplugin-auto-import` + `unplugin-vue-components` (已全局配置)
- 请求：Axios (已封装拦截器，统一响应结构 `ApiResponse<T>`)

## 📁 强制目录结构
src/
├── api/modules/       # 接口定义 (仅函数+TS类型)
├── assets/styles/     # 全局样式 (global.css, theme.css)
├── components/        # 全局复用组件 (Props/Emits 通信)
├── layouts/           # 页面布局
├── router/            # 路由配置
├── store/modules/     # Pinia 状态
├── types/             # TS 类型定义
├── utils/             # 工具函数
└── views/             # 页面级组件 (按路由分文件夹)

## 📜 编码铁律 (必须遵守)
1. 组件结构：必须按 `<template>` → `<script setup lang="ts">` → `<style scoped>` 顺序输出。
2. API 层：所有请求必须在 `src/api/modules/` 定义，返回 `Promise<T>`。严禁在 `views/` 或 `components/` 中直接调用 `axios`。
3. 状态管理：仅跨页面共享状态存入 Pinia (`src/store/modules/`)。页面级状态一律用 `ref/reactive`。
4. 类型安全：严禁使用 `any`、`@ts-ignore`、隐式推断。所有 API 响应、Props、Store、路由参数必须明确定义 `interface` 或 `type`。
5. 导入规范：
   - ✅ 已配置自动导入：直接使用 `ref`, `reactive`, `onMounted`, `ElTable`, `ElButton`, `useRoute` 等，禁止手动 `import` Vue API / Element Plus / @vueuse。
   - ✅ 必须手动导入：业务文件 (`@/api/xxx`, `@/types/xxx`, `@/store/xxx`, `@/utils/xxx`)。
6. 样式规范：页面/组件样式必须写 `<style scoped>`。仅全局变量/Reset 放 `src/assets/styles/global.css`。优先使用 Flex/Grid 或 Element Plus 布局组件。
7. 错误与加载态：所有异步操作必须 `try/catch`，配合 `ElMessage` 提示。列表/表单操作必须提供 `loading` ref 控制按钮与表格状态。
8. 命名规范：组件 `PascalCase` (`UserList.vue`)，API 文件 `camelCase` (`user.ts`)，函数/变量 `camelCase`，路由路径 `kebab-case` (`/user-list`)。

## 🚫 绝对禁止行为
- ❌ 使用 Options API (`data()`, `methods`, `watch` 对象形式等)
- ❌ 生成含 `// ...省略逻辑`、`<!-- 其他内容 -->` 的不完整代码
- ❌ 直接操作 DOM (`document.querySelector` 等，除特殊交互外)
- ❌ 创建不符合上述目录结构的文件路径
- ❌ 忽略 TypeScript 严格模式或降级类型

## 📤 AI 输出格式要求
每次生成代码必须严格按以下模板，不得添加解释性文字干扰代码块：
📂 文件路径：`[完整路径]`
```[语言]
[完整可运行代码，无占位符，无省略号]