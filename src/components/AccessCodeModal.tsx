import React, { useState } from "react";
import { Shield, KeyRound, CheckCircle2, Lock, X, AlertTriangle } from "lucide-react";

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessCode: string;
  onSave: (code: string) => void;
}

export default function AccessCodeModal({ isOpen, onClose, accessCode, onSave }: AccessCodeModalProps) {
  const [inputCode, setInputCode] = useState(accessCode);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setStatusMessage({ type: "error", text: "请输入有效的访问验证码" });
      return;
    }

    // Pass up to parent
    onSave(inputCode.trim());
    setStatusMessage({
      type: "success",
      text: "首选项已保存！请求时将自动注入验证头 X-Access-Code"
    });
    
    setTimeout(() => {
      onClose();
      setStatusMessage(null);
    }, 1200);
  };

  const handleClear = () => {
    onSave("");
    setInputCode("");
    setStatusMessage({ type: "info", text: "已清除本地存储的访问验证码" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        id="access-code-modal-card"
        className="relative w-full max-w-md p-6 bg-white rounded-3xl shadow-xl border border-slate-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="p-3 mb-3 rounded-full bg-indigo-50 text-indigo-600">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-sans font-bold text-lg text-slate-900 tracking-tight">
            RONIN AI LAB 边缘网关安全验证
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs leading-relaxed">
            如您在部署时环境变量中指定了 <code className="px-1 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono font-semibold">APP_ACCESS_CODE</code>，需在此输入以成功调用代理，防止 API 被恶意盗盗空。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              访问授权验证码
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-centerPointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="password"
                placeholder="请填入验证密钥(APP_ACCESS_CODE)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100/50 bg-slate-50"
              />
            </div>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              statusMessage.type === "success" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                : statusMessage.type === "error"
                  ? "bg-rose-50 border-rose-100 text-rose-800"
                  : "bg-amber-50 border-amber-100 text-amber-800"
            }`}>
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            {accessCode && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent transition"
              >
                清除保存
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
            >
              应用我的设置
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            * 密钥保存在本地浏览器缓存 (localStorage) 中。未启用可留空。
          </p>
        </div>
      </div>
    </div>
  );
}
