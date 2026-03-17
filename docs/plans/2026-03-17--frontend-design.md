# Prediction Market Tools — Frontend Design Document

> Version: 0.1
> Date: 2026-03-17
> Author: claude-coder + xiaoxiaff
> Repo: prediction-market-tools-web (独立前端仓库)

---

## 1. 产品定位与设计目标

### 1.1 一句话定位
**为预测市场 Trader 打造的 AI 驱动决策工具平台** — 从数据采集到信号输出，全流程可拆分订阅。

### 1.2 设计目标
- **科技感 + 专业感**：暗色系为主，数据可视化突出，一眼看出是金融/交易工具
- **清楚明了**：复杂数据简洁呈现，每个模块的价值 3 秒内可理解
- **适合传播**：Landing page 有冲击力，截图即可传播产品价值
- **模块可分售**：每个功能模块在 UI 上独立展示，支持分开定价

---

## 2. 视觉风格系统

### 2.1 风格方向
**Dark Glassmorphism + Data-Dense Dashboard**
- 基础：OLED Dark Mode（深黑背景 #0A0E1A）
- 亮点：Glassmorphism 毛玻璃卡片（半透明 + backdrop-blur）
- 数据：高密度但清晰的图表和数字
- 动效：微交互 + 数据实时更新动画

### 2.2 配色方案（Design Tokens）

```css
:root {
  /* Background */
  --bg-primary: #0A0E1A;        /* 主背景 - 深空蓝黑 */
  --bg-secondary: #111827;      /* 次级背景 */
  --bg-card: rgba(17, 24, 39, 0.7); /* 卡片背景（毛玻璃） */
  --bg-card-hover: rgba(17, 24, 39, 0.85);
  --bg-elevated: rgba(30, 41, 59, 0.5);

  /* Brand */
  --brand-primary: #8B5CF6;     /* 紫色 - 科技/AI 感 */
  --brand-secondary: #F59E0B;   /* 金色 - 信任/价值 */
  --brand-accent: #06B6D4;      /* 青色 - 数据/信息 */

  /* Semantic */
  --color-success: #22C55E;     /* 看涨/正收益 */
  --color-danger: #EF4444;      /* 看跌/负收益 */
  --color-warning: #F59E0B;     /* 警告/关注 */
  --color-info: #3B82F6;        /* 信息/中性 */

  /* Text */
  --text-primary: #F8FAFC;      /* 主文本 - 近白 */
  --text-secondary: #94A3B8;    /* 次级文本 */
  --text-muted: #475569;        /* 弱化文本 */

  /* Border */
  --border-default: rgba(148, 163, 184, 0.1);
  --border-hover: rgba(148, 163, 184, 0.2);
  --border-glass: rgba(255, 255, 255, 0.08);

  /* Effects */
  --glass-blur: 16px;
  --glass-opacity: 0.7;
  --glow-primary: 0 0 20px rgba(139, 92, 246, 0.3);
  --glow-success: 0 0 10px rgba(34, 197, 94, 0.2);
  --glow-danger: 0 0 10px rgba(239, 68, 68, 0.2);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Typography */
  --font-sans: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-hero: clamp(2.5rem, 6vw, 5rem);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

### 2.3 字体方案

| 用途 | 字体 | 权重 |
|------|------|------|
| Display/Hero | Space Grotesk | 700 |
| Body | Inter | 400, 500, 600 |
| Data/数字 | JetBrains Mono | 400, 500 |
| 中文 | Noto Sans SC (fallback) | 400, 500, 700 |

### 2.4 毛玻璃卡片组件

```css
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-normal);
}

.glass-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), var(--glow-primary);
}
```

---

## 3. 页面架构

### 3.1 网站地图

```
/                          → Landing Page（营销首页）
/app                       → Dashboard 主界面
/app/scanner               → Market Scanner（市场扫描）
/app/signals               → Signal Board（信号面板）
/app/arbitrage             → Arbitrage Detector（套利检测）
/app/portfolio             → Portfolio（持仓管理）
/app/backtest              → Backtest Engine（回测引擎）
/app/alerts                → Alert Settings（提醒设置）
/pricing                   → Pricing（定价页 - 模块化定价）
/docs                      → Documentation
/blog                      → Blog / 市场分析
```

### 3.2 模块化可售卖设计

每个功能模块在 UI 和定价上独立：

| 模块 | 路由 | 可独立售卖 | 定价层级 |
|------|------|-----------|---------|
| 🔍 Market Scanner | /app/scanner | ✅ | Free / Basic |
| 📡 Signal Engine | /app/signals | ✅ | Pro |
| ⚡ Arbitrage Detector | /app/arbitrage | ✅ | Pro+ |
| 📊 Portfolio Tracker | /app/portfolio | ✅ | Basic |
| 🧪 Backtest Engine | /app/backtest | ✅ | Pro |
| 🔔 Smart Alerts | /app/alerts | ✅ | Basic |
| 🤖 AI Probability | (integrated) | ✅ | Pro+ |
| 📦 Full Suite | /app/* | ✅ | Enterprise |

---

## 4. 页面详细设计

### 4.1 Landing Page（营销首页）

**目标**：3 秒内让访客理解产品价值，展示科技感

**结构**：
```
┌─────────────────────────────────────────────────────────┐
│ NAV: Logo | Products | Pricing | Docs | [Sign Up] [Login]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO SECTION (100vh)                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ "Prediction Markets,                              │  │
│  │  Decoded by AI."                                  │  │
│  │                                                   │  │
│  │ 副标题: Real-time data + AI analysis =            │  │
│  │         Higher win rate for traders               │  │
│  │                                                   │  │
│  │ [Start Free Trial]  [Watch Demo →]                │  │
│  │                                                   │  │
│  │ ┌─ Live Dashboard Preview (动态截图/动画) ──────┐ │  │
│  │ │  实时跳动的数据、概率变化、Edge 信号          │ │  │
│  │ └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  背景: 深色 + 流动渐变网格 + 微粒子动效                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SOCIAL PROOF BAR                                       │
│  "Trusted by 1,200+ traders" | 实时 P&L 统计            │
│  Client logos / 交易所 logos                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HOW IT WORKS (3 步)                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 1. COLLECT│  │ 2. ANALYZE│  │ 3. SIGNAL│              │
│  │ 多源数据  │→│ AI + 算法 │→│ Edge提醒 │              │
│  │ 采集      │  │ 深度分析  │  │ 智能仓位 │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PRODUCT MODULES (可拆分售卖展示)                        │
│  ┌───────────────┐  ┌───────────────┐                   │
│  │ 🔍 Market     │  │ 📡 Signal     │                   │
│  │   Scanner     │  │   Engine      │                   │
│  │ 实时监控所有  │  │ AI概率估算 +  │                   │
│  │ 市场变化      │  │ Edge检测      │                   │
│  │ [Free]        │  │ [Pro]         │                   │
│  └───────────────┘  └───────────────┘                   │
│  ┌───────────────┐  ┌───────────────┐                   │
│  │ ⚡ Arbitrage  │  │ 🧪 Backtest  │                   │
│  │   Detector    │  │   Engine      │                   │
│  │ 跨平台套利   │  │ 历史验证策略  │                   │
│  │ 机会发现      │  │ 真实edge      │                   │
│  │ [Pro+]        │  │ [Pro]         │                   │
│  └───────────────┘  └───────────────┘                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LIVE DEMO SECTION                                      │
│  嵌入式 dashboard 预览（mock 数据实时滚动）              │
│  展示：市场热力图 + Edge 排行 + 信号流                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PRICING SECTION                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐              │
│  │ Free │  │Basic │  │ Pro  │  │Pro+    │              │
│  │$0    │  │$29/mo│  │$79/mo│  │$149/mo │              │
│  │Scanner│  │+Port │  │+Signal│  │+Arb   │              │
│  │      │  │+Alert│  │+Back │  │+AI全部 │              │
│  └──────┘  └──────┘  └──────┘  └────────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CTA SECTION                                            │
│  "Stop guessing. Start trading with edge."              │
│  [Start Free Trial — No Credit Card Required]           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

**Hero 背景动效**：
- 深色底 + 流动的蓝紫渐变网格（grid mesh animation）
- 微粒子效果（代表数据流动）
- 类似 Linear.app / Stripe 的质感

---

### 4.2 Dashboard — Market Scanner

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR        │  MAIN CONTENT                          │
│ ┌────────────┐ │  ┌──────────────────────────────────┐  │
│ │ 🏠 Overview│ │  │ FILTER BAR                       │  │
│ │ 🔍 Scanner │ │  │ Platform ▼ | Category ▼ | Edge ▼│  │
│ │ 📡 Signals │ │  └──────────────────────────────────┘  │
│ │ ⚡ Arb     │ │                                        │
│ │ 📊 Portf.  │ │  ┌──── KPI CARDS ──────────────────┐  │
│ │ 🧪 Backtest│ │  │ Active   │ Edge>5%  │ Hot     │  │  │
│ │ 🔔 Alerts  │ │  │ Markets  │ Markets  │ Markets │  │  │
│ │            │ │  │ 1,247    │ 23       │ 8       │  │  │
│ │ ─────────  │ │  └──────────────────────────────────┘  │
│ │ ⚙ Settings│ │                                        │
│ │ 📖 Docs   │ │  ┌──── MARKET TABLE ────────────────┐  │
│ └────────────┘ │  │ Market      │ Price │ Edge │Vol │  │
│                │  │ ────────────┤───────┤──────┤────│  │
│                │  │ 🟢 US Elec. │ 0.62  │+8.3% │$2M │  │
│                │  │ 🔴 BTC>100k │ 0.45  │-3.1% │$1M │  │
│                │  │ 🟢 Fed Rate │ 0.71  │+5.7% │$5M │  │
│                │  │ ...         │       │      │    │  │
│                │  └──────────────────────────────────┘  │
│                │                                        │
│                │  ┌──── MARKET HEATMAP ──────────────┐  │
│                │  │ (彩色方块热力图 - 按 Edge 着色)   │  │
│                │  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Dashboard — Signal Board

```
┌──────────────────────────────────────────────────────────┐
│  REAL-TIME SIGNAL FEED              │  MARKET DETAIL     │
│  ┌────────────────────────────────┐ │  ┌──────────────┐  │
│  │ 🟢 12:03 LLM Edge +7.2%      │ │  │ US Election   │  │
│  │   US Election 2028 - YES       │ │  │ 2028          │  │
│  │   Fair: 0.67  Market: 0.60    │ │  │              │  │
│  │   Kelly: 8% position          │ │  │ 📈 Price     │  │
│  │   Confidence: 0.82            │ │  │ Chart        │  │
│  ├────────────────────────────────┤ │  │ (实时K线)    │  │
│  │ ⚡ 12:01 Arb Opportunity      │ │  │              │  │
│  │   BTC>100k @ Poly vs Kalshi   │ │  │ 📊 Edge      │  │
│  │   Spread: 3.2%  Est. PnL: $48│ │  │ History      │  │
│  ├────────────────────────────────┤ │  │              │  │
│  │ 📰 11:58 Sentiment Shift     │ │  │ 🧠 AI        │  │
│  │   Fed Rate - Bearish →Bullish │ │  │ Reasoning    │  │
│  │   Twitter sentiment: +0.34   │ │  │ (可展开)     │  │
│  └────────────────────────────────┘ │  └──────────────┘  │
│                                     │                    │
│  COMPOSITE SIGNAL GAUGE             │  POSITION SIZE     │
│  ┌────────────────────────────────┐ │  CALCULATOR        │
│  │  ◄═══════════●══════════►     │ │  ┌──────────────┐  │
│  │  SELL      0.72 EDGE     BUY  │ │  │ Bankroll:$1k │  │
│  │  [Signals breakdown ▼]        │ │  │ Kelly: $80   │  │
│  └────────────────────────────────┘ │  │ [Trade →]    │  │
│                                     │  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 4.4 Dashboard — Arbitrage Detector

```
┌──────────────────────────────────────────────────────────┐
│  ARBITRAGE OPPORTUNITIES                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Event          │ Poly  │ Kalshi│ Spread│ Est PnL  │  │
│  │ ───────────────┤───────┤───────┤───────┤──────────│  │
│  │ 🔥 US Elec.   │ 0.62  │ 0.58  │ 4.0%  │ $120     │  │
│  │ ⚡ Fed Rate   │ 0.71  │ 0.68  │ 3.0%  │ $90      │  │
│  │ 📊 BTC Price  │ 0.45  │ 0.43  │ 2.0%  │ $60      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ CROSS-PLATFORM PRICE CHART ──────────────────────┐  │
│  │  (双线叠加 - Polymarket vs Kalshi 实时价格)        │  │
│  │  阴影区域 = spread = 套利空间                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 5. 关键交互与动效

### 5.1 数据实时更新
- 价格变化时数字**闪烁**（绿涨红跌，200ms fade）
- 新信号到达时卡片**从右滑入** + 轻微脉冲发光
- Edge 值变化时 gauge 指针**平滑过渡**

### 5.2 Landing Page 动效
- Hero 区域：渐变 mesh 背景缓慢流动（8s loop）
- 数据粒子：微小光点从左向右流动（代表数据流）
- 模块卡片：scroll-triggered fade-in + slight lift
- Live demo section：嵌入式 dashboard 用 mock 数据自动播放

### 5.3 仪表盘微交互
- 卡片 hover：背景亮度提升 + 边框发光
- 表格行 hover：背景高亮 + 展开 mini chart
- 数字变化：count-up 动画
- 图表：tooltip 跟随鼠标，显示详细数据

---

## 6. 技术栈

| 层 | 技术选型 | 理由 |
|----|---------|------|
| Framework | **Next.js 15** (App Router) | SSR + 路由 + 性能 |
| UI Library | **shadcn/ui** + **Tailwind CSS** | 高质量组件 + 快速开发 |
| Charts | **Recharts** + **Lightweight Charts** (TradingView) | 金融图表专业 |
| Animation | **Framer Motion** | 流畅微交互 |
| State | **Zustand** | 轻量状态管理 |
| Data Fetching | **TanStack Query** | 缓存 + 实时更新 |
| Mock Data | **MSW (Mock Service Worker)** | V1 mock → 后续无缝切真实 API |
| Deployment | **Vercel** | Next.js 最佳部署 |

---

## 7. Mock 数据策略（V1）

所有数据通过 **MSW (Mock Service Worker)** 拦截，后续只需替换 API endpoint。

```typescript
// src/mocks/handlers.ts
export const handlers = [
  // Market Scanner
  http.get('/api/markets', () => {
    return HttpResponse.json(generateMockMarkets())
  }),

  // Signals
  http.get('/api/signals', () => {
    return HttpResponse.json(generateMockSignals())
  }),

  // Portfolio
  http.get('/api/portfolio', () => {
    return HttpResponse.json(generateMockPortfolio())
  }),
]
```

Mock 数据要求：
- **真实感**：使用真实的预测市场名称、合理的价格和概率
- **动态**：每次刷新略有变化，模拟实时数据
- **覆盖全状态**：包含涨/跌/中性、高/低 Edge、多/少持仓等场景

---

## 8. 项目结构

```
prediction-market-tools-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Landing + Pricing (公开页面)
│   │   │   ├── page.tsx        # Landing Page
│   │   │   ├── pricing/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/        # 主应用 Dashboard
│   │   │   ├── app/
│   │   │   │   ├── page.tsx    # Overview
│   │   │   │   ├── scanner/
│   │   │   │   ├── signals/
│   │   │   │   ├── arbitrage/
│   │   │   │   ├── portfolio/
│   │   │   │   ├── backtest/
│   │   │   │   └── alerts/
│   │   │   └── layout.tsx      # Dashboard layout (sidebar)
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── charts/             # 图表组件
│   │   │   ├── PriceChart.tsx
│   │   │   ├── EdgeGauge.tsx
│   │   │   ├── HeatMap.tsx
│   │   │   └── SpreadChart.tsx
│   │   ├── dashboard/          # Dashboard 专用组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── MarketTable.tsx
│   │   │   ├── SignalFeed.tsx
│   │   │   └── PositionCalc.tsx
│   │   ├── landing/            # Landing Page 组件
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── ModuleShowcase.tsx
│   │   │   ├── LiveDemo.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── ParticlesBg.tsx
│   │   └── shared/             # 通用组件
│   │       ├── GlassCard.tsx
│   │       ├── PriceFlash.tsx  # 价格闪烁动画
│   │       └── EdgeBadge.tsx   # Edge 标签
│   ├── hooks/
│   │   ├── useMarkets.ts
│   │   ├── useSignals.ts
│   │   └── usePortfolio.ts
│   ├── lib/
│   │   ├── mock-data/          # Mock 数据生成器
│   │   │   ├── markets.ts
│   │   │   ├── signals.ts
│   │   │   └── portfolio.ts
│   │   ├── api.ts              # API 客户端（后续接真实后端）
│   │   └── utils.ts
│   ├── mocks/                  # MSW handlers
│   │   ├── handlers.ts
│   │   └── browser.ts
│   ├── stores/                 # Zustand stores
│   │   ├── market-store.ts
│   │   └── ui-store.ts
│   └── styles/
│       ├── globals.css         # Design tokens + 全局样式
│       └── animations.css      # 自定义动画
├── public/
│   ├── fonts/
│   └── images/
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

## 9. 组件库规范

### 9.1 GlassCard 组件

```tsx
interface GlassCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive'
  glow?: 'none' | 'primary' | 'success' | 'danger'
  className?: string
}

// 使用
<GlassCard variant="interactive" glow="primary">
  <h3>US Election 2028</h3>
  <PriceFlash value={0.62} change={+0.03} />
  <EdgeBadge edge={8.3} />
</GlassCard>
```

### 9.2 PriceFlash 组件

```tsx
// 价格变化时闪烁绿/红
<PriceFlash
  value={0.62}
  change={+0.03}
  format="percent"  // "price" | "percent" | "currency"
  flash={true}      // 开启闪烁动画
/>
```

### 9.3 EdgeBadge 组件

```tsx
// Edge 显示徽章 - 自动根据值着色
<EdgeBadge edge={8.3} />   // 绿色 glow + "▲ 8.3% Edge"
<EdgeBadge edge={-2.1} />  // 红色 + "▼ 2.1% Edge"
<EdgeBadge edge={1.5} />   // 中性灰 + "→ 1.5% Edge"
```

---

## 10. 响应式策略

| 断点 | 布局 |
|------|------|
| Desktop (1280px+) | Sidebar + 主内容 + 侧面板 |
| Tablet (768-1279px) | 折叠 Sidebar + 主内容 |
| Mobile (< 768px) | 底部导航 + 堆叠卡片 |

Landing Page 在所有断点都需要完美展示（移动端是传播主场景）。

---

## 11. MVP 前端交付物（V1 with Mock Data）

1. ✅ Landing Page（完整营销页，动效齐全）
2. ✅ Dashboard Overview（KPI + 市场概览）
3. ✅ Market Scanner（表格 + 热力图 + 筛选）
4. ✅ Signal Board（实时信号流 + 详情面板）
5. ✅ Pricing Page（模块化定价展示）
6. ✅ 全部使用 Mock 数据（MSW）
7. ✅ 响应式适配（Desktop + Mobile）
8. ✅ 部署到 Vercel

**不做（后续）**：
- ❌ 用户认证/注册
- ❌ 真实 API 对接
- ❌ Arbitrage / Backtest / Portfolio 页面（Phase 2）
- ❌ 支付集成

---

## 12. 后续接后端的方式

```typescript
// lib/api.ts
// V1: MSW 拦截 → 返回 mock 数据
// V2: 只需修改 BASE_URL 指向真实后端
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchMarkets() {
  const res = await fetch(`${BASE_URL}/api/markets`)
  return res.json()
}
```

切换方式：
1. 关闭 MSW（删除 `mocks/browser.ts` 的初始化）
2. 设置 `NEXT_PUBLIC_API_URL=https://api.your-domain.com`
3. Done ✅
