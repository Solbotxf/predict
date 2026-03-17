# Reference Skills for This Project

待 ClawHub rate limit 恢复后安装以下 skills：

## 待安装
```bash
clawhub install polymarket-auto-trader --force
clawhub install kalshi-trading --force
clawhub install architecture-designer
clawhub install cross-pollination-engine
```

## 已安装
- ui-ux-pro-max → /root/.openclaw/workspace/skills/ui-ux-pro-max/
- superpowers → /root/.openclaw/ws-claude-coder/skills/superpowers/

## Polymarket Auto-Trader 关键参考
- LLM 概率估算 + Kelly 仓位管理 + CLOB API 交易
- Edge 阈值: 5% minimum
- Half-Kelly + 25% max position cap
- trades.jsonl 去重
- Gamma API 获取活跃市场

## Kalshi Trading 关键参考
- CLI 脚本: balance, portfolio, trending, search, market, orderbook, buy, sell
- 输出全部 JSON
- 交易前必须用户确认
