# Prediction Market Trader Tools — System Design

> Version: 0.1 (MVP Draft)
> Date: 2026-03-17
> Author: claude-coder + xiaoxiaff

---

## 1. 产品愿景

为预测市场 Trader 提供一站式数据驱动决策平台，通过实时数据采集、智能分析和信号输出，显著提高交易胜率和效率。

## 2. 核心设计原则

- **模块化 / 可插拔**：每个组件通过标准接口通信，MVP 用简单实现，后续可替换为生产级组件
- **数据驱动**：所有决策基于可量化的数据信号
- **延迟敏感**：关键路径优先低延迟设计
- **可回测**：所有信号和策略必须可回测验证

---

## 3. 系统架构（模块化分层）

```
┌──────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Web Dashboard│  │  Alert/通知   │  │  API (供外部用)  │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘  │
│         └────────────────┼───────────────────┘            │
├──────────────────────────┼────────────────────────────────┤
│                    Service Layer                           │
│  ┌──────────┐  ┌────────┴───────┐  ┌──────────────────┐  │
│  │ Signal    │  │ Portfolio      │  │ Backtest         │  │
│  │ Engine    │  │ Manager        │  │ Engine           │  │
│  └─────┬────┘  └───────┬────────┘  └────────┬─────────┘  │
│        └───────────────┼──────────────────────┘           │
├────────────────────────┼──────────────────────────────────┤
│                  Algorithm Layer                           │
│  ┌──────────┐  ┌───────┴──────┐  ┌────────┐  ┌────────┐  │
│  │ LLM Prob │  │ Arb Detector │  │ Kelly  │  │Sentiment│  │
│  │ Estimator│  │              │  │ Sizer  │  │Analyzer │  │
│  └─────┬────┘  └──────┬───────┘  └───┬────┘  └───┬────┘  │
│        └──────────────┼──────────────┼────────────┘       │
├────────────────────────┼──────────────────────────────────┤
│                   Data Layer                               │
│  ┌──────────┐  ┌───────┴──────┐  ┌──────────────────────┐ │
│  │ Data      │  │ Data         │  │ Storage              │ │
│  │ Collectors│  │ Pipeline     │  │ (Time-series + KV)   │ │
│  └──────────┘  └──────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 4. 模块详细设计

### 4.1 Data Collectors（数据采集层）

**接口定义**：
```python
class BaseCollector(ABC):
    @abstractmethod
    async def connect(self) -> None: ...
    @abstractmethod
    async def subscribe(self, topics: list[str]) -> None: ...
    @abstractmethod
    async def on_message(self, callback: Callable) -> None: ...
    @abstractmethod
    async def disconnect(self) -> None: ...

# 统一消息格式
@dataclass
class MarketEvent:
    source: str          # "polymarket" | "kalshi" | "news" | "onchain"
    event_type: str      # "price" | "trade" | "orderbook" | "news" | "transfer"
    market_id: str
    timestamp: datetime
    payload: dict        # 具体数据
```

**MVP 实现**：
| Collector | MVP | 生产级替换 |
|-----------|-----|-----------|
| Polymarket | REST API 轮询 (10s) | WebSocket + Gamma API |
| Kalshi | REST API 轮询 | WebSocket stream |
| News | NewsAPI / RSS 轮询 | 专用新闻 feed + NLP pipeline |
| Social | Twitter API basic | Firehose + 实时 NLP |
| On-chain | Etherscan API | 自建节点 + event listener |

**可插拔设计**：所有 Collector 实现 `BaseCollector` 接口，通过配置文件注册，运行时按需加载。

---

### 4.2 Data Pipeline（数据管道）

**接口定义**：
```python
class BasePipeline(ABC):
    @abstractmethod
    async def publish(self, event: MarketEvent) -> None: ...
    @abstractmethod
    async def subscribe(self, topic: str, handler: Callable) -> None: ...

class BaseStore(ABC):
    @abstractmethod
    async def write(self, event: MarketEvent) -> None: ...
    @abstractmethod
    async def query(self, market_id: str, time_range: tuple) -> list[MarketEvent]: ...
```

**MVP vs 生产级**：
| 组件 | MVP | 生产级替换 |
|------|-----|-----------|
| Message Bus | In-process asyncio.Queue | Redis Streams / Kafka |
| Time-series DB | SQLite + JSON | TimescaleDB / ClickHouse |
| Cache | Python dict (LRU) | Redis |
| Orchestration | Python asyncio | Airflow / Prefect |
| Scheduler | APScheduler | Airflow DAGs |

---

### 4.3 Algorithm Layer（算法层）

每个算法模块是独立的 **Analyzer**，输入 MarketEvent，输出 Signal。

**统一信号格式**：
```python
@dataclass
class Signal:
    analyzer: str        # "llm_prob" | "arb" | "sentiment" | "smart_money"
    market_id: str
    timestamp: datetime
    signal_type: str     # "edge" | "arb_opportunity" | "sentiment_shift" | "whale_move"
    confidence: float    # 0-1
    direction: str       # "buy_yes" | "buy_no" | "hold" | "exit"
    metadata: dict       # 分析器特定数据（如 fair_value, edge_pct 等）

class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, events: list[MarketEvent]) -> list[Signal]: ...
    @abstractmethod
    def get_config(self) -> dict: ...
```

#### 4.3.1 LLM Probability Estimator
- 输入：市场描述 + 相关新闻/数据
- 输出：AI 估算的"真实概率" vs 市场价格 → edge
- MVP：Claude Haiku（成本低，~$0.001/evaluation）
- 生产级：ensemble 多个 LLM + 校准层

#### 4.3.2 Cross-Platform Arbitrage Detector
- 输入：同一事件在不同平台的价格
- 输出：套利机会 + 预期利润
- MVP：Polymarket vs Kalshi 价格对比
- 生产级：多平台实时 orderbook 深度分析

#### 4.3.3 Kelly Criterion Position Sizer
- 输入：edge 大小 + bankroll + 当前持仓
- 输出：推荐仓位大小
- MVP：Half-Kelly，硬顶 25%
- 生产级：多市场组合优化（考虑相关性）

#### 4.3.4 Sentiment Analyzer
- 输入：新闻 + 社交媒体文本
- 输出：情绪评分 + 趋势变化
- MVP：LLM 直接打分
- 生产级：专用 NLP 模型 + 实时流处理

#### 4.3.5 Event Correlation Graph（后续扩展）
- 发现事件间的隐含关联
- "如果 A 发生，B 的概率如何变化"

---

### 4.4 Signal Engine（信号引擎）

聚合所有 Analyzer 的 Signal，生成最终交易建议。

```python
class SignalEngine:
    def __init__(self, analyzers: list[BaseAnalyzer], weights: dict):
        self.analyzers = analyzers
        self.weights = weights  # 每个 analyzer 的权重

    async def evaluate(self, market_id: str) -> TradingRecommendation:
        signals = []
        for analyzer in self.analyzers:
            signals.extend(await analyzer.analyze(...))
        return self.aggregate(signals)

@dataclass
class TradingRecommendation:
    market_id: str
    action: str          # "buy_yes" | "buy_no" | "hold" | "exit"
    confidence: float    # 综合置信度
    position_size: float # Kelly 推荐仓位
    edge: float          # 预期 edge
    signals: list[Signal]# 组成信号（可追溯）
    reasoning: str       # 人类可读的推理过程
```

---

### 4.5 Portfolio Manager

```python
class BasePortfolioManager(ABC):
    @abstractmethod
    async def get_positions(self) -> list[Position]: ...
    @abstractmethod
    async def get_pnl(self) -> PnLSummary: ...
    @abstractmethod
    async def risk_check(self, recommendation: TradingRecommendation) -> bool: ...
```

MVP：本地 JSON 文件记录持仓
生产级：数据库 + 实时风控

---

### 4.6 Backtest Engine

```python
class BaseBacktestEngine(ABC):
    @abstractmethod
    async def run(self, strategy: BaseAnalyzer, data: HistoricalData) -> BacktestResult: ...

@dataclass
class BacktestResult:
    total_trades: int
    win_rate: float
    total_pnl: float
    max_drawdown: float
    sharpe_ratio: float
    trades: list[BacktestTrade]
```

MVP：简单的逐笔回放
生产级：蒙特卡罗模拟 + 多策略组合

---

### 4.7 Presentation Layer

**Web Dashboard**：
| 页面 | 功能 | MVP |
|------|------|-----|
| Market Scanner | 热门市场 + Edge 排序 | 表格 + 基础过滤 |
| Signal Board | 实时信号流 + 推荐 | 简单列表 |
| Portfolio | 持仓 + P&L | 基础表格 |
| Backtest | 策略回测结果 | 图表展示 |
| Settings | 配置各模块参数 | YAML/JSON 编辑 |

**Alert System**：
| 通道 | MVP | 生产级 |
|------|-----|--------|
| Discord | Webhook | Bot + 频道管理 |
| Telegram | Bot API | + 交互式按钮 |
| Email | - | SendGrid |
| Browser | - | Push Notification |

---

## 5. 技术栈

| 层 | MVP | 生产级 |
|----|-----|--------|
| Language | Python 3.12+ | Python + Go (高性能组件) |
| Web Framework | FastAPI | FastAPI + WebSocket |
| Frontend | React + Tailwind + shadcn/ui | + SSR (Next.js) |
| Database | SQLite | PostgreSQL + TimescaleDB |
| Cache | In-memory | Redis |
| Message Queue | asyncio.Queue | Redis Streams / Kafka |
| Orchestration | APScheduler | Airflow / Prefect |
| Deployment | Docker Compose | K8s |
| Monitoring | 日志 | Prometheus + Grafana |

---

## 6. MVP 范围（Phase 1）

### 目标：单平台 Polymarket + LLM Edge 检测 + 提醒

**交付物**：
1. ✅ Polymarket 数据采集器（REST API 轮询）
2. ✅ LLM 概率估算器（Claude Haiku）
3. ✅ Edge 计算 + Kelly 仓位建议
4. ✅ 简单 CLI 输出 + Discord/Telegram 提醒
5. ✅ 基础回测（历史市场数据验证）
6. ✅ Web Dashboard（市场扫描 + 信号面板）

**不做（留到后续）**：
- ❌ 自动交易执行
- ❌ 跨平台套利
- ❌ 链上数据
- ❌ 复杂风控
- ❌ 多策略组合优化

### MVP 项目结构
```
prediction-market-tools/
├── src/
│   ├── collectors/          # 数据采集
│   │   ├── base.py          # BaseCollector 接口
│   │   ├── polymarket.py    # Polymarket 采集器
│   │   └── news.py          # 新闻采集器
│   ├── pipeline/            # 数据管道
│   │   ├── base.py          # BasePipeline 接口
│   │   ├── simple_bus.py    # MVP: asyncio.Queue
│   │   └── store.py         # MVP: SQLite
│   ├── analyzers/           # 算法模块
│   │   ├── base.py          # BaseAnalyzer 接口
│   │   ├── llm_prob.py      # LLM 概率估算
│   │   ├── kelly.py         # Kelly 仓位
│   │   └── sentiment.py     # 情绪分析
│   ├── engine/              # 信号引擎
│   │   ├── signal_engine.py
│   │   └── models.py        # Signal, Recommendation 等
│   ├── portfolio/           # 持仓管理
│   │   ├── base.py
│   │   └── simple.py        # MVP: JSON 文件
│   ├── backtest/            # 回测
│   │   ├── base.py
│   │   └── simple.py
│   ├── alerts/              # 提醒
│   │   ├── base.py
│   │   ├── discord.py
│   │   └── telegram.py
│   ├── web/                 # Web Dashboard
│   │   ├── app.py           # FastAPI
│   │   └── frontend/        # React
│   └── config/
│       ├── settings.py      # Pydantic settings
│       └── default.yaml     # 默认配置
├── tests/
├── docs/
│   └── plans/
├── scripts/
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

---

## 7. 模块替换示例

以数据管道为例，展示插拔设计：

```yaml
# config/default.yaml

# MVP 配置
pipeline:
  bus: "simple"      # asyncio.Queue
  store: "sqlite"    # SQLite
  scheduler: "apscheduler"

# 生产级配置（只改配置文件）
# pipeline:
#   bus: "redis_stream"   # Redis Streams
#   store: "timescale"    # TimescaleDB
#   scheduler: "airflow"  # Airflow
```

```python
# 工厂模式加载
def create_pipeline(config) -> BasePipeline:
    match config.pipeline.bus:
        case "simple": return SimpleAsyncPipeline()
        case "redis_stream": return RedisStreamPipeline(config.redis_url)
        case "kafka": return KafkaPipeline(config.kafka_brokers)
```

---

## 8. 后续 Roadmap

| Phase | 内容 | 预估 |
|-------|------|------|
| Phase 1 (MVP) | Polymarket + LLM Edge + Dashboard + Alert | 2-3 周 |
| Phase 2 | + Kalshi + 跨平台套利 + 情绪分析 | 2 周 |
| Phase 3 | + 链上数据 + Smart Money + 自动执行 | 3 周 |
| Phase 4 | + 生产级数据管道(Airflow) + 风控 + 多策略 | 4 周 |
| Phase 5 | + 用户系统 + 付费订阅 + API 开放 | 4 周 |

---

## 9. 关键风险

| 风险 | 缓解 |
|------|------|
| LLM 概率估算准确度不够 | 回测验证 + ensemble + 校准 |
| API rate limit | 多 key 轮换 + 本地缓存 |
| 预测市场流动性不足 | 流动性过滤 + 滑点计算 |
| 合规风险（地域限制） | VPS 部署 + 法律咨询 |
| 数据延迟导致信号过时 | 延迟监控 + TTL 机制 |
