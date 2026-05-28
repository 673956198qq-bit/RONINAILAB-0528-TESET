import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Image as ImageIcon, 
  Sliders, 
  Download, 
  Maximize2, 
  Plus, 
  Trash2, 
  Code, 
  BookOpen, 
  Compass, 
  DollarSign, 
  Activity, 
  Paperclip, 
  X, 
  ChevronRight, 
  Clock, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle,
  Cpu,
  Layers,
  StickyNote,
  FileUp,
  MapPin,
  Move,
  Info,
  Shield,
  Terminal,
  Zap
} from "lucide-react";
import Navbar from "./components/Navbar";
import AccessCodeModal from "./components/AccessCodeModal";
import { APP_MODELS, PRICING_PLANS, DOC_CATALOG, DOC_CONTENTS, QUICK_PROMPTS } from "./data";
import { ChatMessage, ChatSession, CanvasCard } from "./types";

export default function App() {
  // Navigation & Access Config
  const [currentRoute, setRoute] = useState<string>("home");
  const [accessCode, setAccessCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ronin_access_code") || "";
    }
    return "";
  });
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Notifications state
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // --- Multi-Model Chat States ---
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("ronin_chat_sessions");
      if (persisted) {
        try { return JSON.parse(persisted); } catch (e) { }
      }
    }
    return [
      {
        id: "default-session",
        title: "新开对话沙盒",
        messages: [
          {
            id: "msg-welcome",
            role: "assistant",
            content: "您好！我是 RONIN AI 融合助理。这里已被连接到聚合站核心，您可以调用 GPT、Claude 或 DeepSeek 处理文本和研发程序。请在下方输入您的首个课题开始探索吧！",
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }
        ],
        model: "gpt-4o-mini",
        updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>("default-session");
  const [chatInputText, setChatInputText] = useState("");
  const [selectedChatModel, setSelectedChatModel] = useState("gpt-4o-mini");
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- AI Drawing States ---
  const [drawPrompt, setDrawPrompt] = useState("");
  const [drawModel, setDrawModel] = useState("gpt-image-1");
  const [drawSize, setDrawSize] = useState("1024x1024");
  const [isDrawing, setIsDrawing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string; timestamp: string; isFallback?: boolean }[]>([]);

  // --- Infinite Canvas Workspace States ---
  const [canvasCards, setCanvasCards] = useState<CanvasCard[]>(() => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("ronin_canvas_cards");
      if (persisted) {
        try {
          return JSON.parse(persisted);
        } catch (e) {}
      }
    }
    return []; // Clear initial demo cards as requested. Start on a clean slate!
  });

  // --- New Commercial Context Menu & Local File Ref States ---
  const [doubleClickMenu, setDoubleClickMenu] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [canvasPopupDraw, setCanvasPopupDraw] = useState<{ canvasX: number; canvasY: number } | null>(null);
  const [popupDrawPrompt, setPopupDrawPrompt] = useState("");
  const [popupDrawModel, setPopupDrawModel] = useState("gpt-image-1");
  const [popupDrawSize, setPopupDrawSize] = useState("1024x1024");
  const [isPopupDrawing, setIsPopupDrawing] = useState(false);

  const [canvasPopupChat, setCanvasPopupChat] = useState<{ canvasX: number; canvasY: number } | null>(null);
  const [popupChatPrompt, setPopupChatPrompt] = useState("");
  const [popupChatModel, setPopupChatModel] = useState("gpt-4o-mini");
  const [isPopupWriting, setIsPopupWriting] = useState(false);

  const canvasImageFileInputRef = useRef<HTMLInputElement>(null);
  const canvasAttachmentFileInputRef = useRef<HTMLInputElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasTranslate, setCanvasTranslate] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });
  const [selectedCanvasCard, setSelectedCanvasCard] = useState<string | null>(null);
  const [activeCardDrag, setActiveCardDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [canvasFile, setCanvasFile] = useState<File | null>(null);
  const [canvasFilePreview, setCanvasFilePreview] = useState<string | null>(null);
  const [canvasPromptInput, setCanvasPromptInput] = useState("");
  const [canvasChatRequestInput, setCanvasChatRequestInput] = useState("");
  const [isCanvasImageGenerating, setIsCanvasImageGenerating] = useState(false);
  const [isCanvasTextGenerating, setIsCanvasTextGenerating] = useState(false);
  const [canvasImgModel, setCanvasImgModel] = useState("gpt-image-1");
  const [canvasImgSize, setCanvasImgSize] = useState("1024x1024");
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Models Filter State ---
  const [selectedModelCategory, setSelectedModelCategory] = useState<string>("全部");

  // --- Docs Active Section State ---
  const [activeCatalogItem, setActiveCatalogItem] = useState("intro");

  // --- Effects ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ronin_access_code", accessCode);
    }
  }, [accessCode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ronin_chat_sessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ronin_canvas_cards", JSON.stringify(canvasCards));
    }
  }, [canvasCards]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatSessions, currentSessionId]);

  // Toast notifier helper
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Switch to different routes & sync states
  const navigateToChat = (initialPrompt?: string, model?: string) => {
    let targetSessionId = currentSessionId;
    if (initialPrompt) {
      // Create a brand new session with this prompt immediately
      const newSessionId = `session-${Date.now()}`;
      const newSession: ChatSession = {
        id: newSessionId,
        title: initialPrompt.slice(0, 15) + "...",
        messages: [
          {
            id: `msg-user-init-${Date.now()}`,
            role: "user",
            content: initialPrompt,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }
        ],
        model: model || "gpt-4o-mini",
        updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      };
      setChatSessions([newSession, ...chatSessions]);
      setCurrentSessionId(newSessionId);
      targetSessionId = newSessionId;
      setRoute("chat");
      
      // Auto-trigger API call
      setTimeout(() => {
        triggerChatApiSend(initialPrompt, newSessionId, model || "gpt-4o-mini");
      }, 50);
    } else {
      setRoute("chat");
    }
  };

  // --- Unified Chat Action ---
  const handleChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim() || isChatSending) return;

    const userMessageText = chatInputText;
    setChatInputText("");

    // Append user message
    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        const userMsg: ChatMessage = {
          id: `msg-user-${Date.now()}`,
          role: "user",
          content: userMessageText,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        };
        const updatedMsgs = [...session.messages, userMsg];
        return {
          ...session,
          title: session.messages.length <= 1 ? userMessageText.substring(0, 12) + "..." : session.title,
          messages: updatedMsgs,
          updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      return session;
    });

    setChatSessions(updatedSessions);
    await triggerChatApiSend(userMessageText, currentSessionId, selectedChatModel, updatedSessions);
  };

  const triggerChatApiSend = async (
    textToSend: string, 
    sessionId: string, 
    modelToUse: string, 
    currentSessionsState?: ChatSession[]
  ) => {
    setIsChatSending(true);
    const activeSessions = currentSessionsState || chatSessions;
    const activeSession = activeSessions.find(s => s.id === sessionId);
    if (!activeSession) return;

    // Build complete historic messages payload format expected by back-end proxy
    const historicPayload = activeSession.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCode, // Secure access authorization headers
        },
        body: JSON.stringify({
          messages: historicPayload,
          model: modelToUse
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("ACCESS_CODE_REQUIRED");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败 (${response.status})`);
      }

      const resData = await response.json();
      const contentReply = resData.choices?.[0]?.message?.content || "无回复内容。";

      setChatSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const assistantMsg: ChatMessage = {
            id: `msg-assistant-${Date.now()}`,
            role: "assistant",
            content: contentReply,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          };
          return {
            ...s,
            messages: [...s.messages, assistantMsg],
            updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          };
        }
        return s;
      }));

    } catch (err: any) {
      console.error(err);
      let errMsg = "请求失败，请确保后端服务正常运行并检查本地网络连接。";
      if (err.message === "ACCESS_CODE_REQUIRED") {
        errMsg = "此平台已被管理员配置 APP_ACCESS_CODE 安全保护！请点击顶部导航栏上方的「已验证/验证」盾牌标志输入正确的密码。";
        setIsAccessModalOpen(true);
      } else {
        errMsg = `传输错误: ${err.message}`;
      }

      setChatSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: `⚠️ **系统提示**: ${errMsg}`,
                timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
              }
            ]
          };
        }
        return s;
      }));
    } finally {
      setIsChatSending(false);
    }
  };

  const handleCreateNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "新开对话沙盒",
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: "对话沙盒已净化完成，系统就绪。请开启您的极简咨询。",
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        }
      ],
      model: selectedChatModel,
      updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentSessionId(newId);
  };

  const handleDeleteSession = (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatSessions.length <= 1) {
      showToast("无法删除最后一个对话框", "info");
      return;
    }
    const filtered = chatSessions.filter(s => s.id !== sid);
    setChatSessions(filtered);
    if (currentSessionId === sid) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  // --- Unified Image Action ---
  const handleDrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawPrompt.trim() || isDrawing) return;

    setIsDrawing(true);
    showToast("RONIN 绘图管线已连接，正在全力渲染中...", "info");

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCode
        },
        body: JSON.stringify({
          prompt: drawPrompt,
          model: drawModel,
          size: drawSize
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAccessModalOpen(true);
          throw new Error("请先完成 APP_ACCESS_CODE 访问保护验证。");
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `绘图服务端出错 (HTTP ${response.status})`);
      }

      const data = await response.json();
      let finalImgUrl = "";

      if (data.data?.[0]?.b64_json) {
        finalImgUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      } else if (data.data?.[0]?.url) {
        finalImgUrl = data.data[0].url;
      } else {
        throw new Error("接口返回的图片数据为空，请重试。");
      }

      setGeneratedImages(prev => [
        {
          url: finalImgUrl,
          prompt: drawPrompt,
          timestamp: new Date().toLocaleTimeString("zh-CN")
        },
        ...prev
      ]);
      
      showToast("构图完毕！唯美大图已呈现及陈列。", "success");
    } catch (err: any) {
      showToast(err.message || "图像渲染发生了意料外的中断。", "error");
    } finally {
      setIsDrawing(false);
    }
  };

  // --- Infinite Canvas Actions & Mathematical Physics ---
  const addCardToCanvas = (type: "note" | "prompt" | "image" | "result", customUrl?: string) => {
    const id = `card-${Date.now()}`;
    
    // Calculate viewport center so the new card lands nicely in front of the creator
    const viewportWidth = canvasRef.current?.clientWidth || 800;
    const viewportHeight = canvasRef.current?.clientHeight || 600;
    
    const centerX = (viewportWidth / 2 - canvasTranslate.x) / canvasScale - 130;
    const centerY = (viewportHeight / 2 - canvasTranslate.y) / canvasScale - 80;

    const newCard: CanvasCard = {
      id,
      type,
      title: type === "note" 
        ? "📝 极速便签" 
        : type === "prompt" 
          ? "✍️ 灵感提示词" 
          : type === "result"
            ? "✨ AI文案"
            : "🖼️ 创意画幅",
      content: type === "note" 
        ? "点击这里开始撰写灵感..." 
        : type === "prompt" 
          ? "A cinematic photo of a cyberpunk ronin character standing in digital rain..." 
          : type === "result"
            ? "「万象融汇，瞬息创构」\n您的 AI 画布内容生成于此。"
            : "灵感参考特征",
      x: Math.max(20, Math.round(centerX)),
      y: Math.max(20, Math.round(centerY)),
      width: type === "image" ? 300 : 260,
      height: type === "image" ? 250 : 140,
      imageUrl: customUrl
    };

    setCanvasCards(prev => [...prev, newCard]);
    setSelectedCanvasCard(id); // focus on newly loaded card
    showToast(`已添加新卡片「${newCard.title}」至工作台`, "success");
  };

  const deleteCanvasCard = (cid: string) => {
    setCanvasCards(prev => prev.filter(c => c.id !== cid));
    if (selectedCanvasCard === cid) {
      setSelectedCanvasCard(null);
    }
    showToast("卡片已从当前画布清除", "info");
  };

  const handleCardContentChange = (cid: string, newText: string) => {
    setCanvasCards(prev => prev.map(c => {
      if (c.id === cid) {
        return { ...c, content: newText };
      }
      return c;
    }));
  };

  const handleCardTitleChange = (cid: string, newTitle: string) => {
    setCanvasCards(prev => prev.map(c => {
      if (c.id === cid) {
        return { ...c, title: newTitle };
      }
      return c;
    }));
  };

  // Draggable Card Physics under Scale Zoom
  const handleCardDragStart = (e: React.MouseEvent, card: CanvasCard) => {
    e.stopPropagation();
    
    // Bring clicked card to active z-index rendering top layer!
    setCanvasCards(prev => {
      const filtered = prev.filter(c => c.id !== card.id);
      return [...filtered, card];
    });

    setSelectedCanvasCard(card.id);
    
    // Calculate locked coordinate offset in canvas space
    const mouseCanvasX = (e.clientX - canvasTranslate.x) / canvasScale;
    const mouseCanvasY = (e.clientY - canvasTranslate.y) / canvasScale;
    
    const offsetX = mouseCanvasX - card.x;
    const offsetY = mouseCanvasY - card.y;

    setActiveCardDrag({
      id: card.id,
      offsetX,
      offsetY
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setDoubleClickMenu(null);
    if (activeCardDrag) return;
    // Do not drag canvas if we are interacting with interactive card nodes
    if (e.target instanceof HTMLElement && e.target.closest(".canvas-card")) return;
    setIsDraggingCanvas(true);
    setCanvasDragStart({
      x: e.clientX - canvasTranslate.x,
      y: e.clientY - canvasTranslate.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setCanvasTranslate({
        x: Math.round(e.clientX - canvasDragStart.x),
        y: Math.round(e.clientY - canvasDragStart.y)
      });
    } else if (activeCardDrag) {
      const { id, offsetX, offsetY } = activeCardDrag;
      
      // Calculate current mouse coordinates in canvas space
      const mouseCanvasX = (e.clientX - canvasTranslate.x) / canvasScale;
      const mouseCanvasY = (e.clientY - canvasTranslate.y) / canvasScale;

      setCanvasCards(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            x: Math.round(mouseCanvasX - offsetX),
            y: Math.round(mouseCanvasY - offsetY)
          };
        }
        return c;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setActiveCardDrag(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    // Prevent menu trigger if double clicking a card
    if (e.target instanceof HTMLElement && e.target.closest(".canvas-card")) return;
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Relative mouse coordinate in host bounding client rect viewport
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Reverse scale and coordinate translation calculations
    const canvasX = Math.round((mouseX - canvasTranslate.x) / canvasScale);
    const canvasY = Math.round((mouseY - canvasTranslate.y) / canvasScale);

    setDoubleClickMenu({
      x: e.clientX,
      y: e.clientY,
      canvasX,
      canvasY
    });
  };

  // Drag-Scroll Zoom Event attaching hook
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || currentRoute !== "canvas") return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.05;
      const scaleDelta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
      
      setCanvasScale(prev => {
        const nextScale = Math.min(2, Math.max(0.4, prev + scaleDelta));
        return parseFloat(nextScale.toFixed(2));
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef.current, currentRoute, canvasTranslate]);

  // Canvas File Upload handle (Reference attachment)
  const handleCanvasFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setCanvasFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCanvasFilePreview(reader.result as string);
        showToast(`已装载生手绘图底蕴: ${file.name}！`, "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvasFile = () => {
    setCanvasFile(null);
    setCanvasFilePreview(null);
  };

  // Generate Image from AI on canvas
  const handleCanvasInternalDraw = async () => {
    if (!canvasPromptInput.trim()) {
      showToast("若要在画布内渲染图像，请输入创意提示词", "info");
      return;
    }
    
    setIsCanvasImageGenerating(true);
    showToast("正在通过 API 创作，稍后放入视野中心...", "info");
    
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCode
        },
        body: JSON.stringify({
          prompt: canvasPromptInput + (canvasFile ? " (配合参考底稿)" : ""),
          model: canvasImgModel,
          size: canvasImgSize
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAccessModalOpen(true);
          throw new Error("请先验证安全性密钥防护 (APP_ACCESS_CODE)");
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "请求出错了");
      }

      const res = await response.json();
      let genUrl = "";
      if (res.data?.[0]?.b64_json) {
        genUrl = `data:image/png;base64,${res.data[0].b64_json}`;
      } else if (res.data?.[0]?.url) {
        genUrl = res.data[0].url;
      }

      if (!genUrl) throw new Error("代理网关未反馈可用像素图像");

      // Place in center of visual viewport
      const viewportWidth = canvasRef.current?.clientWidth || 800;
      const viewportHeight = canvasRef.current?.clientHeight || 600;
      const centerX = (viewportWidth / 2 - canvasTranslate.x) / canvasScale - 160;
      const centerY = (viewportHeight / 2 - canvasTranslate.y) / canvasScale - 125;

      const id = `card-${Date.now()}`;
      const newCard: CanvasCard = {
        id,
        type: "image",
        title: `🎨 AI原画: ${canvasPromptInput.slice(0, 10)}...`,
        content: canvasPromptInput,
        x: Math.max(20, Math.round(centerX)),
        y: Math.max(20, Math.round(centerY)),
        width: 320,
        height: 280,
        imageUrl: genUrl
      };

      setCanvasCards(prev => [...prev, newCard]);
      setCanvasPromptInput("");
      showToast("极高细节美图构件生成成功！已加入到画布视野中央。", "success");

    } catch (err: any) {
      showToast(`生图卡顿: ${err.message}`, "error");
    } finally {
      setIsCanvasImageGenerating(false);
    }
  };

  // Generate Copy Writing Text onto Canvas
  const handleCanvasInternalChat = async () => {
    if (!canvasChatRequestInput.trim()) {
      showToast("请输入需要生成的文案构思或大纲主题", "info");
      return;
    }

    setIsCanvasTextGenerating(true);
    showToast("New API 商业对话智算处理中...", "info");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCode
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `您现在是一位高级科技商业文案构思大师，请根据以下需求，输出一段具有穿透力、高级留白、能够直接用于宣发或海报配文的中文文案。直接给出文案词，不要带任何前言、后记，不要多余修饰。少于100字：\n\n需求：${canvasChatRequestInput}`
            }
          ],
          model: "gpt-4o-mini"
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAccessModalOpen(true);
          throw new Error("请先验证安全性密钥防护 (APP_ACCESS_CODE)");
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "写稿接口遇到了不可解响应");
      }

      const res = await response.json();
      const textOutput = res.choices?.[0]?.message?.content || "无可读创意推荐。";

      // Calculate Visual viewport center
      const viewportWidth = canvasRef.current?.clientWidth || 800;
      const viewportHeight = canvasRef.current?.clientHeight || 600;
      const centerX = (viewportWidth / 2 - canvasTranslate.x) / canvasScale - 140;
      const centerY = (viewportHeight / 2 - canvasTranslate.y) / canvasScale - 90;

      const id = `card-${Date.now()}`;
      const newCard: CanvasCard = {
        id,
        type: "result",
        title: `📝 AI爆款文案: ${canvasChatRequestInput.slice(0, 10)}...`,
        content: textOutput,
        x: Math.max(20, Math.round(centerX)),
        y: Math.max(20, Math.round(centerY)),
        width: 280,
        height: 180
      };

      setCanvasCards(prev => [...prev, newCard]);
      setCanvasChatRequestInput("");
      showToast("文案构图完毕！专属卡片已呈现于视野中央。", "success");

    } catch (err: any) {
      showToast(`文案延迟: ${err.message}`, "error");
    } finally {
      setIsCanvasTextGenerating(false);
    }
  };

  // Local Image file upload node creator
  const handleLocalImageUploadToCanvas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("支持上载的格式仅限本地图像文件 (如 .png, .jpg, .webp)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      
      const viewportWidth = canvasRef.current?.clientWidth || 800;
      const viewportHeight = canvasRef.current?.clientHeight || 600;
      const centerX = (viewportWidth / 2 - canvasTranslate.x) / canvasScale - 160;
      const centerY = (viewportHeight / 2 - canvasTranslate.y) / canvasScale - 125;

      const id = `card-${Date.now()}`;
      const newCard: CanvasCard = {
        id,
        type: "image",
        title: `📁 离线卡片: ${file.name}`,
        content: `规格: ${(file.size / 1024).toFixed(1)} KB`,
        x: Math.max(20, Math.round(centerX)),
        y: Math.max(20, Math.round(centerY)),
        width: 320,
        height: 280,
        imageUrl: b64
      };

      setCanvasCards(prev => [...prev, newCard]);
      showToast(`本地草图「${file.name}」已注入画布`, "success");
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Clear file selector input buffer
  };

  // Modern Coordinate projection upload builders
  const handleLocalImageCoordUpload = (e: React.ChangeEvent<HTMLInputElement>, canvasX: number, canvasY: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("支持上载的格式仅限本地图像文件 (如 .png, .jpg, .webp)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      const id = `card-${Date.now()}`;
      const newCard: CanvasCard = {
        id,
        type: "image",
        title: `🖼️ 导入底稿: ${file.name}`,
        content: `本地草图 | 大小: ${(file.size / 1024).toFixed(1)} KB`,
        x: canvasX,
        y: canvasY,
        width: 320,
        height: 280,
        imageUrl: b64,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`
      };
      setCanvasCards(prev => [...prev, newCard]);
      setSelectedCanvasCard(id);
      showToast("本地参考原画图导入成功！", "success");
      setDoubleClickMenu(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLocalAttachmentCoordUpload = (e: React.ChangeEvent<HTMLInputElement>, canvasX: number, canvasY: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;

    const id = `card-${Date.now()}`;
    const newCard: CanvasCard = {
      id,
      type: "note",
      title: `📎 开发附件: ${file.name}`,
      content: `文件名称: ${file.name}\n大小规格: ${sizeStr}\n文件类型: ${file.type || "二进制"}\n离线状态: 本地草稿资产`,
      x: canvasX,
      y: canvasY,
      width: 280,
      height: 154,
      fileName: file.name,
      fileSize: sizeStr
    };
    setCanvasCards(prev => [...prev, newCard]);
    setSelectedCanvasCard(id);
    showToast("本地附件信息注册成功！", "success");
    setDoubleClickMenu(null);
    e.target.value = "";
  };

  const handlePopupCanvasDraw = async (canvasX: number, canvasY: number) => {
    if (!popupDrawPrompt.trim()) {
      showToast("请输入创意提示词", "error");
      return;
    }
    setIsPopupDrawing(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCode
        },
        body: JSON.stringify({
          prompt: popupDrawPrompt,
          model: popupDrawModel,
          size: popupDrawSize
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败，状态码: ${response.status}`);
      }
      const data = await response.json();
      let finalImgUrl = "";
      if (data.data?.[0]?.b64_json) {
        finalImgUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      } else if (data.data?.[0]?.url) {
        finalImgUrl = data.data[0].url;
      } else {
        throw new Error("接口返回的图片数据为空，请重试。");
      }

      const id = `card-${Date.now()}`;
      const newCard: CanvasCard = {
        id,
        type: "image",
        title: `🎨 AI 创意画卷`,
        content: `模型: ${popupDrawModel} | 提示词: ${popupDrawPrompt}`,
        x: canvasX,
        y: canvasY,
        width: 320,
        height: 280,
        imageUrl: finalImgUrl
      };
      setCanvasCards(prev => [...prev, newCard]);
      setSelectedCanvasCard(id);
      showToast("画布图像派生成功！已生成于双击坐标。", "success");
      setCanvasPopupDraw(null);
      setPopupDrawPrompt("");
    } catch (err: any) {
      showToast(`绘图发生意外: ${err.message}`, "error");
    } finally {
      setIsPopupDrawing(false);
    }
  };

  const handlePopupCanvasChat = async (canvasX: number, canvasY: number) => {
    if (!popupChatPrompt.trim()) {
      showToast("请输入撰写大纲", "error");
      return;
    }
    setIsPopupWriting(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCode
        },
        body: JSON.stringify({
          model: popupChatModel,
          messages: [{ role: "user", content: popupChatPrompt }]
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败，状态码: ${response.status}`);
      }
      const data = await response.json();
      const txt = data.choices?.[0]?.message?.content || "";
      if (!txt) {
        throw new Error("接口返回的文案为空，请重试。");
      }

      const id = `card-${Date.now()}`;
      const newCard: CanvasCard = {
        id,
        type: "result",
        title: `✨ AI 润色文案`,
        content: txt,
        x: canvasX,
        y: canvasY,
        width: 300,
        height: 180
      };
      setCanvasCards(prev => [...prev, newCard]);
      setSelectedCanvasCard(id);
      showToast("专属智能文案撰写成功！已生成于双击坐标。", "success");
      setCanvasPopupChat(null);
      setPopupChatPrompt("");
    } catch (err: any) {
      showToast(`文案生成失败: ${err.message}`, "error");
    } finally {
      setIsPopupWriting(false);
    }
  };

  // Canvas Persistence serialization downloads and uploads
  const handleExportCanvas = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(canvasCards, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ronin-lab-canvas-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("我的创意画布配置文件已顺利导出并下载！", "success");
    } catch (error) {
      showToast("导出画布被本地配置拦截", "error");
    }
  };

  const handleImportCanvasJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setCanvasCards(imported);
          showToast("已成功导入画布配置！您的灵感白板已无缝置换。", "success");
        } else {
          showToast("加载失败: 根节点不是合规的 Ronin 节点数组列表", "error");
        }
      } catch (err) {
        showToast("配置文件语法存在污损，无法载入", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear loader element input buffer
  };


  return (
    <div className="relative min-h-screen flex flex-col bg-white text-slate-800 font-sans tracking-tight overflow-x-hidden">
      
      {/* Modern Premium Ambient Glowing Animated Background Blobs - Dimmed dramatically for commercial cleanliness */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] bg-gradient-to-tr from-indigo-200/10 to-teal-100/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05] animate-blob-1"></div>
        <div className="absolute top-[20%] -right-40 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-100/10 to-violet-200/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.04] animate-blob-2"></div>
        <div className="absolute -bottom-40 left-[10%] w-[45rem] h-[45rem] bg-gradient-to-tr from-indigo-200/10 to-teal-200/10 rounded-full mix-blend-multiply filter blur-[130px] opacity-[0.05] animate-blob-3"></div>
        <div className="absolute top-[45%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-gradient-to-br from-rose-100/10 to-indigo-100/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.04] animate-blob-1"></div>
      </div>

      {/* Inject custom dynamic keyframes animation styles blocks */}
      <style>{`
        @keyframes floatBlob1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.15); }
          66% { transform: translate(-35px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-70px, 70px) scale(1.2); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob3 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(60px, 40px) scale(0.95); }
          66% { transform: translate(-50px, -50px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob-1 {
          animation: floatBlob1 24s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: floatBlob2 28s infinite ease-in-out;
        }
        .animate-blob-3 {
          animation: floatBlob3 32s infinite ease-in-out;
        }
      `}</style>

      {/* 4px custom visual timeline decoration */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-indigo-600 to-indigo-950 relative z-10"></div>

      {/* Exquisite Static Notifications Portal */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl bg-slate-900 border border-slate-800 text-white max-w-sm">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-semibold">{notification.text}</span>
        </div>
      )}

      {/* Main Header */}
      <Navbar 
        currentRoute={currentRoute} 
        setRoute={setRoute} 
        accessCode={accessCode}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
      />

      {/* Primary Context Workspace Section */}
      <main className="relative z-10 flex-1 flex flex-col">
        
        {/* ========================================================
            一、首页 ROUTE: HOME
            ======================================================== */}
        {currentRoute === "home" && (
          <div className="flex-1 flex flex-col justify-start py-8 md:py-16 px-4 max-w-7xl mx-auto w-full" id="home-route-container">
            
            {/* Top Minimalist Display Banner Carousels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 sm:mb-16">
              
              <div 
                onClick={() => navigateToChat()}
                className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-200/50 p-6 rounded-[22px] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-bl-full group-hover:scale-110 duration-500"></div>
                <div className="p-3 bg-indigo-50/70 text-indigo-700 w-fit rounded-xl mb-4 group-hover:scale-105 transition-all">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="font-sans font-bold text-base text-slate-950">多模型对话智囊球</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  聚合 GPT-4o、Claude 及国产 DeepSeek 旗舰算力，享受一栈式闪击问答的快乐。
                </p>
                <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-[11px] font-bold text-indigo-600">
                  <span>立即启动对话沙盒</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => setRoute("image")}
                className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-200/50 p-6 rounded-[22px] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/40 rounded-bl-full group-hover:scale-110 duration-500"></div>
                <div className="p-3 bg-emerald-50/70 text-emerald-700 w-fit rounded-xl mb-4 group-hover:scale-105 transition-all">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="font-sans font-bold text-base text-slate-950">AI 创意绘图终端</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  提供 gpt-image-1 精准中文原图输出与 SD 精修，支持极致色彩与海报排字遵循。
                </p>
                <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-[11px] font-bold text-emerald-600">
                  <span>立即构思画面</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => setRoute("canvas")}
                className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-200/50 p-6 rounded-[22px] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/40 rounded-bl-full group-hover:scale-110 duration-500"></div>
                <div className="p-3 bg-amber-50/70 text-amber-700 w-fit rounded-xl mb-4 group-hover:scale-105 transition-all">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-sans font-bold text-base text-slate-950">创作者无限画布</h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  非线性白板工作空间。将灵感、提示词、附件原件和 AI生图进行无缝编排连线。
                </p>
                <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-[11px] font-bold text-amber-600">
                  <span>转入创作白板</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

            {/* Central Master Title (Anti-Hype, Elegant branding) */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 text-indigo-700 mb-4 border border-indigo-200/30">
                <Sparkles className="w-3 h-3 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} /> 
                可商用 AI SaaS 聚合站
              </span>
              <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-slate-950 tracking-tight leading-tight">
                一个更适合创作者的 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-600 to-indigo-950">
                  AI 工作台
                </span>
              </h1>
              <p className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
                集成 AI 对话、图像生成、无限画布、模型 API 与创意生产力工具。
              </p>
            </div>

            {/* Main Center Prompter Box Component */}
            <div className="w-full max-w-3xl mx-auto bg-white rounded-[26px] border border-slate-200/70 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.02)] mb-8">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">选择当前问答模型:</span>
                  <select 
                    value={selectedChatModel}
                    onChange={(e) => setSelectedChatModel(e.target.value)}
                    className="text-xs font-bold text-indigo-700 bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-transparent focus:border-indigo-300 outline-none cursor-pointer"
                  >
                    <option value="gpt-4o-mini">GPT-4o-mini (推荐/日常)</option>
                    <option value="gpt-4o">GPT-4o (精细化)</option>
                    <option value="deepseek-v3">DeepSeek-V3 (超平价)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (编程高手)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-slate-400 font-semibold">New API 接入状态: 良好</span>
                </div>
              </div>

              {/* Huge Quick Input field (Redirects and triggers automatically on submit) */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (chatInputText.trim()) {
                  navigateToChat(chatInputText, selectedChatModel);
                  setChatInputText("");
                }
              }} className="pt-4">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="问问 RONIN AI LAB（例如：帮我起草一份高端咖啡店的创意营销方案）..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="w-full text-sm placeholder-slate-400 bg-transparent text-slate-800 outline-none resize-none pr-12 focus:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (chatInputText.trim()) {
                          navigateToChat(chatInputText, selectedChatModel);
                          setChatInputText("");
                        }
                      }
                    }}
                  />
                  <div className="absolute bottom-1 right-1 flex gap-2">
                    <button
                      type="submit"
                      className="p-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl shadow-sm transition group"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 duration-200" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Lower feature pills tag bar */}
              <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-50 text-[11px] text-slate-400">
                <span className="font-semibold self-center">快速指令配给:</span>
                <button 
                  onClick={() => navigateToChat("帮我深度联网搜索并整理近一季度人工智能中转平台的市场主流报价，以 Markdown 报表返回。", selectedChatModel)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/50 rounded-lg"
                >
                  🌐 联网检索模式
                </button>
                <button 
                  onClick={() => { setRoute("image"); setDrawPrompt("生成一张黑金风格高科技折片海报"); }}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200/50 rounded-lg"
                >
                  🎨 唤醒生图工作流
                </button>
                <button 
                  onClick={() => navigateToChat("请帮我进行文案提示词优化，我的受众是青年群体，以下是我的底稿：...", selectedChatModel)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 border border-slate-200/50 rounded-lg"
                >
                  📝 提示词自动降噪
                </button>
              </div>
            </div>

            {/* Ready-made sample prompt block triggers */}
            <div className="w-full max-w-3xl mx-auto mb-16">
              <span className="block text-xs font-bold text-slate-400 mb-3 text-center sm:text-left">
                💡 快速灵感对撞示例（点击即可免配置直达对话）
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigateToChat(qp.prompt, selectedChatModel)}
                    className="p-4 bg-white hover:bg-indigo-50/20 border border-slate-200/40 rounded-2xl cursor-pointer hover:border-indigo-400/50 transition duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">{qp.title}</h5>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 duration-200" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-normal line-clamp-1">
                      {qp.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Capabilities overview Grid */}
            <div className="border-t border-slate-200/60 pt-12 text-center pb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                RONIN AI LAB 的四大底层核心基石
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-700 flex items-center justify-center mb-3">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">100% 连通 Native API</span>
                  <span className="text-[10px] text-slate-400 mt-1">杜绝套壳缓存，毫秒级快速握手响应</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-700 flex items-center justify-center mb-3">
                    <Code className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">全面对齐 OpenAI 契约</span>
                  <span className="text-[10px] text-slate-400 mt-1">支持常见第三方客户端即插即用</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-700 flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">数据端到端高级保密</span>
                  <span className="text-[10px] text-slate-400 mt-1">非对称会话链路安全，对隐私极度考究</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-700 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">高并发边缘智能代理</span>
                  <span className="text-[10px] text-slate-400 mt-1">专线优化多路负载，无损流式输出</span>
                </div>
              </div>
            </div>

          </div>
        )}


        {/* ========================================================
            二、AI 对话页面 ROUTE: CHAT
            ======================================================== */}
        {currentRoute === "chat" && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4.25rem)] overflow-hidden">
            
            {/* Left sidebar: Dialogue History Records */}
            <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-200">
                <button
                  onClick={handleCreateNewSession}
                  id="new-chat-session-btn"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-slate-900 rounded-xl transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>新建对话信道</span>
                </button>
              </div>

              {/* Chat Session Scroll area */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <span className="px-3 py-1.5 block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  历史会话缓存 ({chatSessions.length})
                </span>
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setCurrentSessionId(session.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-xs ${
                      session.id === currentSessionId
                        ? "bg-white border border-slate-200 shadow-sm text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition whitespace-nowrap"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Sidebar bottom indicator */}
              <div className="p-4 border-t border-slate-200 text-[10px] text-slate-400 bg-slate-100/50">
                <span className="block font-bold">💡 存储提示:</span>
                历史会话仅缓存于您本地的浏览器本地存储中，保证隐私安全。
              </div>
            </aside>

            {/* Chat screen panel */}
            <section className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">
                      {chatSessions.find(s => s.id === currentSessionId)?.title || "新开对话沙盒"}
                    </h2>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      端到端高速网关代理直连：ai.ronin77.xyz
                    </span>
                  </div>
                </div>

                {/* Switcher in Chat Header */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold">模型:</span>
                  <select
                    value={selectedChatModel}
                    onChange={(e) => {
                      const modelVal = e.target.value;
                      setSelectedChatModel(modelVal);
                      setChatSessions(prev => prev.map(s => {
                        if (s.id === currentSessionId) {
                          return { ...s, model: modelVal };
                        }
                        return s;
                      }));
                      showToast(`已成功将本轮会话模型切换为 ${modelVal}`, "info");
                    }}
                    className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="gpt-4o-mini">GPT-4o-mini (推荐)</option>
                    <option value="gpt-4o">GPT-4o旗舰版</option>
                    <option value="deepseek-v3">DeepSeek-V3</option>
                    <option value="deepseek-r1">DeepSeek-R1 (思考模型)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>

              {/* Scroll Messages Box */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatSessions.find(s => s.id === currentSessionId)?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-4xl mx-auto ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`p-2.5 rounded-2xl h-10 w-10 flex items-center justify-center shrink-0 border ${
                      msg.role === "user" 
                        ? "bg-slate-900 border-slate-950 text-white" 
                        : "bg-indigo-50 border-indigo-100 text-indigo-700"
                    }`}>
                      {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                    </div>

                    <div className="flex flex-col space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-bold">{msg.role === "user" ? "您" : "RONIN 助理"}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      
                      {/* Message Content render */}
                      <div className={`p-4 rounded-[20px] text-xs leading-relaxed border shadow-sm ${
                        msg.role === "user"
                          ? "bg-indigo-600/5 text-slate-900 border-indigo-200/50"
                          : "bg-slate-50 text-slate-800 border-slate-200/70"
                      }`}>
                        
                        {/* Simply parsing newlines or simple bold code snippets */}
                        {msg.content.split("\n").map((para, pIdx) => {
                          if (para.startsWith("###")) {
                            return <h3 key={pIdx} className="text-xs font-extrabold text-slate-950 mt-3 mb-1.5">{para.replace("###", "")}</h3>;
                          }
                          if (para.startsWith("* **")) {
                            return <p key={pIdx} className="text-xs my-1 pl-2 border-l-2 border-indigo-300">💡 {para.substring(2)}</p>;
                          }
                          if (para.includes("`") && para.indexOf("`") !== para.lastIndexOf("`")) {
                            return (
                              <p key={pIdx} className="my-1.5">
                                {para.split("`").map((chunk, cIdx) => 
                                  cIdx % 2 === 1 ? (
                                    <code key={cIdx} className="px-1 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-semibold">{chunk}</code>
                                  ) : chunk
                                )}
                              </p>
                            );
                          }
                          return <p key={pIdx} className={para.trim() === "" ? "h-2" : "my-1"}>{para}</p>;
                        })}

                      </div>
                    </div>
                  </div>
                ))}

                {isChatSending && (
                  <div className="flex gap-3 max-w-4xl mx-auto">
                    <div className="p-2.5 rounded-2xl h-10 w-10 bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Bot className="w-5 h-5 text-indigo-600 animate-spin" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">RONIN 助理 正在极速思考并组装回答...</span>
                      <div className="px-4 py-3 rounded-2xl border bg-slate-50 border-slate-200 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat send text form */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={handleChatSend} className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={`使用 ${selectedChatModel} 向 RONIN AI 提问... 按 Enter 发送`}
                      className="w-full pl-4 pr-12 py-3 text-xs bg-white text-slate-800 border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-600"
                      disabled={isChatSending}
                    />
                    <button
                      type="submit"
                      disabled={isChatSending || !chatInputText.trim()}
                      className="absolute right-2 p-2 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl transition disabled:opacity-40 disabled:hover:bg-indigo-600"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    * 对话链路将统一上行至代理端，数据绝对隔离，完全适配可商业化的 New API 网关。
                  </p>
                </div>
              </div>

            </section>
          </div>
        )}


        {/* ========================================================
            三、AI 绘画页面 ROUTE: IMAGE
            ======================================================== */}
        {currentRoute === "image" && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4.25rem)] overflow-hidden" id="draw-route-container">
            
            {/* Left panels adjustments */}
            <aside className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shrink-0">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>绘图参数配置中心</span>
                  </h3>
                  <div className="h-[1px] bg-slate-200 my-3"></div>
                </div>

                <form onSubmit={handleDrawSubmit} className="space-y-4">
                  {/* Prompt Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      原厂中文词/提示词汇 (Prompt)
                    </label>
                    <textarea
                      rows={4}
                      value={drawPrompt}
                      onChange={(e) => setDrawPrompt(e.target.value)}
                      placeholder="例如：黑金风格的奢华咖啡杯处于反光的太空金属地表上，冷色调主光，写实，3D材质感强烈..."
                      className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                      required
                    />
                    <span className="block text-[10px] text-slate-400 mt-1">
                      * 支持直接键入中文，模型将进行语义降噪与智能拓写。
                    </span>
                  </div>

                  {/* Model Choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      选择AI意境图大模型
                    </label>
                    <select
                      value={drawModel}
                      onChange={(e) => setDrawModel(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="gpt-image-1">gpt-image-1 (精细排版/黑金高光设计)</option>
                      <option value="stable-diffusion-3">Stable Diffusion 3.5 (写实插画)</option>
                    </select>
                  </div>

                  {/* Size Choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      输出像素分辨率(Size)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { size: "1024x1024", label: "1:1 方形大图" },
                        { size: "16:9", label: "高端横版海报" }, 
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setDrawSize(item.size)}
                          className={`p-2.5 text-xs border rounded-xl font-medium transition ${
                            drawSize === item.size
                              ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 font-bold"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submitting Button */}
                  <button
                    type="submit"
                    disabled={isDrawing}
                    id="trigger-render-btn"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold text-white bg-slate-950 hover:bg-indigo-950 transition shadow-md disabled:bg-slate-400 duration-200"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isDrawing ? "画面构件搭建中..." : "启动高精图片渲染"}</span>
                  </button>
                </form>
              </div>

              {/* Bottom notice pricing warning */}
              <div className="mt-8 p-3 rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-400">
                <span className="block font-bold mb-1">⚖️ 商业记账提示</span>
                单张 1024 像素渲染直接连接 New API \`/v1/images/generations\` 特惠渠道扣除 0.12 元/张。无需购买官方昂贵 API，更贴合出海牛马商业需求。
              </div>

            </aside>

            {/* Right panel: Images visual output */}
            <section className="flex-1 bg-slate-100 p-6 overflow-y-auto flex flex-col min-h-0">
              
              {/* Header inside result section */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    创意画面陈列区
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    展示本轮所提交并成功生成的画卷卡片大图。
                  </p>
                </div>
                
                <span className="text-[11px] text-slate-400 font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  当前已生成作品: {generatedImages.length}
                </span>
              </div>

              {/* Loader widget */}
              {isDrawing && (
                <div className="p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg flex flex-col items-center justify-center text-center max-w-lg mx-auto mb-6 animate-pulse z-10">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                    <Activity className="w-5 h-5 text-emerald-600 animate-spin" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 animate-bounce">
                    正在执行图像网关生成序列...
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    系统正向您的 New API 端点安全上报，该过程通常需要 10-15 秒以返回超清像素图像。整个过程基于离线防劫持代理。
                  </p>
                </div>
              )}

              {/* Empty state when there is no data and no active generation */}
              {generatedImages.length === 0 && !isDrawing && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-xs rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.01)] text-center max-w-xl mx-auto my-auto w-full">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-150 text-emerald-600 mb-4 animate-bounce">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">输入灵感提示词，启动商用级图像生成</h3>
                  <div className="h-[1px] bg-slate-200/60 w-24 my-3 mx-auto"></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                    通过 RONIN AI LAB 绘图控制台直接对接行业旗舰级精绘端点。无需购买高昂官方账号，即可非线性生产高画幅产品原稿、插画底片、排版配图。
                  </p>
                  <p className="text-[10px] text-slate-350 mt-4 font-mono">
                    💡 请在左侧参数栏输入描述，并点击「启动高精图片渲染」按钮
                  </p>
                </div>
              )}

              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {generatedImages.map((img, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-[24px] overflow-hidden border border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] group relative"
                  >
                    
                    {/* Visual container */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img 
                        src={img.url} 
                        alt={img.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 duration-700"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Notice Overlay if fallbacked */}
                      {img.isFallback && (
                        <div className="absolute top-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-amber-950/80 text-amber-100 text-[10px] font-semibold flex gap-2 items-start backdrop-blur-xs z-10">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>未在本地配置 NEWAPI_KEY，已启动高保真样本图以供测试体验。</span>
                        </div>
                      )}

                      {/* Hover actions menu cards */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-3.5 p-4 z-10 text-center">
                        <p className="text-[10.5px] text-slate-200 line-clamp-3 px-2 leading-relaxed font-medium">
                          提示词: {img.prompt}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <a 
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 py-1.5 bg-white hover:bg-slate-100 text-slate-950 rounded-lg text-[10px] font-bold shadow transition flex items-center gap-1 cursor-pointer"
                            title="在新网页中查看大原图"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>在新窗口浏览</span>
                          </a>

                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(img.prompt);
                              showToast("已成功复制提示词底稿至剪贴板", "success");
                            }}
                            className="p-2 py-1.5 bg-white hover:bg-slate-100 text-slate-950 rounded-lg text-[10px] font-bold shadow transition flex items-center gap-1 cursor-pointer"
                            title="复制提示词"
                          >
                            <Copy className="w-3 h-3" />
                            <span>复制提示词</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              // Send to workspace infinite canvas
                              const id = `card-${Date.now()}`;
                              const newCard: CanvasCard = {
                                id,
                                type: "image",
                                title: `🎨 AI 渲染投放: ${img.prompt.slice(0, 10)}...`,
                                content: `渲染模型: gpt-image-1 | 生成于: ${img.timestamp}`,
                                x: Math.round((Math.random() - 0.5) * 160),
                                y: Math.round((Math.random() - 0.5) * 160),
                                width: 320,
                                height: 280,
                                imageUrl: img.url
                              };
                              setCanvasCards(prev => [...prev, newCard]);
                              setSelectedCanvasCard(id);
                              showToast("图像成功合流发送至「无限画布」，请切换到白板选项卡进行查摆编排！", "success");
                            }}
                            className="p-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold shadow transition flex items-center gap-1 cursor-pointer"
                            title="投放至底稿画布"
                          >
                            <Layers className="w-3 h-3 text-emerald-300" />
                            <span>投放至白板</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer bar */}
                    <div className="p-4 bg-white">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold">
                        {img.timestamp}
                      </span>
                      <h4 className="font-sans font-bold text-xs text-slate-900 mt-2">
                        提示词:
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 leading-normal line-clamp-2">
                        {img.prompt}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

            </section>
          </div>
        )}


        {/* ========================================================
            四、无限画布页面 ROUTE: CANVAS
            ======================================================== */}
        {currentRoute === "canvas" && (
          <div className="flex-1 flex flex-col h-[calc(100vh-4.25rem)] overflow-hidden" id="workspace-canvas-root">
            
            {/* Top Workspace Command Bar */}
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs z-20">
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>RONIN 创意无限白板工作台</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded-md font-mono">v1.1 Commercial</span>
                  </h2>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    融合 AI 算力与拖拽白板的非线性生产力空间。点击、拖拽卡片，支持滚轮无极缩放。
                  </span>
                </div>
              </div>
 
              {/* Top Persistence Actions and Builders */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addCardToCanvas("note")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold transition"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                  <span>添加灵感便签</span>
                </button>
                <button
                  type="button"
                  onClick={() => addCardToCanvas("prompt")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold transition"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>添加提示词卡</span>
                </button>
                <button
                  type="button"
                  onClick={() => addCardToCanvas("result")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-800 font-bold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>添加空白结果卡</span>
                </button>

                <div className="h-5 w-[1px] bg-slate-200 mx-2"></div>

                {/* Import / Export JSON operations */}
                <button
                  type="button"
                  onClick={handleExportCanvas}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold transition"
                  title="将当前画布状态导出为 JSON 文件流本地保存"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>备份导出</span>
                </button>
                
                <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold cursor-pointer transition">
                  <FileUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>导入恢复</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportCanvasJSON}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("确定要悉数清空画布中的所有卡片与渲染原图吗？此操作不可撤销。")) {
                      setCanvasCards([]);
                      setSelectedCanvasCard(null);
                      showToast("画布卡片链已完成重置清空", "info");
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-50 text-rose-600 border border-transparent font-bold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空白板</span>
                </button>
              </div>

            </div>

            {/* Main Interactive Compartments */}
            <div className="flex-1 flex flex-col lg:flex-row relative bg-slate-50 overflow-hidden">
              
              {/* Left Panel: Creator AI Synthesizer and local assets loader */}
              <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between z-10 overflow-y-auto">
                <div className="space-y-6">
                  
                  {/* Image Generation Accourde */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                        画幅直达生图引擎
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-black uppercase">gpt-image-1</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500">
                        写下创意渲染灵感 prompt:
                      </label>
                      <textarea
                        rows={3}
                        value={canvasPromptInput}
                        onChange={(e) => setCanvasPromptInput(e.target.value)}
                        placeholder="高级黑金质感的可乐罐，置于高反光大理石太空基底，背景赛博霓虹散焦，特写极速极简..."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Model & Dimensions selection for canvas image generation */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="block text-slate-400 font-bold mb-1">意境画幅模型</span>
                        <select
                          value={canvasImgModel}
                          onChange={(e) => setCanvasImgModel(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <option value="gpt-image-1">gpt-image-1 (黑金排版)</option>
                          <option value="stable-diffusion-3">Stable Diffusion 3.5</option>
                        </select>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold mb-1">尺寸像素规格</span>
                        <select
                          value={canvasImgSize}
                          onChange={(e) => setCanvasImgSize(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <option value="1024x1024">1024x1024 (1:1)</option>
                          <option value="16:9">16:9 横屏海报</option>
                          <option value="9:16">9:16 竖屏手机卡</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCanvasInternalDraw}
                      disabled={isCanvasImageGenerating}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition shadow-xs flex items-center justify-center gap-1.5 disabled:bg-slate-300"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isCanvasImageGenerating ? 'animate-spin' : ''}`} />
                      <span>{isCanvasImageGenerating ? "色彩矩阵配准中..." : "合成生成图像至画布"}</span>
                    </button>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-4"></div>

                  {/* AI Copywriting to result card */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                        极速文案润色排版
                      </span>
                      <span className="text-[10px] text-slate-450 font-mono font-black">gpt-4o-mini</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500">
                        需要撰写的文案需求或大纲主题:
                      </label>
                      <input
                        type="text"
                        value={canvasChatRequestInput}
                        onChange={(e) => setCanvasChatRequestInput(e.target.value)}
                        placeholder="例如：科技发布会口号、咖啡标语..."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-violet-600"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCanvasInternalChat();
                          }
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCanvasInternalChat}
                      disabled={isCanvasTextGenerating}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-slate-900 transition flex items-center justify-center gap-1.5 disabled:bg-slate-300"
                    >
                      <FileText className={`w-3.5 h-3.5 text-indigo-200 ${isCanvasTextGenerating ? 'animate-bounce' : ''}`} />
                      <span>{isCanvasTextGenerating ? "文字引擎极速拟合..." : "生成爆款文案至画布"}</span>
                    </button>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-4"></div>

                  {/* Local image file uploader to generate cards */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-900 block flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      加载本地草图参考资产 (离线)
                    </span>
                    
                    <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition relative text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageUploadToCanvas}
                        className="absolute inset-0 opacity-0 cursor-pointer text-[0px]"
                      />
                      <FileUp className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <span className="block text-[10px] text-slate-500 font-bold">
                        选择本地参考原画图导入
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        无需上载服务器，完美保护商用隐私
                      </span>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[10px] text-slate-400 leading-relaxed mt-6">
                  💡 双击灵感卡片文本域，可开始撰写文言大义。本画布配置完全存储在您的本地浏览器 (localStorage) 里面，安心锁存不丢失。
                </div>
              </div>

              {/* Middle Frame: Real Infinite canvas space with visual radial grids patterns */}
              <div
                ref={canvasRef}
                className="flex-1 h-full relative overflow-hidden bg-slate-50 cursor-grab active:cursor-grabbing"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onDoubleClick={handleCanvasDoubleClick}
              >
                
                {/* Micro repeating grid indicator backing */}
                <div 
                  className="absolute inset-0 pointer-events-none select-none transition-all duration-75"
                  style={{
                    backgroundImage: `radial-gradient(#b0bccc 1.1px, transparent 1.1px)`,
                    backgroundSize: `${24 * canvasScale}px ${24 * canvasScale}px`,
                    backgroundPosition: `${canvasTranslate.x}px ${canvasTranslate.y}px`
                  }}
                />

                {/* Invisible Inputs for double-click local coordinate loading */}
                <input 
                  type="file" 
                  ref={canvasImageFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (doubleClickMenu) {
                      handleLocalImageCoordUpload(e, doubleClickMenu.canvasX, doubleClickMenu.canvasY);
                    }
                  }}
                />
                <input 
                  type="file" 
                  ref={canvasAttachmentFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (doubleClickMenu) {
                      handleLocalAttachmentCoordUpload(e, doubleClickMenu.canvasX, doubleClickMenu.canvasY);
                    }
                  }}
                />

                {/* Transform Scaler/Translator coordinate engine system */}
                <div 
                  className="absolute"
                  style={{
                    transform: `translate(${canvasTranslate.x}px, ${canvasTranslate.y}px) scale(${canvasScale})`,
                    transformOrigin: "0 0"
                  }}
                >
                  {/* Empty Whiteboard Canvas Cue */}
                  {canvasCards.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center p-8 bg-white/75 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl max-w-sm pointer-events-none select-none z-10 w-80">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 mb-3 animate-pulse">
                        <Layers className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight">空白无限画布</h4>
                      <div className="h-[1px] bg-slate-200/50 my-2 w-full"></div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        👉 <span className="font-bold text-slate-700">双击画布</span> 唤起操作菜单添加内容 <br />
                        ✋ <span className="font-bold text-slate-700">鼠标拖拽</span> 移动视野进行平移平布 <br />
                        ⚙️ <span className="font-bold text-slate-700">鼠标滚轮</span> 无极缩放 (支持右下角重置)
                      </p>
                    </div>
                  )}

                  {canvasCards.map((card) => {
                    const isSelected = selectedCanvasCard === card.id;
                    
                    // Style attributes according to generic types
                    let accentBorderColor = "border-slate-200 hover:border-slate-450";
                    let accentThemeBg = "bg-slate-50";
                    let accentTextRole = "text-slate-800";
                    let badgeLabel = "灵感底蕴";

                    if (card.type === "note") {
                      accentBorderColor = isSelected ? "border-amber-500 ring-2 ring-amber-100" : "border-amber-250 hover:border-amber-400";
                      accentThemeBg = "bg-amber-50/90";
                      accentTextRole = "text-amber-900";
                      badgeLabel = "灵感便签";
                    } else if (card.type === "prompt") {
                      accentBorderColor = isSelected ? "border-indigo-600 ring-2 ring-indigo-100" : "border-indigo-250 hover:border-indigo-400";
                      accentThemeBg = "bg-indigo-50/90";
                      accentTextRole = "text-indigo-900";
                      badgeLabel = "提示词卡";
                    } else if (card.type === "result") {
                      accentBorderColor = isSelected ? "border-violet-600 ring-2 ring-violet-100" : "border-violet-250 hover:border-violet-400";
                      accentThemeBg = "bg-violet-50/90";
                      accentTextRole = "text-violet-900";
                      badgeLabel = "AI结果";
                    } else if (card.type === "image") {
                      accentBorderColor = isSelected ? "border-emerald-600 ring-2 ring-emerald-100" : "border-slate-250 hover:border-emerald-400";
                      accentThemeBg = "bg-white";
                      accentTextRole = "text-slate-800";
                      badgeLabel = "创意原画";
                    }

                    return (
                      <div
                        key={card.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCanvasCard(card.id);
                          // Reorder cards array to naturally draw selected on top
                          setCanvasCards(prev => {
                            const filtered = prev.filter(c => c.id !== card.id);
                            return [...filtered, card];
                          });
                        }}
                        className={`absolute canvas-card bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.04)] border-2 flex flex-col justify-between transition-shadow group ${accentBorderColor}`}
                        style={{
                          left: card.x,
                          top: card.y,
                          width: card.width || 260,
                          minHeight: card.height || 140
                        }}
                      >

                        {/* Card Drag Handle Title Block */}
                        <div
                          onMouseDown={(e) => handleCardDragStart(e, card)}
                          className={`px-3 py-2 cursor-move rounded-t-2xl border-b flex items-center justify-between text-[10px] font-black tracking-wide uppercase ${accentThemeBg} ${accentTextRole}`}
                        >
                          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                            <Move className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="bg-white/80 px-1 py-0.5 rounded text-[8px] font-black shrink-0">{badgeLabel}</span>
                            <span className="truncate">{card.title}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCanvasCard(card.id);
                            }}
                            className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition shrink-0"
                            title="从画布剔除"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Card Content & Media Body */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                          
                          {/* Rich inline image rendering for picture nodes */}
                          {card.imageUrl && (
                            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-100 aspect-video group/img">
                              <img 
                                src={card.imageUrl} 
                                alt={card.title} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover/img:opacity-100 transition duration-250 flex items-center justify-center gap-2">
                                <a
                                  href={card.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-full bg-white text-slate-900 hover:scale-105 transition shadow-sm"
                                  title="在新标签页中看高清图"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={card.imageUrl}
                                  download={`ronin-card-render-${card.id}.png`}
                                  className="p-1.5 rounded-full bg-indigo-600 text-white hover:scale-105 transition shadow-sm"
                                  title="立刻下载到本地"
                                  onClick={(e) => {
                                    // if base64 direct click download
                                    if (card.imageUrl?.startsWith("data:")) {
                                      e.stopPropagation();
                                      const link = document.createElement("a");
                                      link.href = card.imageUrl;
                                      link.download = `ronin-card-${card.id}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }
                                  }}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Editable plain text area details */}
                          <textarea
                            value={card.content}
                            onChange={(e) => handleCardContentChange(card.id, e.target.value)}
                            rows={card.type === "image" ? 2 : 4}
                            className="w-full text-xs text-slate-650 bg-transparent border-none outline-none focus:ring-0 resize-none leading-relaxed text-slate-700"
                            placeholder="双击编辑文字资产..."
                          />

                          {/* Individual Card toolbar utilities */}
                          <div className="pt-2 border-t border-slate-100/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono text-[8px] opacity-60">ID: {card.id.slice(-5)}</span>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(card.content);
                                showToast("卡片文本内容已复制到剪切板！", "success");
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-50 rounded transition flex items-center gap-1 font-bold"
                              title="一键拷贝文字内容"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>复制</span>
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Floating bottom viewport configuration and scale info */}
                <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/50 flex items-center gap-3 text-xs font-black z-10">
                  <button 
                    type="button"
                    onClick={() => setCanvasScale(Math.max(0.4, parseFloat((canvasScale - 0.1).toFixed(2))))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600 font-extrabold w-6 h-6 flex items-center justify-center border border-slate-150"
                  >
                    －
                  </button>
                  <span className="text-[11px] tracking-tight text-slate-700 select-none min-w-[35px] text-center">{Math.round(canvasScale * 100)}%</span>
                  <button 
                    type="button"
                    onClick={() => setCanvasScale(Math.min(2, parseFloat((canvasScale + 0.1).toFixed(2))))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-600 font-extrabold w-6 h-6 flex items-center justify-center border border-slate-150"
                  >
                    ＋
                  </button>
                  <div className="h-4 w-[1px] bg-slate-200 mx-0.5"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setCanvasTranslate({ x: 0, y: 0 });
                      setCanvasScale(1);
                      showToast("画布缩放平移参数已归位", "info");
                    }}
                    className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] text-slate-600 transition"
                  >
                    视角重置
                  </button>
                </div>

                {doubleClickMenu && (
                  <div 
                    className="fixed z-50 bg-white shadow-2xl rounded-2xl border border-slate-200 p-1.5 w-52 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                    style={{ 
                      left: Math.min(window.innerWidth - 220, doubleClickMenu.x), 
                      top: Math.min(window.innerHeight - 380, doubleClickMenu.y) 
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 uppercase tracking-widest leading-none mb-1">
                      画布操作菜单
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const id = `card-${Date.now()}`;
                        const newCard: CanvasCard = {
                          id,
                          type: "note",
                          title: "💡 新建灵感便签",
                          content: "双击这里在此处撰写文字灵感内容...",
                          x: doubleClickMenu.canvasX,
                          y: doubleClickMenu.canvasY,
                          width: 260,
                          height: 140
                        };
                        setCanvasCards(prev => [...prev, newCard]);
                        setSelectedCanvasCard(id);
                        showToast("新建灵感便签成功！", "success");
                        setDoubleClickMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-750 hover:text-slate-900"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>添加灵感便签</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const id = `card-${Date.now()}`;
                        const newCard: CanvasCard = {
                          id,
                          type: "result",
                          title: "📝 新建文本内容",
                          content: "双击这里在此处输入富文本或提示词汇...",
                          x: doubleClickMenu.canvasX,
                          y: doubleClickMenu.canvasY,
                          width: 280,
                          height: 140
                        };
                        setCanvasCards(prev => [...prev, newCard]);
                        setSelectedCanvasCard(id);
                        showToast("新建文本卡片成功！", "success");
                        setDoubleClickMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-750 hover:text-slate-900"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>添加文本卡片</span>
                    </button>

                    <div className="h-[1px] bg-slate-150 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        canvasImageFileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-750 hover:text-slate-900"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>上传图片</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        canvasAttachmentFileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-750 hover:text-slate-900"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>上传附件</span>
                    </button>

                    <div className="h-[1px] bg-slate-150 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setCanvasPopupDraw({ canvasX: doubleClickMenu.canvasX, canvasY: doubleClickMenu.canvasY });
                        setDoubleClickMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-755 hover:text-slate-900"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span>AI 生成图片</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCanvasPopupChat({ canvasX: doubleClickMenu.canvasX, canvasY: doubleClickMenu.canvasY });
                        setDoubleClickMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-755 hover:text-slate-900"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>AI 生成文案</span>
                    </button>

                    <div className="h-[1px] bg-slate-150 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        showToast("高清增强功能即将开放。", "info");
                        setDoubleClickMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-xl transition font-medium text-slate-700 hover:text-slate-900"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>一键高清</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCanvasCard) {
                          deleteCanvasCard(selectedCanvasCard);
                          showToast("已删除选中的白板卡片", "success");
                        } else {
                          showToast("请先在画布中选择要删除的卡片", "info");
                        }
                        setDoubleClickMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-rose-50 text-rose-650 rounded-xl transition font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-550 shrink-0" />
                      <span>删除白板卡片</span>
                    </button>
                  </div>
                )}

                {/* AI Generate Image Inline Modal Overlay */}
                {canvasPopupDraw && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 animate-pulse">
                          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
                          <span>AI 生成图像并投放画布</span>
                        </h3>
                        <button 
                          onClick={() => setCanvasPopupDraw(null)}
                          className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">写下画面提示词 prompt:</label>
                          <textarea
                            rows={3}
                            value={popupDrawPrompt}
                            onChange={(e) => setPopupDrawPrompt(e.target.value)}
                            placeholder="写下灵感词：例如高级黑金质感包装的可乐罐处于反光的大理石太空基底..."
                            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold mb-1">选择意境模型</span>
                            <select
                              value={popupDrawModel}
                              onChange={(e) => setPopupDrawModel(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                            >
                              <option value="gpt-image-1">gpt-image-1 (默认排版)</option>
                              <option value="stable-diffusion-3">Stable Diffusion 3.5</option>
                            </select>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold mb-1">输出规格尺寸</span>
                            <select
                              value={popupDrawSize}
                              onChange={(e) => setPopupDrawSize(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                            >
                              <option value="1024x1024">1024x1024 (1:1)</option>
                              <option value="16:9">16:9 比例大屏</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setCanvasPopupDraw(null)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          disabled={isPopupDrawing}
                          onClick={() => handlePopupCanvasDraw(canvasPopupDraw.canvasX, canvasPopupDraw.canvasY)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-1.5 disabled:bg-slate-300"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isPopupDrawing ? 'animate-spin' : ''}`} />
                          <span>{isPopupDrawing ? "AI 渲染色彩中..." : "合成至双击位置"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generate Text Inline Modal Overlay */}
                {canvasPopupChat && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-indigo-550" />
                          <span>AI 撰写文案并投放画布</span>
                        </h3>
                        <button 
                          onClick={() => setCanvasPopupChat(null)}
                          className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">写下您的文案主题或撰写大纲:</label>
                          <textarea
                            rows={3}
                            value={popupChatPrompt}
                            onChange={(e) => setPopupChatPrompt(e.target.value)}
                            placeholder="写一句带有高级感氛围的奢华产品宣传口号..."
                            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold mb-1">选择对话大模型</span>
                          <select
                            value={popupChatModel}
                            onChange={(e) => setPopupChatModel(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="gpt-4o-mini">gpt-4o-mini (经济极速)</option>
                            <option value="deepseek-chat">deepseek-chat (满血推理)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setCanvasPopupChat(null)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          disabled={isPopupWriting}
                          onClick={() => handlePopupCanvasChat(canvasPopupChat.canvasX, canvasPopupChat.canvasY)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-indigo-600 transition flex items-center justify-center gap-1.5 disabled:bg-slate-300"
                        >
                          <FileText className={`w-3.5 h-3.5 text-indigo-305 ${isPopupWriting ? 'animate-bounce' : ''}`} />
                          <span>{isPopupWriting ? "文案引擎极速拟合..." : "合成至双击位置"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel: Figma-inspired responsive Card Attributes Inspector Sidebar */}
              <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 shrink-0 z-10 flex flex-col justify-between overflow-y-auto">
                {selectedCanvasCard ? (() => {
                  const activeCard = canvasCards.find(c => c.id === selectedCanvasCard);
                  if (!activeCard) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <Layers className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                        <h4 className="text-xs font-bold text-slate-550">卡片资产已失效</h4>
                        <p className="text-[10px] mt-1">请重选画布上的物品</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      
                      {/* Section Title Header */}
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold block">Property Inspector</span>
                        <h3 className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-indigo-600" />
                          <span>卡片属性编辑器</span>
                        </h3>
                        <div className="h-[1px] bg-slate-100 mt-3"></div>
                      </div>

                      {/* Card Type Tag */}
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500">实体类型:</span>
                        <span className="font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-black tracking-wide uppercase text-[9px]">
                          {activeCard.type}
                        </span>
                      </div>

                      {/* Edit Card Title input */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">卡目标题/标号 (Title):</label>
                        <input
                          type="text"
                          value={activeCard.title}
                          onChange={(e) => handleCardTitleChange(activeCard.id, e.target.value)}
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
                        />
                      </div>

                      {/* Edit Card Width custom Figma Slider controller! */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span className="font-bold">卡片宽度 (Width):</span>
                          <span className="font-mono text-xs font-semibold">{activeCard.width || 260} px</span>
                        </div>
                        <input
                          type="range"
                          min="180"
                          max="600"
                          step="10"
                          value={activeCard.width || 260}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value);
                            setCanvasCards(prev => prev.map(c => {
                              if (c.id === activeCard.id) {
                                return { ...c, width: newWidth };
                              }
                              return c;
                            }));
                          }}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                        />
                        <div className="flex justify-between text-[8px] text-slate-400">
                          <span>180px (紧凑)</span>
                          <span>600px (宽幅)</span>
                        </div>
                      </div>

                      {/* Edit Card Content Text Area */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">核心文本资产 (Content):</label>
                        <textarea
                          rows={6}
                          value={activeCard.content}
                          onChange={(e) => handleCardContentChange(activeCard.id, e.target.value)}
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed"
                          placeholder="修改详细文本..."
                        />
                      </div>

                      {/* Action buttons inside right properties panel side bar */}
                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeCard.content);
                            showToast("文本已顺利复制至剪切板！", "success");
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 transition flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制此卡文字</span>
                        </button>

                        {activeCard.imageUrl && (
                          <a
                            href={activeCard.imageUrl}
                            download={`ronin-card-${activeCard.id}.png`}
                            onClick={(e) => {
                              if (activeCard.imageUrl?.startsWith("data:")) {
                                e.preventDefault();
                                const link = document.createElement("a");
                                link.href = activeCard.imageUrl;
                                link.download = `ronin-art-${activeCard.id}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>下载此卡大图</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteCanvasCard(activeCard.id)}
                          className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>从当前画布下架</span>
                        </button>
                      </div>

                    </div>
                  );
                })() : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400/80 my-auto">
                    <div className="p-3 mb-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400">
                      <HelpCircle className="w-6 h-6 text-slate-300 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900">选中卡片启用高层编辑</h4>
                    <p className="text-[10px] mt-1.5 leading-relaxed text-slate-400 max-w-[180px] mx-auto">
                      在画布中央双击或选择任一灵感单元。即可在此调起 Figma 级别的宽度调整与文字快捷备份操作。
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 text-[9px] text-slate-400 flex items-center justify-between">
                  <span>画布卡片数量: {canvasCards.length} 个</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedCanvasCard(null)} 
                    className="hover:underline font-bold text-indigo-600 bg-transparent shrink-0"
                  >
                    清除选择
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}


        {/* ========================================================
            五、模型广场页面 ROUTE: MODELS
            ======================================================== */}
        {currentRoute === "models" && (
          <div className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full" id="models-route-container">
            
            {/* Minimal banner headers */}
            <div className="mb-10 text-center sm:text-left">
              <h2 className="text-2xl font-extrabold text-slate-950">智能大模型广场</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                RONIN AI LAB 的核心中转负载均衡，全面支持以下静态公开模型，API 全球通用，响应一致。
              </p>
            </div>

            {/* Sub Filter Category tab buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-8" id="models-tab-bar">
              {["全部", "GPT系列", "Claude系列", "DeepSeek系列", "Gemini系列", "AI 图像模型"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedModelCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                    selectedModelCategory === cat
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Model Card listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {APP_MODELS.filter(m => selectedModelCategory === "全部" || m.category === selectedModelCategory).map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition duration-200"
                >
                  <div>
                    {/* Header tags and provider name */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">
                        {m.provider}
                      </span>
                      <div className="flex items-center gap-1">
                        {m.tags.map((tg, idx) => (
                          <span 
                            key={idx}
                            className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="font-sans font-extrabold text-lg text-slate-950 mb-1.5 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      <span>{m.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal mb-4">
                      {m.description}
                    </p>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 space-y-2 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-widest text-[9px]">适合任务</span>
                        <span className="text-slate-700 font-semibold">{m.suitedFor}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-widest text-[9px]">上下文约束</span>
                        <span className="text-slate-600 max-w-fit font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">{m.contextLimit}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Pricing tag indicator */}
                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-200/20 mb-4 text-center">
                      {m.priceTag}
                    </div>

                    {/* Submit CTA */}
                    <button
                      onClick={() => {
                        if (m.category === "AI 图像模型") {
                          setRoute("image");
                          setDrawModel(m.id);
                        } else {
                          navigateToChat(`您好！让我们使用全新的 ${m.name} 探索智能工作边界。`, m.id);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>部署并即刻调用</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}


        {/* ========================================================
            六、API 购买页面 ROUTE: PRICING
            ======================================================== */}
        {currentRoute === "pricing" && (
          <div className="flex-1 py-12 px-4 max-w-7xl mx-auto w-full" id="pricing-route-container">
            
            {/* Header copy pricing plans */}
            <div className="text-center mb-12 max-w-xl mx-auto">
              <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 mb-3">
                商业化付费算力
              </span>
              <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-950">
                无任何隐藏订阅费的积分套餐
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                无需购买昂贵且充值复杂的外国代付信用卡。我们的算力积分终身不变，并享有 100% 同步原厂接口安全保证。
              </p>
            </div>

            {/* Plans List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-[26px] border p-6 flex flex-col justify-between hover:-translate-y-1 transform transition duration-300 ${
                    plan.isPopular 
                      ? "border-indigo-600 shadow-[0_12px_45px_rgba(79,70,229,0.06)]" 
                      : "border-slate-200 shadow-sm"
                  }`}
                >
                  
                  {/* Popular tag badge inside top margin */}
                  {plan.isPopular && (
                    <span className="absolute top-0 right-6 translate-y-[-50%] bg-indigo-600 text-[10px] font-extrabold tracking-widest uppercase text-white px-3.5 py-1 rounded-full shadow-md">
                      🔥🔥 爆款力荐款
                    </span>
                  )}

                  <div>
                    <h3 className="font-sans font-bold text-slate-950 text-base mb-1">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 block font-semibold mb-4">
                      {plan.billing}
                    </span>

                    {/* Price Tag styling */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-slate-950 text-2xl font-bold">¥</span>
                      <span className="text-slate-950 text-4xl font-sans font-black tracking-tight">{plan.price}</span>
                      <span className="text-slate-400 text-xs text-semibold">/ 元</span>
                    </div>

                    <div className="border-t border-slate-100 my-4 pt-3 space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          算力配额
                        </span>
                        <p className="text-slate-800 text-xs font-semibold mt-0.5 leading-relaxed">
                          {plan.quota}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          适用对象
                        </span>
                        <p className="text-slate-600 text-xs leading-normal mt-0.5">
                          {plan.suitedFor}
                        </p>
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-100 my-4"></div>

                    {/* Bullet list of advantages */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-[11px] text-slate-500 leading-normal">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    {/* CTA purchase link */}
                    <a
                      href="https://ai.ronin77.xyz/console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full block text-center py-3 rounded-xl text-xs font-bold transition shadow-sm ${
                        plan.isPopular 
                          ? "bg-indigo-600 hover:bg-slate-950 text-white" 
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      立即去控制台订购
                    </a>
                  </div>

                </div>
              ))}
            </div>

            {/* QA Section in support */}
            <div className="max-w-3xl mx-auto rounded-3xl bg-slate-50 p-8 border border-slate-200 text-xs">
              <h3 className="font-sans font-bold text-base text-slate-950 text-center mb-6">
                💡 充值计费常见问答 (F.A.Qs)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 leading-relaxed text-slate-600">
                <div>
                  <span className="font-extrabold text-slate-900 block mb-1">充值额度是否会过期？</span>
                  <span>答：绝对不会。购买的额度积分终身有效，不含任何月度最低消费扣减规定，用完为止。</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block mb-1">如何进行额度充值和查询？</span>
                  <span>答：在右上角直达「API 控制台」注册登录后，转至「充值」菜单。系统支持支付宝或微信免手续费实时发卡、自助核销。</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block mb-1">可以与别人共用一个 Key 么？</span>
                  <span>答：可以。您在后台生成的 sk-xxxxxx 令牌允许随时修改 QPS 限频并发数目，便于在独立团队开发中分配隔离。</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block mb-1">是否提供更高级的月结账单？</span>
                  <span>答：有的，针对大额企业与高校课题采购，我们提供企业专对公及 SLAs 定制并开具正规发票，详情可发工单随时取得联系。</span>
                </div>
              </div>
            </div>

          </div>
        )}


        {/* ========================================================
            七、文档页面 ROUTE: DOCS
            ======================================================== */}
        {currentRoute === "docs" && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4.25rem)] overflow-hidden" id="docs-route-container">
            
            {/* Catalog catalog Sidebar menu */}
            <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0 p-4">
              <div className="mb-4">
                <span className="p-1.5 rounded bg-indigo-50 text-indigo-700 inline-block mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </span>
                <h3 className="text-xs font-extrabold text-slate-900">RONIN 指导手册</h3>
                <span className="text-[10px] text-slate-400">持续更新系统参数与最佳实践</span>
              </div>

              {DOC_CATALOG.map((group) => (
                <div key={group.id} className="mt-4 first:mt-0">
                  <span className="px-2.5 py-1 block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-slate-500 transition">
                    {group.title}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveCatalogItem(item.contentCode)}
                        className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition font-medium ${
                          activeCatalogItem === item.contentCode
                            ? "bg-white border-2 border-slate-200 text-indigo-700 font-bold"
                            : "text-slate-600 hover:bg-slate-200/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </aside>

            {/* Document display board details */}
            <section className="flex-1 bg-white overflow-y-auto p-6 md:p-10">
              <div className="max-w-3xl mx-auto">
                
                {/* Visual custom simple Markdown rendering engine */}
                <div className="prose prose-indigo max-w-none text-xs leading-relaxed text-slate-700">
                  {DOC_CONTENTS[activeCatalogItem]?.split("\n").map((line, idx) => {
                    
                    if (line.startsWith("### ")) {
                      return <h2 key={idx} className="text-lg font-black text-slate-950 mt-6 mb-3 border-b-2 border-slate-100 pb-2 bg-gradient-to-r from-indigo-50/20 to-transparent p-1">{line.slice(4)}</h2>;
                    }
                    if (line.startsWith("#### ")) {
                      return <h3 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-2">{line.slice(5)}</h3>;
                    }
                    if (line.startsWith("> ")) {
                      return (
                        <blockquote key={idx} className="p-3 my-4 bg-indigo-50 text-indigo-700 rounded-xl border-l-[4px] border-indigo-500 font-medium">
                          ⚠️ {line.slice(2)}
                        </blockquote>
                      );
                    }
                    if (line.startsWith("* ")) {
                      return (
                        <li key={idx} className="list-disc ml-5 my-1.5 font-semibold text-slate-800">
                          {line.slice(2)}
                        </li>
                      );
                    }
                    if (line.startsWith("```")) {
                      if (line.trim() === "```" || line.trim() === "```bash" || line.trim() === "```javascript" || line.trim() === "```python" || line.trim() === "```http") {
                        return null; // Handle borders below
                      }
                    }

                    // Treat markdown code fences simply as nice code render segments
                    const isCodeSegment = line.trim().startsWith("https://") || line.trim().startsWith("API域名") || line.trim().startsWith("const ") || line.trim().startsWith("import ") || line.trim().startsWith("url =") || line.trim().startsWith("curl -X");
                    if (isCodeSegment) {
                      return (
                        <pre key={idx} className="bg-slate-900 text-indigo-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto my-3 leading-normal border border-slate-950 shadow-sm relative group">
                          <code>{line}</code>
                        </pre>
                      );
                    }

                    return <p key={idx} className={line.trim() === "" ? "h-2" : "my-1"}>{line}</p>;
                  })}
                </div>

                {/* Docs Footer */}
                <div className="border-t border-slate-100 mt-12 pt-6 flex items-center justify-between text-xs text-slate-400">
                  <span>最后更新：2026-05-28 14:37</span>
                  <a 
                    href="https://ai.ronin77.xyz/console" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>去控制台生成你的 Token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            </section>

          </div>
        )}


        {/* ========================================================
            八、关于页面 ROUTE: ABOUT
            ======================================================== */}
        {currentRoute === "about" && (
          <div className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full" id="about-route-container">
            
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10">
                <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-700 mb-4">
                  <Terminal className="w-8 h-8" />
                </div>
                <h1 className="font-sans font-extrabold text-2xl text-slate-950 tracking-tight">
                  关于 RONIN AI LAB 创新实验室
                </h1>
                <p className="mt-2 text-xs text-slate-500 leading-normal">
                  致力于打通 AI 应用极客的创意工作流，建立干净、尊贵的数字生产效率乐园。
                </p>
              </div>

              <div className="prose prose-slate leading-relaxed text-slate-600 text-xs space-y-6">
                <div>
                  <h3 className="font-sans font-extrabold text-sm text-slate-900 mb-2">
                    🎯 我们的初心与愿景
                  </h3>
                  <p>
                    随着各大 AI 模型竞争日益激烈，API 接入体系也愈加复杂。对于大多数中国独立开发者、跨境创作者和全栈工程“牛马”而言，原厂昂贵而又充值重重的 API Key 设立了不可忽视的门槛。
                  </p>
                  <p className="mt-2">
                    为此，**RONIN AI LAB** 团队正式成立，底层深度连接高效平价的 **New API** 服务。我们坚持提供不做多余修饰的原生接口代理，让算力能够以简单、透明、优雅的形式直达每一位追求速度的极客手边。
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-extrabold text-sm text-slate-900 mb-2">
                    🛠️ 精湛至臻的架构优势
                  </h3>
                  <p>
                    我们使用符合极致工程美学的淺灰蓝毛玻璃外观作为前端，采用现代 Node.js 服务端 API 代理机制，保证任何客户绝不会在浏览器端暴露出自己昂贵的 sk- 密钥，真正做到商用级别的安全。
                  </p>
                  <p className="mt-2">
                    不仅于此，我们创新的 **“无限创意画布” (Infinite Workspace)** 白板，首次允许创作者在非线性白板中随时拖拽或进行 AI 协同拼贴，极大丰富了素材和灵感重组的维度。
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xl font-bold text-slate-900 block font-sans">100% 精准响应</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">对齐原生接口协议标准</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xl font-bold text-indigo-600 block font-sans">只做清爽干净</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">杜绝牛皮癣弹窗、不实宣传</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-white text-center mt-8">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                    已准备好提升创意速率了吗？
                  </h4>
                  <p className="text-[11px] text-slate-300 max-w-sm mx-auto mb-4 leading-normal">
                    现在就去注册分配您的商业 API，或者在对话沙盒中发送您的第一个科研或海报构想。
                  </p>
                  <button
                    onClick={() => setRoute("home")}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition shadow-md"
                  >
                    返回实验室首页
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Access Token Input Security Modal Dialog */}
      <AccessCodeModal 
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        accessCode={accessCode}
        onSave={(code) => setAccessCode(code)}
      />

      {/* Global minimal clean footer block */}
      <footer className="border-t border-slate-200 bg-white/50 py-6 text-center text-[11px] text-slate-400 mt-16">
        <p>© 2026 RONIN AI LAB 研发创新团队. All rights reserved.</p>
        <p className="mt-1">
          本平台全面兼容 OpenAI API 调用规范 | 服务端代理：
          <span className="font-mono text-indigo-500 font-semibold bg-indigo-50/50 px-1 py-0.5 rounded">
            https://ai.ronin77.xyz/v1
          </span>
        </p>
      </footer>

    </div>
  );
}
