import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Body parser
app.use(express.json({ limit: "50mb" }));

// Setup system capabilities variables based strictly on server-side environment
const NEWAPI_BASE_URL = process.env.NEWAPI_BASE_URL || "https://ai.ronin77.xyz/v1";
const NEWAPI_KEY = process.env.NEWAPI_KEY || "";
const APP_ACCESS_CODE = process.env.APP_ACCESS_CODE || "";

console.log("-----------------------------------------");
console.log("  RONIN AI LAB - Backend Server Booting  ");
console.log(`  PORT: ${PORT}`);
console.log(`  NEWAPI_BASE_URL: ${NEWAPI_BASE_URL}`);
console.log(`  NEWAPI_KEY configured: ${NEWAPI_KEY ? "YES (Commercial Native Mode)" : "NO (Warning: Chat/Draw won't work)"}`);
console.log(`  APP_ACCESS_CODE protection: ${APP_ACCESS_CODE ? "ENABLED" : "DISABLED_BY_DEFAULT"}`);
console.log("-----------------------------------------");

// Utility to verify Access Code
function verifyAccessCode(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!APP_ACCESS_CODE) {
    return next();
  }
  
  const clientCode = req.headers["x-access-code"] || req.body?.accessCode;
  if (!clientCode || clientCode !== APP_ACCESS_CODE) {
    return res.status(401).json({
      error: "ACCESS_CODE_REQUIRED",
      message: "此平台已启用访问保护，请输入有效的 APP_ACCESS_CODE 验证码以解锁服务。",
    });
  }
  next();
}

// 1. API Route: Chat completions proxy (commercial standard, no Gemini fallback or simulation)
app.post("/api/chat", verifyAccessCode, async (req, res) => {
  // Check if NEWAPI_KEY is configured
  if (!NEWAPI_KEY || NEWAPI_KEY.trim() === "") {
    return res.status(503).json({
      error: "MISSING_API_KEY",
      message: "服务器未配置 NEWAPI_KEY，请管理员检查环境变量。"
    });
  }

  const { messages, model } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "参数错误", message: "messages 必须是一个数组" });
  }

  const selectedModel = model || "gpt-4o-mini";

  try {
    const targetUrl = `${NEWAPI_BASE_URL}/chat/completions`;
    console.log(`[Proxy] Forwarding chat query to ${targetUrl} [Model: ${selectedModel}]`);

    const payload = {
      model: selectedModel,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
    };

    // Timeout abort controller after 120 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NEWAPI_KEY.trim()}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy Chat Error] Status: ${response.status} - ${errorText}`);
      
      let errorMsg = "后端模型服务接口调用失败，请稍后重试。";
      let errorType = "NEWAPI_ERROR";

      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error && parsed.error.message) {
          errorMsg = parsed.error.message;
        }
      } catch (parseErr) {
        if (errorText.includes("insufficient_balance") || errorText.includes("余额不足")) {
          errorMsg = "您的 API 账户余额不足，请前往控制台充值。";
        } else if (errorText.includes("exceeded_quota")) {
          errorMsg = "API 额度已超限，请检查配额配置。";
        } else {
          errorMsg = `错误信息: ${errorText.substring(0, 200)}`;
        }
      }

      return res.status(response.status).json({
        error: errorType,
        message: errorMsg
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("[Proxy Chat Fatal Error]", err);
    const isTimeout = err.name === "AbortError";
    return res.status(500).json({
      error: isTimeout ? "REQUEST_TIMEOUT" : "PROXY_EXCEPTION",
      message: isTimeout 
        ? "请求超时，大模型生成响应时间较长，请稍后再试或切换轻量模型。"
        : "发送请求至 New API 时发生异常，请检查服务器网络或配置。",
      details: err.message,
    });
  }
});

// 2. API Route: Images generations proxy (commercial standard, no fallback mock illustrations)
app.post("/api/image", verifyAccessCode, async (req, res) => {
  // Check if NEWAPI_KEY is configured
  if (!NEWAPI_KEY || NEWAPI_KEY.trim() === "") {
    return res.status(503).json({
      error: "MISSING_API_KEY",
      message: "服务器未配置 NEWAPI_KEY，请管理员检查环境变量。"
    });
  }

  const { prompt, model, size } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "参数错误", message: "提示词 prompt 不能为空" });
  }

  const selectedModel = model || "gpt-image-1";
  const selectedSize = size || "1024x1024";

  try {
    const targetUrl = `${NEWAPI_BASE_URL}/images/generations`;
    console.log(`[Proxy] Requesting image from ${targetUrl} [Model: ${selectedModel}, Size: ${selectedSize}]`);

    const payload = {
      prompt: prompt,
      model: selectedModel,
      size: selectedSize,
      response_format: "b64_json",
    };

    // Timeout abort controller after 120 seconds (painting models can take longer)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NEWAPI_KEY.trim()}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy Image Error] Status: ${response.status} - ${errorText}`);
      
      let errorMsg = "后端画图接口调用错误";
      
      // Parse error codes to deliver high-quality business compliance notifications
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error && parsed.error.message) {
          errorMsg = parsed.error.message;
        }
      } catch (e) {
        if (errorText.includes("insufficient_balance") || errorText.includes("余额不足")) {
          errorMsg = "API 余额不足，请前往控制台充值。";
        } else if (errorText.includes("not_found") || errorText.includes("model_not_found")) {
          errorMsg = `生图模型 [${selectedModel}] 未在此渠道配置或价格未定，请前往控制台查看。`;
        } else if (errorText.includes("invalid") || errorText.includes("unauthorized")) {
          errorMsg = "New API 密钥过期、无效，或访问码错误。";
        } else {
          errorMsg = `服务异常 (${response.status}): ${errorText.substring(0, 150)}`;
        }
      }

      return res.status(response.status).json({
        error: "NEWAPI_IMAGE_ERROR",
        message: errorMsg
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("[Proxy Image Fatal Error]", err);
    const isTimeout = err.name === "AbortError";
    return res.status(500).json({
      error: isTimeout ? "REQUEST_TIMEOUT" : "PROXY_EXCEPTION",
      message: isTimeout 
        ? "生图请求响应超时，请尝试稍后重试或使用标准模型。"
        : "生图网络请求异常，请确认服务器网络畅通与接口状态。",
      details: err.message,
    });
  }
});

// Serve frontend assets & initialize Express boot
async function startServer() {
  // Vite integration in non-production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`  RONIN AI LAB server successfully bound`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Target production build outputs from /dist`);
    console.log(`=========================================`);
  });
}

startServer();
