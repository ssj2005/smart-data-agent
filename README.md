<div align='center'>
  <h1 style="margin-top: 15px;">智能问数 Agent</h1>
  <h4><b>smart-data-agent</b></h4>
  <p><em>基于 LangGraph 的自然语言智能问数系统：混合检索 + 多阶段推理 + SQL 生成与执行闭环，让不懂 SQL 的业务同学也能直接对话取数</em></p>
</div>

<div align='center'>

![Python](https://img.shields.io/badge/Python-3.14-3776AB.svg?logo=python&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic%20Workflow-1C3C3C.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688.svg?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-00c853.svg)
![Stars](https://img.shields.io/github/stars/ssj2005/smart-data-agent?logo=github&style=flat)

</div>

## 📖 项目简介

在企业实际问数场景里，业务同学通常不会写 SQL，而数据分析同学也很难随时记住所有表结构、字段含义、指标口径和字段取值。如果直接把自然语言问题丢给大模型，很容易出现表选错、字段选错、指标理解错和 SQL 幻觉等问题。

**智能问数 Agent** 要解决的就是这个问题：它围绕「检索增强 + 智能体编排」的思路，先构建一套元数据知识库，再用 LangGraph 编排一条多阶段问数链路，把用户的一句自然语言最终转化为可信的 SQL 查询，并以流式方式把分析结果返回前端。

完整处理流程：

- 用户用自然语言提问
- 系统自动召回相关字段、指标和字段取值
- 大模型基于召回上下文分步推理
- 生成 SQL、校验、修正并查询数据仓库
- 以 SSE 流式方式返回执行进度与查询结果

## 🎬 效果预览

![智能问数首页：样例问题、自然语言输入与智能体对话界面](docs/images/shopkeeper-agent-home.jpg)

![问数结果页：LangGraph 执行流程、SQL 校验执行与查询结果表格](docs/images/shopkeeper-agent-query-result.jpg)

## ✨ 核心亮点

- **检索 + 推理 + 生成，而不是模型直出 SQL**
  - 先围绕问题召回相关字段、指标和值域，再组织上下文生成 SQL，整体链路更稳定、更可控，大幅降低 SQL 幻觉。
- **面向企业问数场景的混合检索**
  - `Qdrant` 负责字段和指标的语义向量召回。
  - `Elasticsearch` 负责字段取值的全文检索。
  - `MySQL` 负责保存完整、权威的结构化元数据。
- **字段、指标、取值三类信息协同召回**
  - 比单纯做表级或字段级检索更贴近真实企业分析流程。
- **从检索到执行的完整可运行闭环**
  - 不停留在 Prompt 设计，而是真实生成 SQL、执行查询，并以流式方式返回结果。
- **清晰的分层工程化后端结构**
  - 基于 `FastAPI + LangGraph + Repository + Client Manager` 组织配置、客户端、仓储层、服务层与智能体流程，便于维护和扩展。
- **可观测的执行流程**
  - 通过 SSE 实时推送每个节点的执行状态，前端以流程图形式可视化 LangGraph 的每一步推理过程。

## 🏗️ 系统架构

![系统架构图：前端通过 FastAPI 和 SSE 连接后端，LangGraph 问数智能体基于 Jieba、MySQL、Qdrant、Elasticsearch 和 LLM 完成召回、SQL 生成校验执行与结果返回](docs/images/shopkeeper-agent-system-architecture.svg)

项目围绕两条主线展开：

| 主线             | 做什么                                                                   | 涉及模块                                     |
| ---------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| 元数据知识库构建 | 抽取数仓中的表、字段、指标和字段取值，写入结构化库、向量库和全文索引     | `MySQL` / `Qdrant` / `Elasticsearch` / `TEI` |
| 自然语言问数     | 基于用户问题完成召回、上下文整理、SQL 生成校验执行，并把过程流式返回前端 | `LangGraph` / `FastAPI` / `SSE` / `React`    |

## 🔍 问数工作流

智能体由一条 12 节点的 LangGraph 状态图编排，完整覆盖「关键词 → 召回 → 合并 → 过滤 → 生成 → 执行」链路：

```
抽取关键词
   ├─ 召回字段信息（Qdrant 向量召回）
   ├─ 召回指标信息（Qdrant 向量召回）
   └─ 召回字段取值（Elasticsearch 全文检索）
        │
        ▼
   合并召回信息
        │
   ├─ 过滤表信息  ─┐
   └─ 过滤指标信息 ─┤
        │          │
        ▼          ▼
   增加额外上下文
        │
        ▼
   生成 SQL
        │
        ▼
   校验 SQL ── 失败 ──► 校正 SQL
        │                  │
        │ 通过             │
        ▼                  ▼
   执行 SQL ◄──────────────┘
```

每个节点通过 `runtime.stream_writer` 向前端推送进度，前端以流程图实时高亮展示当前执行到的步骤与状态。

## 🛠️ 技术栈

| 模块       | 技术                              | 作用                                           |
| ---------- | --------------------------------- | ---------------------------------------------- |
| 数仓       | `MySQL`                           | 模拟事实表、维度表和分析型查询环境             |
| 元数据库   | `MySQL` / `SQLAlchemy`            | 保存表、字段、指标、字段指标关系等结构化元数据 |
| 向量检索   | `Qdrant`                          | 保存字段和指标向量，支持语义召回               |
| 全文检索   | `Elasticsearch`                   | 保存字段真实取值，支持关键词和值域检索         |
| Embedding  | `TEI` / `BAAI/bge-large-zh-v1.5`  | 将字段、指标、问题等文本转成向量               |
| 智能体编排 | `LangGraph`                       | 组织多阶段问数工作流                           |
| 模型接入   | `LangChain`                       | 封装 LLM 与 Embedding 调用                     |
| 后端接口   | `FastAPI`                         | 提供问数 API、依赖注入和生命周期管理           |
| 流式协议   | `SSE`                             | 实时返回节点进度、查询结果和错误消息           |
| 前端       | `React` / `Vite` / `Tailwind CSS` | 提供聊天式问数界面和流程展示                   |
| 日志追踪   | `ContextVar` / `loguru`           | 为并发请求注入 request_id，便于排查链路        |
| 依赖管理   | `uv` / `pnpm`                     | 管理 Python 后端和前端依赖                     |

## 📁 项目结构

```text
smart-data-agent/
├── app/
│   ├── agent/            # LangGraph 图、状态、上下文和各类节点
│   │   └── nodes/        # 关键词抽取、多路召回、合并、过滤、SQL 生成/校验/执行等节点
│   ├── api/              # FastAPI 路由、依赖注入、生命周期和请求结构
│   ├── clients/          # MySQL、Qdrant、Elasticsearch、Embedding 客户端管理
│   ├── conf/             # 配置 dataclass 与配置加载工具
│   ├── core/             # 日志、request_id 上下文等通用能力
│   ├── entities/         # 更贴近业务语义的数据对象
│   ├── models/           # SQLAlchemy ORM 模型
│   ├── prompt/           # Prompt 加载工具
│   ├── repositories/     # MySQL、Qdrant、Elasticsearch 数据访问层
│   ├── scripts/          # 元数据知识库构建脚本
│   └── services/         # 元数据构建服务和问数查询服务
├── conf/                 # app_config.yaml、meta_config.yaml
├── docker/               # Docker Compose、MySQL 初始化 SQL、ES 插件、Embedding 挂载目录
├── frontend/             # React + Vite + Tailwind CSS 前端项目
├── prompts/              # SQL 生成、修正、过滤等 Prompt 模板
├── main.py               # FastAPI 应用入口
└── pyproject.toml        # Python 项目依赖与工具配置
```

## 🚀 快速开始

### 1. 准备环境

- Python `>= 3.14`
- `uv`
- Docker 与 Docker Compose
- Node.js 与 `pnpm`

### 2. 克隆项目

```bash
git clone https://github.com/ssj2005/smart-data-agent.git
cd smart-data-agent
```

### 3. 安装后端依赖

```bash
uv sync
```

### 4. 配置大模型 API Key

```bash
cp .env.example .env
```

把 `.env` 中的 `LLM_API_KEY` 替换成真实密钥：

```bash
LLM_API_KEY=your_real_api_key
```

默认配置使用兼容 OpenAI 接口的硅基流动服务：

```yaml
llm:
    model_name: Pro/zai-org/GLM-5.1
    api_key: ${oc.env:LLM_API_KEY}
    base_url: https://api.siliconflow.cn/v1
```

如需使用其他兼容 OpenAI API 的模型平台，修改 [conf/app_config.yaml](conf/app_config.yaml) 中的 `model_name` 和 `base_url`。

### 5. 准备 Embedding 模型

项目通过 `TEI` 加载 `BAAI/bge-large-zh-v1.5`。模型文件体积较大，无法在仓库中提交，需要先下载到 Docker 挂载目录：

```bash
uv run hf download BAAI/bge-large-zh-v1.5 --local-dir docker/embedding/bge-large-zh-v1.5
```

如果手动下载，请解压到 `docker/embedding/bge-large-zh-v1.5` 路径下。

### 6. 启动 Docker 基础服务

```bash
docker compose -f docker/docker-compose.yaml up -d
```

默认端口：

| 服务          | 端口   |
| ------------- | ------ |
| MySQL         | `3306` |
| Elasticsearch | `9200` |
| Kibana        | `5601` |
| Qdrant        | `6333` |
| Embedding     | `8081` |

> `docker/mysql/meta.sql` 和 `docker/mysql/dw.sql` 会在 MySQL 容器首次启动时自动初始化元数据库和数仓。

### 7. 构建元数据知识库

```bash
uv run python -m app.scripts.build_meta_knowledge -c conf/meta_config.yaml
```

这一步会把表字段元数据写入 MySQL，把字段和指标向量写入 Qdrant，并把字段真实取值写入 Elasticsearch。

### 8. 启动后端

```bash
uv run fastapi dev main.py
```

后端接口：

```text
POST http://127.0.0.1:8000/api/query
```

请求示例：

```json
{
    "query": "统计华北地区的销售总额"
}
```

SSE 消息类型：

| 类型       | 含义         |
| ---------- | ------------ |
| `progress` | 节点执行进度 |
| `result`   | 最终查询结果 |
| `error`    | 全局异常消息 |

### 9. 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

前端默认通过 Vite 代理把 `/api` 转发到 `http://127.0.0.1:8000`。如需修改：

```bash
cd frontend
cp .env.example .env
```

```bash
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8000
```

## 🧭 二次开发方向

当前版本已经跑通「问数」最核心的检索、推理、生成、执行闭环，后续可以在此基础上继续扩展：

- **接入自己的业务数仓**：替换 `docker/mysql/dw.sql` 与 `conf/meta_config.yaml`，即可让 Agent 面向你自己的业务数据问数。
- **接入更多数据源**：把字段取值检索从 ES 扩展到其他存储，或新增图数据库召回。
- **多轮对话与追问**：增加会话记忆、指代消解和追问改写能力。
- **结果可视化**：在查询结果之上叠加图表渲染，自动选择合适的可视化类型。
- **权限与安全**：用户登录、角色权限、数据权限控制，以及 SQL 安全审计与执行白名单。
- **系统化评测**：构建评测集，对召回质量与 SQL 生成准确率做自动化回归。

## 🚧 能力边界

本项目主要聚焦智能问数的核心工程链路，暂未覆盖以下生产治理能力：

- 用户登录、角色权限和数据权限控制
- 多租户隔离
- SQL 安全审计和执行白名单
- 查询缓存、限流和性能治理
- 系统化评测集与自动化回归评测
- 监控告警、链路追踪平台和灰度发布
- 更复杂的多轮问数记忆、追问改写和会话管理

## 📄 License

本项目基于 [MIT License](LICENSE) 开源。
