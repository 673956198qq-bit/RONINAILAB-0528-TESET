import { ModelDetail, PricingPlan, DocCatalog } from "./types";

export const APP_MODELS: ModelDetail[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    category: "GPT系列",
    provider: "OpenAI",
    tags: ["旗舰", "多模态"],
    suitedFor: "适合高精尖推理、逻辑编程、创意发散及全功能文档分析",
    priceTag: "输入: ¥0.07/M | 补全: ¥0.21/M",
    contextLimit: "128K 上下文",
    description: "智力水平领先的全能旗舰机型，支持精细化的逻辑编写和深度的语言翻译与推理。",
    recommendPriority: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-Mini",
    category: "GPT系列",
    provider: "OpenAI",
    tags: ["极速", "高性价"],
    suitedFor: "适合高频次普通对话、日常问答、长篇翻译、批量文案处理",
    priceTag: "输入: ¥0.005/M | 补全: ¥0.015/M",
    contextLimit: "128K 上下文",
    description: "高效的极速敏捷型模型，兼顾模型智力与超低延迟回复体验。",
    recommendPriority: true,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    category: "Claude系列",
    provider: "Anthropic",
    tags: ["深度代码", "系统级推理"],
    suitedFor: "擅长中大型代码重构、复杂算法开发与前沿学术论文分析",
    priceTag: "输入: ¥0.15/M | 补全: ¥0.60/M",
    contextLimit: "200K 上下文",
    description: "优秀的代码编写与逻辑推理模型。文本表达极其流畅，上下文关联逻辑紧密。",
    recommendPriority: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    category: "DeepSeek系列",
    provider: "DeepSeek",
    tags: ["通用对话", "经济平价"],
    suitedFor: "高性价比逻辑推理与日常大规模多任务并行",
    priceTag: "输入: ¥0.01/M | 补全: ¥0.02/M",
    contextLimit: "64K 上下文",
    description: "先进大模型，推理能力优秀，兼顾成本效益与多任务场景。",
    recommendPriority: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    category: "DeepSeek系列",
    provider: "DeepSeek",
    tags: ["深度思考", "思维链"],
    suitedFor: "超强数学证题、逻辑极复杂的算法纠错、深入研究分析",
    priceTag: "输入: ¥0.02/M | 补全: ¥0.08/M",
    contextLimit: "128K 极致思考",
    description: "拥有独特的思维链 (CoT) 展示。回答前进行多维度、深层次自主思索，看清每一步推理逻辑。",
    recommendPriority: false,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    category: "Gemini系列",
    provider: "Google",
    tags: ["超长上下文", "多模态"],
    suitedFor: "适合音视频多模态解析、图书全文提取、多语种互译及超长工程检索",
    priceTag: "输入: ¥0.03/M | 补全: ¥0.09/M",
    contextLimit: "1M 超大上下文",
    description: "支持超乎想象的多轮对话历史和多模态图像/音视频理解能力，稳定健壮。",
    recommendPriority: false,
  },
  {
    id: "gpt-image-1",
    name: "GPT Image Pro (gpt-image-1)",
    category: "AI 图像模型",
    provider: "Media Engine",
    tags: ["精细绘图", "高清晰度"],
    suitedFor: "精准理解提示词，可直接生成带文字海报、超写实三维建模风格、逼真渲染插画",
    priceTag: "单次扣额: ¥0.12/张",
    contextLimit: "像素输出",
    description: "拥有优秀的指令遵循能力、支持部分文字拼写、画风真实优雅、色调立体且层次感强。",
    recommendPriority: true,
  },
  {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3.5",
    category: "AI 图像模型",
    provider: "Stability AI",
    tags: ["写实逼真", "摄影质感"],
    suitedFor: "现代海报排版、写实肖像、材质设计渲染、超宽画幅摄影",
    priceTag: "单次扣额: ¥0.08/张",
    contextLimit: "高清输出",
    description: "高分辨率图像生成器。可理解丰富的细节提示词，对透视和物理质感有着出色的在线复现力。",
    recommendPriority: false,
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan-trial",
    name: "基础体验套餐",
    price: "19.9",
    billing: "即用即充 / 终身有效",
    quota: "账户内得 25,000,000 额度点数（可供日常体验问答与轻量图像生成）",
    isPopular: false,
    suitedFor: "适合初期试水、日常学习、效率问答体验",
    modelsSupported: ["GPT-4o-mini", "DeepSeek-V3", "主流轻量模型"],
    features: [
      "接口安全通道，安全加密传输",
      "标准服务响应与用户工单支持",
      "全兼容 OpenAI API 标准格式规范",
      "单账户额度点数长期有效，不设失效期",
      "可视化用量计费账单（即将开放）"
    ]
  },
  {
    id: "plan-creator",
    name: "专业创作者套餐",
    price: "59",
    billing: "特惠专享 / 无限期",
    quota: "账户内得 80,000,000 额度点数 + 赠送 100 张高级 AI 绘图配额",
    isPopular: true,
    suitedFor: "独立设计师、自媒体运营、电商产品策划及效率达人",
    modelsSupported: ["全模型接入", "Gemini 2.5 Flash", "Claude 3.5 Sonnet", "DeepSeek-R1", "gpt-image-1"],
    features: [
      "解锁 GPT Image Pro 图像生成及 SD 3.5 绘图功能",
      "专享高优先级接入通道",
      "支持开通无限画布交互白板工作台",
      "支持提示词降噪与语义匹配能力",
      "一键拷贝客户端兼容格式参数"
    ]
  },
  {
    id: "plan-pro",
    name: "高级开发套餐",
    price: "128",
    billing: "深度算力充值",
    quota: "账户内得 200,000,000 额度点数 + 专属并发通道授权",
    isPopular: false,
    suitedFor: "中小型应用开发者、全栈工程师、效率团队高频调用",
    modelsSupported: ["所有旗舰模型", "Claude全系列", "DeepSeek全模型"],
    features: [
      "支持高频多线程并发调用响应 (QPM)",
      "后台快速导出接口调用报表与详单",
      "完全兼容 OpenAI / Langchain 等原厂开发框架",
      "专有服务排障支持与使用咨询响应",
      "开发者深度沙箱工具包（即将开放）"
    ]
  },
  {
    id: "plan-enterprise",
    name: "政企定制套餐",
    price: "599",
    billing: "专属定制 / 企业对公",
    quota: "专有长线高并发大包，支持分配高可用专属通道",
    isPopular: false,
    suitedFor: "政企客户、研发工作室、科研实验室及团队系统集成",
    modelsSupported: ["全模型按需分配", "专属通道"],
    features: [
      "针对细分工作流的模型私有部署（即将开放）",
      "高级别数据隔离與专属高可用保障（即将开放）",
      "提供正规增值税专用/普通发票",
      "团队组织架构与成员权限管理（即将开放）",
      "1v1 专属技术支持团队及客户保障群"
    ]
  }
];

export const DOC_CATALOG: DocCatalog[] = [
  {
    id: "quickstart",
    title: "快速上手指导",
    items: [
      { id: "intro", label: "💡 什么是 RONIN AI LAB", contentCode: "intro" },
      { id: "apikey", label: "🔑 如何获取商业 API 密钥", contentCode: "apikey" },
      { id: "compatibility", label: "🌐 兼容 OpenAI 的调用规范", contentCode: "compatibility" },
    ]
  },
  {
    id: "integration",
    title: "主流客户端对接",
    items: [
      { id: "cherry", label: "🍒 Cherry Studio 接入教程", contentCode: "cherry" },
      { id: "cursor", label: "💻 Cursor / VS Code 极速接入", contentCode: "cursor" },
      { id: "nextchat", label: "💬 NextChat / LobeChat 配置", contentCode: "nextchat" },
    ]
  },
  {
    id: "apidocs",
    title: "接口代码示例",
    items: [
      { id: "chatapi", label: "✉️ Chat Completions 文本调用", contentCode: "chatapi" },
      { id: "imgapi", label: "🖼️ Image Generations 绘图调用", contentCode: "imgapi" },
    ]
  }
];

export const DOC_CONTENTS: Record<string, string> = {
  intro: `### 💡 什么是 RONIN AI LAB？

**RONIN AI LAB** 是专门面向设计师、全栈工程师及自媒体创作者设计的 API 聚合基础设施。

我们通过统一的分流调度系统，提供高性价比、低延时的 API 对接渠道。

#### 核心亮点说明
* **全模覆盖**：单密钥直通 GPT-4o, Claude 3.5 Sonnet, DeepSeek-V3, R1 等主流大模型。
* **原生兼容**：全面对齐官方 OpenAI 格式响应，任何现有的支持 OpenAI 的工具仅需修改 API 地址即可即刻提速。
* **安全性高**：全站启用安全的 SSL 数据链路加密，不公开您的提示词与生成数据。` ,

  apikey: `### 🔑 如何获取商业 API 密钥

在 **RONIN AI LAB** 自助获取 API Token 非常简单，仅需以下步骤：

1. **登录控制台**：
   点击页面右上角或者直达链接 [RONIN 业务控制台](https://ai.ronin77.xyz/console) 进入控制面板页面。
   
2. **注册账户**：
   输入您常用的邮箱获取验证码，完成快速开通。
   
3. **新增令牌**：
   * 在控制台左侧定位到 \`「令牌管理」\` 菜单。
   * 点击右上方 \`「添加新令牌」\` 按钮。
   * 自定义令牌名称并设置到期时间、额度保护。
   * 点击保存并复制令牌。令牌格式一般形如 \`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`。
   
> **⚠️ 提示**：请妥善保存此令牌。由于安全策略，它在首次复制并关闭后将无法再次以明文方式读取。`,

  compatibility: `### 🌐 兼容 OpenAI 的标准接口规范

我们为全球开发者提供 100% 对齐 OpenAI SDK 报文响应的聚合中转网关。

#### 网关基本接入信息
* **接口基准地址 (API BASE URL)**: 
  \`\`\`bash
  https://ai.ronin77.xyz/v1
  \`\`\`
* **授权密钥Bearer (bearer token)**: 
  使用您在控制台生成的以 \`sk-\` 开头的令牌。

#### 替换对照表
| 原始配置项 | OpenAI 官方参数 | RONIN 聚合站参数 |
| :--- | :--- | :--- |
| **API域名** | \`https://api.openai.com/v1\` | **\`https://ai.ronin77.xyz/v1\`** |
| **API密钥**| \`sk-proj-Okxxxxxxxx\` | **\`您的 sk-xxxxxx 自定义专属令牌\`** |
| **生图端点**| \`/v1/images/generations\` | **\`https://ai.ronin77.xyz/v1/images/generations\`** |
`,

  cherry: `### 🍒 Cherry Studio 客户端对接教程

[Cherry Studio](https://cherry-ai.com/) 是一款清爽好用、支持多模型的跨平台桌面 AI 助手。

#### ⚙️ 配置三部曲：
1. **启动客户端**：
   打开 Cherry Studio，点击左下角的 \`设置\` 图标。
   
2. **添加自定义提供商 (OpenAI 兼容)**：
   * 在左侧菜单找到 \`「模型服务」\`，选择最下方的 \`「添加自定义(OpenAI兼容)」\`。
   * **提供商名称**：\`RONIN LAB\`
   * **API 密钥 (API Key)**：输入您的 \`sk-xxxxxx\` 专属令牌。
   * **API 地址 (API Base)**：填入 \`https://ai.ronin77.xyz/v1\`。
   
3. **激活模型清单**：
   * 点击下方 \`「管理模型」\`。
   * 手动添加所需模型：如 \`gpt-4o\`、\`gpt-4o-mini\` 或 \`deepseek-v3\`。
   * 勾选启用后即可在主界面任意切换并使用。`,

  cursor: `### 💻 Cursor 极速配置与接入

[Cursor](https://cursor.sh/) 是一款广受欢迎的 AI 集成开发环境 (IDE)，支持全套 OpenAI 兼容中转网关。

#### 🛠️ 无缝集成配置：

1. **进入设置面板**：
   在 Cursor 界面右上方点击齿轮图标，进入 \`Cursor Settings\` 面板。
   
2. **定位 AI 齿轮项**：
   转到左方标签 \`Features\` -> 找到并点击下方 \`Models\` 或 \`OpenAI API\` 模块。
   
3. **配置自定义域名与密钥**：
   * 将 \`Override OpenAI Base URL\` 修改为：
     \`\`\`http
     https://ai.ronin77.xyz/v1
     \`\`\`
   * 将您专属的 \`sk-xxxxxx\` 密钥填入 \`OpenAI API Key\` 输入框。
   * 点击右上角 **Save** 保存。
   
4. **定制模型名称**：
   * 在模型列表中勾选或添加你要使用的模型即可，例如：\`gpt-4o\`, \`claude-3-5-sonnet\`。`,

  nextchat: `### 💬 NextChat / LobeChat 多端接入方法

这两款是非常流行的开源 AI 聊天网页前端，仅需修改基础设置，即可连接 RONIN 接口。

#### 🚀 配置步骤：

##### 1. 在 NextChat (ChatGPT-Next-Web) 中配置：
直接进入客户端的「设置」菜单：
* **接口基准**：输入 \`https://ai.ronin77.xyz/v1\`
* **自定义密钥**：填入 \`sk-xxxxxxxx\`
* **模型覆盖**：添加 \`+gpt-4o,+deepseek-v3\` 以便选取。

##### 2. 在 LobeChat 中配置：
在设置页面找到 \`语言模型\` 栏目 -> 打开 \`OpenAI\` 配置开关：
* **代理地址 (API Endpoint)**：设置为 \`https://ai.ronin77.xyz/v1\`
* **API Key**：填入您的 \`sk-xxxxxxxx\`
* 保存后即可正常流式输出模型对话。`,

  chatapi: `### ✉️ Chat Completions API 接口标准调用示例

对于需要开发自动化工具或在后端自建业务的用户，可以直接运行如下多语言标准调用脚本：

#### 💻 方式 1: JavaScript (Node.js SDK)
\`\`\`javascript
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "sk-xxxxxxxxxxxxxx", // 您的专属令牌
  baseURL: "https://ai.ronin77.xyz/v1",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "你是一位精明强干的企业助手" },
      { role: "user", content: "如何实现高效的团队协作？请用简短一句话表述。" }
    ],
  });

  console.log(completion.choices[0].message.content);
}

main();
\`\`\`

#### 🐍 方式 2: Python (Requests)
\`\`\`python
import requests

url = "https://ai.ronin77.xyz/v1/chat/completions"
headers = {
    "Authorization": "Bearer sk-xxxxxxxxxxxx",
    "Content-Type": "application/json"
}
payload = {
    "model": "deepseek-v3",
    "messages": [
        {"role": "user", "content": "请提供一份100字的产品创意推广大纲。"}
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
\`\`\`
`,

  imgapi: `### 🖼️ Images Generations 绘图接口调用示例

通过此接口即可生产高质量图片。

#### 💻 使用 curl 获取响应：

\`\`\`bash
curl -X POST "https://ai.ronin77.xyz/v1/images/generations" \\
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-1",
    "prompt": "一座位于迷雾中的现代风格建筑灯塔，高保真写实，照片质感渲染",
    "size": "1024x1024",
    "response_format": "b64_json"
  }'
\`\`\`

#### 返回格式：
接口将返回符合 OpenAI 协议的 JSON，其中 \`data[0].b64_json\` 字段即可以直接作为 HTML \`<img src=\"data:image/png;base64,...\" />\` 渲染的原始图片。`
};

export const QUICK_PROMPTS = [
  {
    title: "产品发布文案",
    desc: "快速整理撰写新发布软件公关稿",
    prompt: "帮我创作一段产品发布推广文案。要求突出项目：高效简洁、安全链路加密以及可视化多模型协同等几个方面。文意洗练，适合对外宣传。"
  },
  {
    title: "商业素材创意",
    desc: "生成具有现代主义风格的摄影级别画面提示词",
    prompt: "推荐一些商业渲染图提示词。画面主体为：一个磨砂白色的多面立体几何雕塑悬浮于干燥的淡色大理石桌面上，晨曦微光投射下微妙光影，冷色调极简主义，照片质感。"
  },
  {
    title: "品牌简介优化",
    desc: "将项目大纲润色为正式外宣品牌介绍",
    prompt: "帮我润色一段品牌简介：重在强调我们致力于将交互式白板工作台与大语言算力相融合，为独立创作者以及研发团队设计清爽、纯粹的高端生产力工具。"
  },
  {
    title: "活动推广方案",
    desc: "策划一个对潜在独立创作者社群的轻量方案",
    prompt: "帮我设计一份轻量的独立创作者社群活动方案。请列出：试用体验、高质量模板分享、创作者反馈等主要环节以及简要步骤。"
  }
];
