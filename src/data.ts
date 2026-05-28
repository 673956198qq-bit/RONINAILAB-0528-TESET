import { ModelDetail, PricingPlan, DocCatalog } from "./types";

export const APP_MODELS: ModelDetail[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    category: "GPT系列",
    provider: "OpenAI",
    tags: ["旗舰", "多模态"],
    suitedFor: "适合高精尖推理、逻辑编程、创意发散及全功能文档分析",
    priceTag: "输入: ¥0.07/M | 补全: ¥0.21/M (原厂 1.5 折优惠)",
    contextLimit: "128K 上下文",
    description: "智力水平最高的全能旗舰机型，支持精细化的逻辑编写和深度的语言翻译与推理。",
    recommendPriority: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-Mini",
    category: "GPT系列",
    provider: "OpenAI",
    tags: ["极速", "高性价"],
    suitedFor: "适合高频次普通对话、日常问答、长篇翻译、批量文案处理",
    priceTag: "输入: ¥0.005/M | 补全: ¥0.015/M (白菜价级算力)",
    contextLimit: "128K 上下文",
    description: "无与伦比的极速敏捷型小微模型，兼顾高级智力与超低延迟体验。",
    recommendPriority: true,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    category: "Claude系列",
    provider: "Anthropic",
    tags: ["深度代码", "高感性"],
    suitedFor: "最懂程序猿的极客模型，擅长超长代码重构与前沿学术论文分析",
    priceTag: "输入: ¥0.15/M | 补全: ¥0.60/M (稳定高能渠道)",
    contextLimit: "200K 上下文",
    description: "广受开发者追捧的高智商程序编写标杆。文本表达行云流水，逻辑毫无破绽。",
    recommendPriority: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    category: "DeepSeek系列",
    provider: "DeepSeek",
    tags: ["全网爆款", "超低平价"],
    suitedFor: "万物皆可问，高性价比逻辑推理与日常大规模多任务并行",
    priceTag: "输入: ¥0.01/M | 补全: ¥0.02/M (极速国货之光)",
    contextLimit: "64K 上下文",
    description: "国内顶级大模型，推理智商直逼世界最先进旗舰，同时成本低至原厂 1 折起。",
    recommendPriority: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    category: "DeepSeek系列",
    provider: "DeepSeek",
    tags: ["深度思考", "思维链"],
    suitedFor: "超强数学证题、逻辑极复杂的算法纠错、深入研究分析",
    priceTag: "输入: ¥0.02/M | 补全: ¥0.08/M (强化学习硬核推理)",
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
    priceTag: "输入: ¥0.03/M | 补全: ¥0.09/M (谷歌官方黄金标准)",
    contextLimit: "1M 超大上下文",
    description: "支持超乎想象的多轮对话历史和多模态图像/音视频理解能力，稳定健壮。",
    recommendPriority: false,
  },
  {
    id: "gpt-image-1",
    name: "GPT Image Pro (gpt-image-1)",
    category: "AI 图像模型",
    provider: "Media Engine",
    tags: ["精细绘图", "超拟真"],
    suitedFor: "精准理解提示词，可直接生成带文字海报、C4D超写实三维风格、高光渲染插画",
    priceTag: "单次扣额: ¥0.12/张(直通1024分辨率)",
    contextLimit: "像素输出",
    description: "拥有出色的指令遵循能力、支持排版文字、画风高级优雅、色调立体且留白到位。",
    recommendPriority: true,
  },
  {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3.5",
    category: "AI 图像模型",
    provider: "Stability AI",
    tags: ["写实排版", "摄影感"],
    suitedFor: "现代海报排版、二次元逼真肖像、高档材质渲染、超宽画幅摄影",
    priceTag: "单次扣额: ¥0.08/张",
    contextLimit: "高清输出",
    description: "开源图像生成大器。可理解丰富的多行词汇提示，对透视和物理质感有着顶级再现力。",
    recommendPriority: false,
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan-trial",
    name: "新牛马体面版",
    price: "19.9",
    billing: "即用即充 / 终身有效",
    quota: "账户内得 250,000,000 积分（约可用 GPT-4o-mini 二十万次）",
    isPopular: false,
    suitedFor: "适合个人初期试水、基础学习与写周报等临时差遣",
    modelsSupported: ["GPT-4o-mini", "DeepSeek-V3", "常规生图节点"],
    features: [
      "自建高精服务器，独享不限速通道",
      "全天候 24h 售后客服服务",
      "支持接入 Cherry Studio 客户端",
      "无任何隐藏订阅费，积分终身不失效"
    ]
  },
  {
    id: "plan-creator",
    name: "高效创作者版",
    price: "59",
    billing: "特惠专享 / 无限期",
    quota: "账户内得 800,000,000 积分 + 额外赠送 100 张高清生图特权",
    isPopular: true,
    suitedFor: "独立客、小红书博主、跨境电商运营、效率达人",
    modelsSupported: ["全模型接入", "GPT-4o", "Claude 3.5 Sonnet", "DeepSeek R1", "GPT-Image-1"],
    features: [
      "解锁超写实 GPT Image 创意生图卡",
      "专享高优先级 VIP 算力分配",
      "支持开通无限画布流程及多人卡片共享",
      "支持多维提示词自动降噪与润色",
      "提供独家一键复制 Cursor 格式参数"
    ]
  },
  {
    id: "plan-pro",
    name: "研发极客专业版",
    price: "128",
    billing: "深度算力充值",
    quota: "账户内得 2,000,000,000 积分 + 极速API特惠授权",
    isPopular: false,
    suitedFor: "中大型应用开发者、全栈个人站长、代码狂热分子",
    modelsSupported: ["所有旗舰模型", "Claude全家桶", "API专线并发"],
    features: [
      "高达 50 线程的深度并发速率限制 (QPM)",
      "后台极速导出 API 调用账簿",
      "完全兼容 OpenAI / Langchain 原厂框架调用",
      "尊享 1v1 运维排障支持群"
    ]
  },
  {
    id: "plan-enterprise",
    name: "企业定制版",
    price: "599",
    billing: "专享定制 / 支持政企对公",
    quota: "定额大包多通道，支持独立分配内网网关",
    isPopular: false,
    suitedFor: "跨境机构、设计工作室、高校实验室科研采购",
    modelsSupported: ["完全定制模型名单", "专属内网专线节点"],
    features: [
      "针对细分工作流自训练模型托管支持",
      "签订具有法律效力的 SLAs 算力保障协议",
      "提供增值税专用发票 / 合规纳税发票",
      "企业定制私有化界面贴牌服务"
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
    title: "主流大客户端对接",
    items: [
      { id: "cherry", label: "🍒 Cherry Studio 接入教程", contentCode: "cherry" },
      { id: "cursor", label: "💻 Cursor / VS Code 极速接入", contentCode: "cursor" },
      { id: "nextchat", label: "💬 NextChat / LobeChat 双修", contentCode: "nextchat" },
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

**RONIN AI LAB** 是专门面向设计师、全栈工程师、科研工作者及自媒体博主专门设计的、可快速商用的全包级 AI 聚合基础设施。

我们通过精心研发的高级边缘缓存算法与分流系统，无缝连通各大顶流模型，以原厂价格的 **1-2折** 极速提供低延时、高额度算力服务。

#### 核心亮点说明
* **全模覆盖**：单密钥直通 GPT-4o, Claude 3.5 Sonnet, DeepSeek-V3, R1 满血版等上百种极品模型。
* **原生兼容**：全面对齐官方 OpenAI 格式响应，任何现有的支持 OpenAI 的工具仅需修改 API 地址即可即刻提速。
* **安全性高**：全站启用符合国家安全等级的数据链路加密，绝不缓存您的私人提示词与生成资产。` ,

  apikey: `### 🔑 如何获取商业 API 密钥

在 **RONIN AI LAB** 自助激活并取用 API token 非常简单，仅需以下 3 个步骤：

1. **登录控制台**：
   点击页面右上角或者直达链接 [RONIN 业务控制台](https://ai.ronin77.xyz/console) 进入控制面板页面。
   
2. **注册账户**：
   输入您常用的邮箱获取验证码即可快速开通权限。
   
3. **分配专属 Token**：
   * 在控制台左侧定位到 \`「令牌管理」\` 菜单。
   * 点击右上方 \`「添加新令牌」\` 按钮。
   * 自定义令牌名称并设置到期时间、额度保护（防止无功代扣）。
   * 点击保存并复制令牌。令牌格式一般形如 \`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`。
   
> **⚠️ 注意**：请妥善保存此令牌，由于安全加密，它在首次复制并关闭后将无法再次以明文重新读取。`,

  compatibility: `### 🌐 兼容 OpenAI 的标准接口规范

我们为全球开发者提供 100% 对齐 OpenAI SDK 报文响应的中转网关。

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

  cherry: `### 🍒 Cherry Studio 聚合客户端对接教程

[Cherry Studio](https://cherry-ai.com/) 是一款清爽好用、备受好评的跨平台智能助手，也是目前极其推荐的高阶桌面 AI 帮手。

#### ⚙️ 重装上阵：配置三部曲
1. **启动客户端**：
   打开 Cherry Studio，点击左下角的 \`设置\` 图标。
   
2. **添加自定义提供商 (OpenAI 兼容)**：
   * 在左侧菜单找到 \`「模型服务」\`，选择最下方的 \`「添加自定义(OpenAI兼容)」\`。
   * **提供商名称**：\`RONIN LAB\`
   * **API 密钥 (API Key)**：输入您的 \`sk-xxxxxx\` 专属令牌。
   * **API 地址 (API Base)**：填入 \`https://ai.ronin77.xyz/v1\`。
   
3. **拉取或激活模型清单**：
   * 点击下方 \`「管理模型」\`。
   * 手动输入增加 \`gpt-4o\`、\`gpt-4o-mini\` 或 \`deepseek-v3\`。
   * 勾选启用，现在，您可以在主聊天窗随时无缝调用 RONIN 处理日常事务了！`,

  cursor: `### 💻 Cursor 极速配置与接入

[Cursor](https://cursor.sh/) 作为目前世界上最顶级、也是增长最快的 AI 集成开发环境 (IDE)，支持全套 OpenAI 兼容中转网关。

#### 🛠️ 简单 4 步无缝集成

1. **进入设置面板**：
   在 Cursor 界面右上方点击齿轮图标，进入 \`Cursor Settings\` 面板。
   
2. **定位 AI 齿轮项**：
   转到左方标签 \`Features\` -> 找到并点击下方 \`Models\` 或 \`OpenAI API\` 模块。
   
3. **禁用官方连接，配置自定义域名**：
   * 将 \`Override OpenAI Base URL\` 这项修改为：
     \`\`\`http
     https://ai.ronin77.xyz/v1
     \`\`\`
   * 将您专属的 \`sk-xxxxxx\` 密钥填入 \`OpenAI API Key\` 输入框。
   * 点击右上角 **Save** 保存。
   
4. **定制模型名称**：
   * 在 \`Models\` 折叠层级中，添加您要使用的模型，例如：\`gpt-4o\`, \`claude-3-5-sonnet\`。
   * 您可以直接开启 \`Composer\`，完美开启流畅的高效 AI 辅助编程之旅。`,

  nextchat: `### 💬 NextChat / LobeChat 多端聚合双修

这两款是非常流行的中转前端，您可以像我们一样封装或在自己购买的主机上部署一个属于您个人的 NextChat，快速直连 RONIN 接口。

#### 🚀 部署配置法：

##### 1. 如果你在使用 NextChat (ChatGPT-Next-Web)：
直接进入客户端的「设置」菜单：
* **接口基准**：输入 \`https://ai.ronin77.xyz/v1\`
* **自定义密钥**：填入 \`sk-xxxxxxxx\`
* **模型覆盖**：添加 \`+gpt-4o,+deepseek-v3\` 以直接选取。

##### 2. 如果你在使用 LobeChat：
在设置页面找到 \`语言模型\` 栏目 -> 打开 \`OpenAI\` 配置开关：
* **代理地址 (API Endpoint)**：设置为 \`https://ai.ronin77.xyz/v1\`
* **API Key**：填入您的 \`sk-xxxxxxxx\`
* 点击测试连接，测试成功后即可完美加载。`,

  chatapi: `### ✉️ Chat Completions API 接口标准调用示例

对于需要开发自动化工具或在后端调用大模型的用户，可以直接运行如下多语言标准脚本：

#### 💻 方式 1: JavaScript (Node.js SDK)
\`\`\`javascript
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "sk-xxxxxxxxxxxxxx", // 您的 RONIN 令牌
  baseURL: "https://ai.ronin77.xyz/v1",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "你是一位精明强干的企业参谋" },
      { role: "user", content: "请用一句话说出如何实现高效团队协作？" }
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
        {"role": "user", "content": "请提供一份100字的黑金海报创意提示词。"}
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
\`\`\`
`,

  imgapi: `### 🖼️ Images Generations 绘图接口调用示例

通过此接口即可利用我们高效的绘图专线生产令人惊叹的高画质图片。

#### 💻 使用 curl 直接获取 Base64 图片：

\`\`\`bash
curl -X POST "https://ai.ronin77.xyz/v1/images/generations" \\
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-1",
    "prompt": "一座位于迷雾中的赛博朋克深空信号灯塔，黑金高光，写实，3D材质渲染",
    "size": "1024x1024",
    "response_format": "b64_json"
  }'
\`\`\`

#### 返回格式：
接口将返回符合 OpenAI 协议的 JSON，其中 \`data[0].b64_json\` 字段即为可以直接放入 HTML \`<img src=\"data:image/png;base64,...\" />\` 中渲染的原始图片字符串。`
};

export const QUICK_PROMPTS = [
  {
    title: "开业海报文案",
    desc: "给在威士忌酒吧写开业爆款文案",
    prompt: "帮我写一段威士忌主题酒吧开业预热文案，要带一点微醺而浪漫的文风，字数限制在 120 字内，适合朋友圈和小红书分发。"
  },
  {
    title: "黑金海报词",
    desc: "黑金风格高级3D海报提示词方案",
    prompt: "帮我生成一张黑金风格海报提示词。画面要求：一件散发淡金光芒的极简科技艺术雕塑处于漆黑的无暇反光大理石中央，写实，C4D质感，3D光影高渲染。"
  },
  {
    title: "小红书爆款",
    desc: "写一篇高赞科技好物种草贴文",
    prompt: "帮我写一个小红书爆款文案，推荐一款极简铝合金立式数码收纳架，标题要带吸睛emoji，正文包含多级分段，多用感叹号，有种草拔草感。"
  },
  {
    title: "C4D视觉海报",
    desc: "抽象太空舱科技海报设计方案",
    prompt: "帮我生成一个 C4D 太空概念数码海报视觉构图方案，包括主体物的摆放方向、三点光源（冷色主光、暖橘色辅助背光、荧光蓝顶光）的照耀细节和材质推荐。"
  }
];
