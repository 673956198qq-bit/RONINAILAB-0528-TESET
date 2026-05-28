import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  MousePointer2,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { CanvasCard, ChatMessage, ChatSession } from "./types";

type RouteName = "home" | "chat" | "image" | "canvas" | "models" | "pricing" | "docs" | "about";
type Notice = { text: string; type: "success" | "error" | "info" } | null;
type CanvasMenu = { screenX: number; screenY: number; canvasX: number; canvasY: number } | null;
type CanvasDialog = { type: "image" | "text"; x: number; y: number } | null;
type CanvasDrag =
  | { mode: "pan"; startX: number; startY: number; originX: number; originY: number }
  | { mode: "item"; id: string; offsetX: number; offsetY: number }
  | null;

const CONTROL_URL = "https://ai.ronin77.xyz/console";
const BASE_URL = "https://ai.ronin77.xyz/v1";
const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o", "deepseek-v3", "deepseek-r1", "claude-3-5-sonnet"];
const IMAGE_MODELS = ["gpt-image-1"];

const QUICK_PROMPTS = [
  "帮我整理一段产品发布文案，要求清晰、简洁、适合官网首屏。",
  "帮我优化一段品牌介绍，让表达更专业、更可信。",
  "帮我设计一个活动推广方案，包含主题、渠道、内容结构和执行步骤。",
  "请把我的需求整理成结构清晰的 AI 提示词，方便用于内容创作。",
];

const MODEL_CARDS = [
  { name: "GPT-4o mini", type: "对话模型", desc: "适合日常问答、内容整理、轻量代码和高频调用。", tags: ["低延迟", "高频使用"] },
  { name: "GPT-4o", type: "对话模型", desc: "适合复杂写作、方案推演、代码协助与多步骤分析。", tags: ["综合能力", "多模态"] },
  { name: "DeepSeek-V3", type: "对话模型", desc: "适合中文内容、结构化输出和日常生产力任务。", tags: ["中文友好", "通用任务"] },
  { name: "DeepSeek-R1", type: "推理模型", desc: "适合逻辑推理、研究分析和复杂问题拆解。", tags: ["推理", "研究"] },
  { name: "Claude 3.5 Sonnet", type: "对话模型", desc: "适合长文档理解、代码重构和严谨写作。", tags: ["长文", "代码"] },
  { name: "gpt-image-1", type: "图像模型", desc: "适合根据文本描述生成图片。", tags: ["图像生成", "视觉创作"] },
];

const PRICING_PLANS = [
  { name: "体验套餐", price: "19.9", desc: "适合初次体验与少量调用。", features: ["控制台自助开通", "基础对话与图像能力", "用量记录"] },
  { name: "创作者套餐", price: "59", desc: "适合内容创作、设计和运营工作。", features: ["更高可用额度", "图像生成支持", "常见客户端接入"], popular: true },
  { name: "专业套餐", price: "128", desc: "适合工作室和开发者高频调用。", features: ["多模型接入", "接口调用记录", "技术配置支持"] },
  { name: "企业套餐", price: "联系咨询", desc: "适合团队级或企业级需求。", features: ["额度方案咨询", "发票与对公支持", "更多团队能力即将开放"] },
];

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timeNow() {
  return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function fileSizeText(size: number) {
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024).toFixed(1)} KB`;
}

export default function App() {
  const [route, setRoute] = useState<RouteName>("home");
  const [accessCode, setAccessCode] = useState(() => (typeof window === "undefined" ? "" : window.localStorage.getItem("ronin_access_code") || ""));
  const [notice, setNotice] = useState<Notice>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() =>
    getLocalStorage<ChatSession[]>("ronin_chat_sessions", [
      {
        id: "default-session",
        title: "新的对话",
        model: "gpt-4o-mini",
        updatedAt: timeNow(),
        messages: [{ id: "welcome", role: "assistant", content: "你好，我是 RONIN AI LAB。请输入你的问题或创作需求。", timestamp: timeNow() }],
      },
    ])
  );
  const [currentSessionId, setCurrentSessionId] = useState("default-session");
  const [chatText, setChatText] = useState("");
  const [chatModel, setChatModel] = useState("gpt-4o-mini");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("gpt-image-1");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [imageLoading, setImageLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; prompt: string; time: string }[]>([]);

  const [canvasItems, setCanvasItems] = useState<CanvasCard[]>(() => getLocalStorage<CanvasCard[]>("ronin_canvas_items", []));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState<CanvasDrag>(null);
  const [menu, setMenu] = useState<CanvasMenu>(null);
  const [dialog, setDialog] = useState<CanvasDialog>(null);
  const [dialogPrompt, setDialogPrompt] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const pendingInsert = useRef({ x: 80, y: 80 });

  const currentSession = useMemo(() => chatSessions.find((session) => session.id === currentSessionId) || chatSessions[0], [chatSessions, currentSessionId]);
  const selectedItem = useMemo(() => canvasItems.find((item) => item.id === selectedItemId) || null, [canvasItems, selectedItemId]);

  useEffect(() => window.localStorage.setItem("ronin_access_code", accessCode), [accessCode]);
  useEffect(() => window.localStorage.setItem("ronin_chat_sessions", JSON.stringify(chatSessions)), [chatSessions]);
  useEffect(() => window.localStorage.setItem("ronin_canvas_items", JSON.stringify(canvasItems)), [canvasItems]);
  useEffect(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), [currentSession?.messages, chatLoading]);

  function toast(text: string, type: "success" | "error" | "info" = "info") {
    setNotice({ text, type });
    window.setTimeout(() => setNotice(null), 3200);
  }

  function createSession() {
    const id = uid("session");
    const session: ChatSession = {
      id,
      title: "新的对话",
      model: chatModel,
      updatedAt: timeNow(),
      messages: [{ id: uid("msg"), role: "assistant", content: "新的对话已创建。", timestamp: timeNow() }],
    };
    setChatSessions((prev) => [session, ...prev]);
    setCurrentSessionId(id);
  }

  async function sendChat(text?: string) {
    const content = (text || chatText).trim();
    if (!content || chatLoading) return;

    setRoute("chat");
    setChatText("");
    setChatLoading(true);

    const sessionId = currentSessionId;
    const session = currentSession;
    const userMessage: ChatMessage = { id: uid("msg"), role: "user", content, timestamp: timeNow() };

    setChatSessions((prev) =>
      prev.map((item) =>
        item.id === sessionId
          ? { ...item, title: content.slice(0, 18) || item.title, updatedAt: timeNow(), model: chatModel, messages: [...item.messages, userMessage] }
          : item
      )
    );

    const requestMessages = [...(session?.messages || []), userMessage]
      .filter((message) => !(message.role === "assistant" && message.content === "新的对话已创建。"))
      .map((message) => ({ role: message.role, content: message.content }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify({ model: chatModel, messages: requestMessages }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || `请求失败：${response.status}`);

      const reply = data.choices?.[0]?.message?.content || "未返回可显示内容。";
      const assistantMessage: ChatMessage = { id: uid("msg"), role: "assistant", content: reply, timestamp: timeNow() };
      setChatSessions((prev) => prev.map((item) => (item.id === sessionId ? { ...item, updatedAt: timeNow(), messages: [...item.messages, assistantMessage] } : item)));
    } catch (error: any) {
      const message = error?.message || "连接失败";
      const assistantMessage: ChatMessage = { id: uid("msg"), role: "assistant", content: `请求失败：${message}`, timestamp: timeNow() };
      setChatSessions((prev) => prev.map((item) => (item.id === sessionId ? { ...item, messages: [...item.messages, assistantMessage] } : item)));
      toast(message, "error");
    } finally {
      setChatLoading(false);
    }
  }

  async function generateImage(promptArg?: string) {
    const prompt = (promptArg || imagePrompt).trim();
    if (!prompt || imageLoading) return "";

    setImageLoading(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify({ model: imageModel, prompt, size: imageSize }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || `图像生成失败：${response.status}`);

      const url = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data?.[0]?.url;
      if (!url) throw new Error("未返回图片数据");

      setImages((prev) => [{ url, prompt, time: timeNow() }, ...prev]);
      setImagePrompt("");
      toast("图片已生成", "success");
      return url;
    } catch (error: any) {
      toast(error?.message || "生成失败", "error");
      return "";
    } finally {
      setImageLoading(false);
    }
  }

  function addCanvasItem(type: CanvasCard["type"], x: number, y: number, extra: Partial<CanvasCard> = {}) {
    const item: CanvasCard = {
      id: uid("item"),
      type,
      title: extra.title || (type === "sticky" ? "便签" : type === "text" ? "文本" : type === "prompt" ? "提示词" : type === "image" ? "图片" : type === "attachment" ? "附件" : "AI 结果"),
      content: extra.content || (type === "sticky" ? "双击或在右侧属性面板编辑内容" : type === "text" ? "输入文本" : type === "prompt" ? "输入提示词" : ""),
      x,
      y,
      width: extra.width || (type === "image" ? 340 : type === "attachment" ? 300 : 280),
      height: extra.height || (type === "image" ? 280 : type === "attachment" ? 130 : 150),
      imageUrl: extra.imageUrl,
      fileName: extra.fileName,
      fileSize: extra.fileSize,
      fileType: extra.fileType,
      zIndex: Date.now(),
    };
    setCanvasItems((prev) => [...prev, item]);
    setSelectedItemId(item.id);
    setMenu(null);
  }

  function updateCanvasItem(id: string, patch: Partial<CanvasCard>) {
    setCanvasItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function deleteSelectedItem() {
    if (!selectedItemId) return;
    setCanvasItems((prev) => prev.filter((item) => item.id !== selectedItemId));
    setSelectedItemId(null);
    setMenu(null);
  }

  function canvasPoint(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    const left = rect?.left || 0;
    const top = rect?.top || 0;
    return { x: Math.round((clientX - left - view.x) / view.scale), y: Math.round((clientY - top - view.y) / view.scale) };
  }

  function onCanvasWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const beforeX = (mouseX - view.x) / view.scale;
    const beforeY = (mouseY - view.y) / view.scale;
    const nextScale = Math.min(2.5, Math.max(0.3, Number((view.scale + (event.deltaY < 0 ? 0.08 : -0.08)).toFixed(2))));
    setView({ scale: nextScale, x: Math.round(mouseX - beforeX * nextScale), y: Math.round(mouseY - beforeY * nextScale) });
  }

  function onCanvasDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".canvas-item")) return;
    const point = canvasPoint(event.clientX, event.clientY);
    setMenu({ screenX: event.clientX, screenY: event.clientY, canvasX: point.x, canvasY: point.y });
  }

  function onImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("请选择图片文件", "error");
      return;
    }
    const position = pendingInsert.current;
    const reader = new FileReader();
    reader.onload = () => addCanvasItem("image", position.x, position.y, { title: file.name, content: "本地图片", imageUrl: String(reader.result), fileName: file.name, fileSize: fileSizeText(file.size), fileType: file.type });
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function onAttachmentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const position = pendingInsert.current;
    addCanvasItem("attachment", position.x, position.y, { title: file.name, content: "本地附件", fileName: file.name, fileSize: fileSizeText(file.size), fileType: file.type || "未知类型" });
    event.target.value = "";
  }

  async function submitCanvasDialog() {
    if (!dialog || !dialogPrompt.trim()) return;
    setDialogLoading(true);

    try {
      if (dialog.type === "image") {
        const response = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-access-code": accessCode },
          body: JSON.stringify({ model: "gpt-image-1", size: "1024x1024", prompt: dialogPrompt }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || data.error || "生成失败");
        const url = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data?.[0]?.url;
        if (!url) throw new Error("未返回图片数据");
        addCanvasItem("image", dialog.x, dialog.y, { title: "AI 生成图片", content: dialogPrompt, imageUrl: url, width: 340, height: 280 });
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-access-code": accessCode },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: dialogPrompt }] }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || data.error || "生成失败");
        const text = data.choices?.[0]?.message?.content || "未返回可显示内容。";
        addCanvasItem("result", dialog.x, dialog.y, { title: "AI 生成文本", content: text, width: 340, height: 190 });
      }
      setDialog(null);
      setDialogPrompt("");
    } catch (error: any) {
      toast(error?.message || "操作失败", "error");
    } finally {
      setDialogLoading(false);
    }
  }

  function exportCanvas() {
    const blob = new Blob([JSON.stringify(canvasItems, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ronin-canvas-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importCanvas(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) throw new Error("格式不正确");
        setCanvasItems(data);
        toast("画布已导入", "success");
      } catch {
        toast("导入失败，请检查 JSON 文件", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {notice && <div className={`fixed right-5 top-5 z-50 rounded-2xl px-4 py-3 text-sm shadow-xl ${notice.type === "error" ? "bg-red-600 text-white" : notice.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-950 text-white"}`}>{notice.text}</div>}
      <Header route={route} setRoute={setRoute} accessCode={accessCode} setAccessCode={setAccessCode} />

      {route === "home" && <Home setRoute={setRoute} chatText={chatText} setChatText={setChatText} chatModel={chatModel} setChatModel={setChatModel} sendChat={sendChat} />}
      {route === "chat" && <Chat createSession={createSession} chatSessions={chatSessions} currentSessionId={currentSessionId} setCurrentSessionId={setCurrentSessionId} currentSession={currentSession} chatModel={chatModel} setChatModel={setChatModel} chatText={chatText} setChatText={setChatText} chatLoading={chatLoading} sendChat={sendChat} chatBottomRef={chatBottomRef} />}
      {route === "image" && <ImagePage imagePrompt={imagePrompt} setImagePrompt={setImagePrompt} imageModel={imageModel} setImageModel={setImageModel} imageSize={imageSize} setImageSize={setImageSize} imageLoading={imageLoading} generateImage={generateImage} images={images} setRoute={setRoute} addCanvasItem={addCanvasItem} />}
      {route === "canvas" && <CanvasPage canvasRef={canvasRef} imageInputRef={imageInputRef} attachmentInputRef={attachmentInputRef} importInputRef={importInputRef} pendingInsert={pendingInsert} canvasItems={canvasItems} setCanvasItems={setCanvasItems} selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} selectedItem={selectedItem} view={view} setView={setView} drag={drag} setDrag={setDrag} menu={menu} setMenu={setMenu} dialog={dialog} setDialog={setDialog} dialogPrompt={dialogPrompt} setDialogPrompt={setDialogPrompt} dialogLoading={dialogLoading} addCanvasItem={addCanvasItem} updateCanvasItem={updateCanvasItem} deleteSelectedItem={deleteSelectedItem} canvasPoint={canvasPoint} onCanvasWheel={onCanvasWheel} onCanvasDoubleClick={onCanvasDoubleClick} onImageUpload={onImageUpload} onAttachmentUpload={onAttachmentUpload} submitCanvasDialog={submitCanvasDialog} exportCanvas={exportCanvas} importCanvas={importCanvas} toast={toast} />}
      {route === "models" && <Models />}
      {route === "pricing" && <Pricing />}
      {route === "docs" && <Docs />}
      {route === "about" && <About setRoute={setRoute} />}
    </div>
  );
}

function Header({ route, setRoute, accessCode, setAccessCode }: { route: RouteName; setRoute: (route: RouteName) => void; accessCode: string; setAccessCode: (value: string) => void }) {
  const navItems: { route: RouteName; label: string }[] = [
    { route: "home", label: "首页" },
    { route: "chat", label: "AI 对话" },
    { route: "image", label: "AI 图像" },
    { route: "canvas", label: "无限画布" },
    { route: "models", label: "模型广场" },
    { route: "pricing", label: "API 购买" },
    { route: "docs", label: "文档" },
    { route: "about", label: "关于" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <button onClick={() => setRoute("home")} className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-white"><Sparkles className="h-4 w-4" /></div>
          <div className="text-left"><div className="text-sm font-black">RONIN AI LAB</div><div className="text-[10px] font-semibold text-slate-400">AI Workbench</div></div>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => <button key={item.route} onClick={() => setRoute(item.route)} className={`rounded-full px-3 py-2 text-xs font-bold transition ${route === item.route ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>{item.label}</button>)}
        </nav>
        <div className="flex items-center gap-2">
          <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="访问码" type="password" className="hidden w-28 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-300 sm:block" />
          <a href={CONTROL_URL} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">控制台</a>
        </div>
      </div>
    </header>
  );
}

function Home({ setRoute, chatText, setChatText, chatModel, setChatModel, sendChat }: { setRoute: (route: RouteName) => void; chatText: string; setChatText: (value: string) => void; chatModel: string; setChatModel: (value: string) => void; sendChat: (text?: string) => void }) {
  const features = [
    { icon: Bot, title: "多模型 AI 对话", desc: "在一个界面中完成问答、写作、代码和资料整理。", target: "chat" as RouteName },
    { icon: ImageIcon, title: "AI 图像生成", desc: "输入画面描述，生成图片并保存到工作台。", target: "image" as RouteName },
    { icon: Layers, title: "创作者无限画布", desc: "用空白画布整理灵感、图片、附件和 AI 结果。", target: "canvas" as RouteName },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return <button key={feature.title} onClick={() => setRoute(feature.target)} className="rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div><h3 className="font-black">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{feature.desc}</p><div className="mt-5 flex items-center text-xs font-bold text-indigo-600">立即使用 <ChevronRight className="ml-1 h-3 w-3" /></div></button>;
        })}
      </section>
      <section className="py-16 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-bold text-indigo-600">AI 工作台 · API 聚合入口</div>
        <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">一个更适合创作者的 AI 工作台</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">集成 AI 对话、图像生成、无限画布、模型 API 与创意生产力工具。</p>
        <div className="mx-auto mt-8 max-w-3xl rounded-[30px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3"><select value={chatModel} onChange={(event) => setChatModel(event.target.value)} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold outline-none">{CHAT_MODELS.map((model) => <option key={model}>{model}</option>)}</select><span className="text-xs text-slate-400">通过服务端代理调用</span></div>
          <textarea value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="问问 RONIN AI LAB" rows={3} className="mt-4 w-full resize-none bg-transparent text-sm outline-none" />
          <div className="flex justify-end"><button onClick={() => sendChat()} className="rounded-2xl bg-indigo-600 p-3 text-white"><Send className="h-4 w-4" /></button></div>
        </div>
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">{QUICK_PROMPTS.map((prompt) => <button key={prompt} onClick={() => { setChatText(prompt); sendChat(prompt); }} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700">{prompt}</button>)}</div>
      </section>
    </main>
  );
}

function Chat({ createSession, chatSessions, currentSessionId, setCurrentSessionId, currentSession, chatModel, setChatModel, chatText, setChatText, chatLoading, sendChat, chatBottomRef }: { createSession: () => void; chatSessions: ChatSession[]; currentSessionId: string; setCurrentSessionId: (id: string) => void; currentSession: ChatSession; chatModel: string; setChatModel: (value: string) => void; chatText: string; setChatText: (value: string) => void; chatLoading: boolean; sendChat: (text?: string) => void; chatBottomRef: React.RefObject<HTMLDivElement> }) {
  return (
    <main className="flex h-[calc(100vh-4rem)]">
      <aside className="hidden w-72 border-r border-slate-200 bg-white p-4 md:block"><button onClick={createSession} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4" /> 新建对话</button><div className="space-y-2">{chatSessions.map((session) => <button key={session.id} onClick={() => setCurrentSessionId(session.id)} className={`w-full truncate rounded-2xl px-4 py-3 text-left text-sm ${session.id === currentSessionId ? "bg-indigo-50 font-bold text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}>{session.title}</button>)}</div></aside>
      <section className="flex flex-1 flex-col bg-slate-50"><div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3"><div><h2 className="font-black">AI 对话</h2><p className="text-xs text-slate-400">{currentSession?.model}</p></div><select value={chatModel} onChange={(event) => setChatModel(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">{CHAT_MODELS.map((model) => <option key={model}>{model}</option>)}</select></div><div className="flex-1 overflow-y-auto p-5"><div className="mx-auto max-w-3xl space-y-4">{currentSession?.messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-sm leading-7 shadow-sm ${message.role === "user" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{message.content}</div></div>)}{chatLoading && <div className="text-sm text-slate-400">正在生成回复...</div>}<div ref={chatBottomRef} /></div></div><form onSubmit={(event) => { event.preventDefault(); sendChat(); }} className="border-t border-slate-200 bg-white p-4"><div className="mx-auto flex max-w-3xl items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3"><textarea value={chatText} onChange={(event) => setChatText(event.target.value)} rows={2} placeholder="输入消息" className="flex-1 resize-none bg-transparent text-sm outline-none" /><button disabled={chatLoading} className="rounded-2xl bg-indigo-600 p-3 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button></div></form></section>
    </main>
  );
}

function ImagePage({ imagePrompt, setImagePrompt, imageModel, setImageModel, imageSize, setImageSize, imageLoading, generateImage, images, setRoute, addCanvasItem }: { imagePrompt: string; setImagePrompt: (value: string) => void; imageModel: string; setImageModel: (value: string) => void; imageSize: string; setImageSize: (value: string) => void; imageLoading: boolean; generateImage: () => Promise<string>; images: { url: string; prompt: string; time: string }[]; setRoute: (route: RouteName) => void; addCanvasItem: (type: CanvasCard["type"], x: number, y: number, extra?: Partial<CanvasCard>) => void }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row"><aside className="w-full border-r border-slate-200 bg-white p-5 md:w-80"><h2 className="mb-5 font-black">AI 图像生成</h2><label className="text-xs font-bold text-slate-500">提示词</label><textarea value={imagePrompt} onChange={(event) => setImagePrompt(event.target.value)} rows={6} placeholder="请输入你想生成的画面描述" className="mt-2 w-full resize-none rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-300" /><label className="mt-4 block text-xs font-bold text-slate-500">模型</label><select value={imageModel} onChange={(event) => setImageModel(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm">{IMAGE_MODELS.map((model) => <option key={model}>{model}</option>)}</select><label className="mt-4 block text-xs font-bold text-slate-500">尺寸</label><select value={imageSize} onChange={(event) => setImageSize(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm"><option>1024x1024</option></select><button onClick={() => generateImage()} disabled={imageLoading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white disabled:opacity-50">{imageLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 开始生成</button></aside><section className="flex-1 bg-slate-50 p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-black">生成结果</h2><p className="text-xs text-slate-400">输入提示词后，生成结果将在这里显示。</p></div><span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400">{images.length} 张</span></div>{images.length === 0 && !imageLoading ? <div className="grid min-h-[520px] place-items-center rounded-[32px] border border-dashed border-slate-300 bg-white text-center"><div><ImageIcon className="mx-auto mb-4 h-10 w-10 text-slate-300" /><p className="font-bold text-slate-500">暂无图片</p><p className="mt-2 text-sm text-slate-400">输入提示词后，生成结果将在这里显示。</p></div></div> : <div className="grid gap-5 md:grid-cols-2">{images.map((image) => <div key={`${image.url}-${image.time}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><img src={image.url} className="aspect-square w-full object-cover" alt={image.prompt} /><div className="p-4"><p className="line-clamp-2 text-sm text-slate-600">{image.prompt}</p><div className="mt-4 flex flex-wrap gap-2"><a href={image.url} download className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">下载</a><button onClick={() => navigator.clipboard.writeText(image.prompt)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">复制提示词</button><button onClick={() => { setRoute("canvas"); addCanvasItem("image", 80, 80, { title: "生成图片", content: image.prompt, imageUrl: image.url, width: 340, height: 280 }); }} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">发送到画布</button></div></div></div>)}</div>}</section></main>
  );
}

function CanvasPage(props: any) {
  const { canvasRef, imageInputRef, attachmentInputRef, importInputRef, pendingInsert, canvasItems, setCanvasItems, selectedItemId, setSelectedItemId, selectedItem, view, setView, drag, setDrag, menu, setMenu, dialog, setDialog, dialogPrompt, setDialogPrompt, dialogLoading, addCanvasItem, updateCanvasItem, deleteSelectedItem, canvasPoint, onCanvasWheel, onCanvasDoubleClick, onImageUpload, onAttachmentUpload, submitCanvasDialog, exportCanvas, importCanvas, toast } = props;
  return <main className="relative h-[calc(100vh-4rem)] overflow-hidden bg-slate-100"><input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageUpload} /><input ref={attachmentInputRef} type="file" className="hidden" onChange={onAttachmentUpload} /><input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importCanvas} /><div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><button onClick={() => addCanvasItem("sticky", 80, 80)} className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-slate-100">便签</button><button onClick={exportCanvas} className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-slate-100">导出</button><button onClick={() => importInputRef.current?.click()} className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-slate-100">导入</button><button onClick={() => { setCanvasItems([]); setSelectedItemId(null); }} className="rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50">清空</button></div><div ref={canvasRef} onWheel={onCanvasWheel} onDoubleClick={onCanvasDoubleClick} onMouseDown={(event) => { if ((event.target as HTMLElement).closest(".canvas-item")) return; setMenu(null); setDrag({ mode: "pan", startX: event.clientX, startY: event.clientY, originX: view.x, originY: view.y }); }} onMouseMove={(event) => { if (!drag) return; if (drag.mode === "pan") setView((current: any) => ({ ...current, x: drag.originX + event.clientX - drag.startX, y: drag.originY + event.clientY - drag.startY })); else { const point = canvasPoint(event.clientX, event.clientY); updateCanvasItem(drag.id, { x: point.x - drag.offsetX, y: point.y - drag.offsetY }); } }} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)} className="h-full w-full cursor-grab overflow-hidden active:cursor-grabbing" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.06) 1px, transparent 1px)", backgroundSize: `${32 * view.scale}px ${32 * view.scale}px`, backgroundPosition: `${view.x}px ${view.y}px` }}>{canvasItems.length === 0 && <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-slate-400"><MousePointer2 className="mx-auto mb-3 h-8 w-8" /><p className="font-bold">双击画布添加内容</p><p className="mt-2 text-sm">拖动画布移动视野，滚轮缩放</p></div>}<div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, width: 4000, height: 2600 }}>{canvasItems.map((item: CanvasCard) => <div key={item.id} onMouseDown={(event) => { event.stopPropagation(); const point = canvasPoint(event.clientX, event.clientY); setSelectedItemId(item.id); updateCanvasItem(item.id, { zIndex: Date.now() }); setDrag({ mode: "item", id: item.id, offsetX: point.x - item.x, offsetY: point.y - item.y }); }} className={`canvas-item absolute overflow-hidden rounded-2xl border bg-white shadow-sm ${selectedItemId === item.id ? "border-indigo-400 ring-4 ring-indigo-100" : "border-slate-200"}`} style={{ left: item.x, top: item.y, width: item.width, minHeight: item.height, zIndex: item.zIndex || 1 }}><div className="flex items-center justify-between border-b border-slate-100 px-3 py-2"><input value={item.title} onChange={(event) => updateCanvasItem(item.id, { title: event.target.value })} className="w-full bg-transparent text-xs font-black outline-none" /><button onClick={(event) => { event.stopPropagation(); setCanvasItems((prev: CanvasCard[]) => prev.filter((target) => target.id !== item.id)); }} className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"><X className="h-3 w-3" /></button></div>{item.type === "image" && item.imageUrl ? <div><img src={item.imageUrl} className="h-48 w-full object-cover" alt={item.title} /><div className="flex gap-2 p-3"><a href={item.imageUrl} download className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold">下载</a><a href={item.imageUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold">预览</a></div></div> : item.type === "attachment" ? <div className="p-4 text-sm"><FileText className="mb-2 h-6 w-6 text-indigo-500" /><p className="font-bold">{item.fileName}</p><p className="mt-1 text-xs text-slate-400">{item.fileSize} · {item.fileType}</p></div> : <textarea value={item.content} onChange={(event) => updateCanvasItem(item.id, { content: event.target.value })} className="h-32 w-full resize-none p-3 text-sm leading-6 outline-none" />}</div>)}</div></div>{menu && <div className="fixed z-50 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" style={{ left: menu.screenX, top: menu.screenY }}><button onClick={() => addCanvasItem("sticky", menu.canvasX, menu.canvasY)} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">添加便签</button><button onClick={() => addCanvasItem("text", menu.canvasX, menu.canvasY)} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">添加文本</button><button onClick={() => { pendingInsert.current = { x: menu.canvasX, y: menu.canvasY }; imageInputRef.current?.click(); setMenu(null); }} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">上传图片</button><button onClick={() => { pendingInsert.current = { x: menu.canvasX, y: menu.canvasY }; attachmentInputRef.current?.click(); setMenu(null); }} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">上传附件</button><button onClick={() => { setDialog({ type: "image", x: menu.canvasX, y: menu.canvasY }); setMenu(null); }} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">AI 生成图片</button><button onClick={() => { setDialog({ type: "text", x: menu.canvasX, y: menu.canvasY }); setMenu(null); }} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">AI 生成文案</button><button onClick={() => { toast("高清增强功能即将开放", "info"); setMenu(null); }} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">一键高清</button><button disabled={!selectedItemId} onClick={deleteSelectedItem} className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">删除选中项</button></div>}{selectedItem && <aside className="absolute right-4 top-4 z-20 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="font-black">属性</h3><button onClick={() => setSelectedItemId(null)}><X className="h-4 w-4" /></button></div><label className="text-xs text-slate-400">标题</label><input value={selectedItem.title} onChange={(event) => updateCanvasItem(selectedItem.id, { title: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" /><label className="mt-3 block text-xs text-slate-400">内容</label><textarea value={selectedItem.content} onChange={(event) => updateCanvasItem(selectedItem.id, { content: event.target.value })} rows={4} className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-2 text-sm" /><button onClick={() => navigator.clipboard.writeText(selectedItem.content)} className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">复制内容</button></aside>}<div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm"><button onClick={() => setView((current: any) => ({ ...current, scale: Math.max(0.3, Number((current.scale - 0.1).toFixed(2))) }))} className="rounded-full p-2 hover:bg-slate-100"><ZoomOut className="h-4 w-4" /></button><span className="w-12 text-center text-xs font-bold">{Math.round(view.scale * 100)}%</span><button onClick={() => setView((current: any) => ({ ...current, scale: Math.min(2.5, Number((current.scale + 0.1).toFixed(2))) }))} className="rounded-full p-2 hover:bg-slate-100"><ZoomIn className="h-4 w-4" /></button><button onClick={() => setView({ x: 0, y: 0, scale: 1 })} className="rounded-full p-2 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /></button></div>{dialog && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h3 className="font-black">{dialog.type === "image" ? "AI 生成图片" : "AI 生成文案"}</h3><button onClick={() => setDialog(null)}><X className="h-4 w-4" /></button></div><textarea value={dialogPrompt} onChange={(event) => setDialogPrompt(event.target.value)} placeholder="请输入需求" rows={5} className="w-full resize-none rounded-2xl border border-slate-200 p-3 text-sm outline-none" /><button onClick={submitCanvasDialog} disabled={dialogLoading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50">{dialogLoading && <Loader2 className="h-4 w-4 animate-spin" />} 生成到画布</button></div></div>}</main>;
}

function Models() { return <main className="mx-auto max-w-7xl px-5 py-12"><h1 className="text-3xl font-black">模型广场</h1><p className="mt-2 text-sm text-slate-500">价格与可用性以控制台配置为准。</p><div className="mt-8 grid gap-5 md:grid-cols-3">{MODEL_CARDS.map((model) => <div key={model.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-3 text-xs font-bold text-indigo-600">{model.type}</div><h3 className="font-black">{model.name}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{model.desc}</p><div className="mt-4 flex flex-wrap gap-2">{model.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{tag}</span>)}</div><a href={CONTROL_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-xs font-bold text-white">前往控制台</a></div>)}</div></main>; }
function Pricing() { return <main className="mx-auto max-w-7xl px-5 py-12 text-center"><h1 className="text-3xl font-black">灵活的 API 额度套餐</h1><p className="mt-2 text-sm text-slate-500">支付与充值请前往 API 控制台完成。</p><div className="mt-8 grid gap-5 md:grid-cols-4">{PRICING_PLANS.map((plan) => <div key={plan.name} className={`rounded-3xl border bg-white p-6 text-left shadow-sm ${plan.popular ? "border-indigo-300 ring-4 ring-indigo-50" : "border-slate-200"}`}><h3 className="font-black">{plan.name}</h3><div className="mt-4 text-3xl font-black">{plan.price}</div><p className="mt-2 text-sm text-slate-500">{plan.desc}</p><ul className="mt-5 space-y-3 text-sm text-slate-600">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{feature}</li>)}</ul><a href={CONTROL_URL} target="_blank" rel="noreferrer" className="mt-6 block rounded-2xl bg-indigo-600 py-3 text-center text-sm font-bold text-white">前往控制台</a></div>)}</div></main>; }
function Docs() { return <main className="mx-auto max-w-5xl px-5 py-12"><h1 className="text-3xl font-black">文档中心</h1><div className="mt-8 space-y-4"><Doc title="服务地址" text={BASE_URL} /><Doc title="如何使用" text="在控制台创建令牌，然后在兼容客户端中填写服务地址和令牌。" /><Doc title="文本调用" text="使用 /chat/completions，传入 model 与 messages。" /><Doc title="图像调用" text="使用 /images/generations，传入 model、prompt 与 size。" /><Doc title="常见错误" text="401 表示凭证错误；model not found 表示模型未配置；price not configured 表示价格未配置；insufficient balance 表示余额不足。" /></div></main>; }
function About({ setRoute }: { setRoute: (route: RouteName) => void }) { return <main className="mx-auto max-w-4xl px-5 py-16"><div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm"><h1 className="text-3xl font-black">关于 RONIN AI LAB</h1><p className="mt-5 leading-8 text-slate-600">RONIN AI LAB 是面向创作者、设计师和开发者的 AI 工作台。平台提供 AI 对话、图像生成、无限画布和 API 聚合入口，帮助用户更清晰地组织创意、内容和工具链。</p><button onClick={() => setRoute("home")} className="mt-8 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">返回首页</button></div></main>; }
function Doc({ title, text }: { title: string; text: string }) { return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">{title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{text}</p></section>; }
