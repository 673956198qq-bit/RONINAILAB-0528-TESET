import React, { useState } from "react";
import { Terminal, Shield, Cpu, ExternalLink, Menu, X, Coins, HelpCircle } from "lucide-react";

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  accessCode: string;
  onOpenAccessModal: () => void;
}

export default function Navbar({ currentRoute, setRoute, accessCode, onOpenAccessModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "首页" },
    { id: "chat", label: "AI 对话" },
    { id: "image", label: "AI 绘画" },
    { id: "canvas", label: "无限画布" },
    { id: "models", label: "模型广场" },
    { id: "pricing", label: "API 购买" },
    { id: "docs", label: "文档中心" },
    { id: "about", label: "关于" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-50/75 backdrop-blur-md border-b border-slate-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => { setRoute("home"); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 cursor-pointer group"
            id="nav-logo-btn"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-sm duration-300 group-hover:scale-105">
              <Terminal className="w-5 h-5 text-indigo-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-lg tracking-tight text-slate-950">
                RONIN <span className="text-indigo-600 font-extrabold text-sm align-super font-mono">AI LAB</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean, light gaps, elegant borders hover) */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setRoute(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-250 ${
                  currentRoute === item.id
                    ? "bg-indigo-600/10 text-indigo-700 shadow-[0_1px_2px_rgba(79,70,229,0.06)] font-semibold"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Widgets */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Access protection status widget */}
            <button
              onClick={onOpenAccessModal}
              id="verify-status-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                accessCode 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" 
                  : "bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border-slate-200"
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${accessCode ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
              {accessCode ? "已验证" : "输入验证码"}
            </button>

            {/* API Console External Links */}
            <a
              href="https://ai.ronin77.xyz/console"
              target="_blank"
              rel="noopener noreferrer"
              id="console-forward-btn"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs bg-slate-900 hover:bg-indigo-950 font-semibold text-white shadow-sm transition-all"
            >
              <span>API 控制台</span>
              <ExternalLink className="w-3 h-3 text-slate-300" />
            </a>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onOpenAccessModal}
              className={`p-1.5 rounded-full border text-xs font-semibold ${
                accessCode ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Clean, translucent slide overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-5 space-y-2 backdrop-blur-sm shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setRoute(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentRoute === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAccessModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>访问保护状态</span>
              </span>
              <span className="text-xs text-indigo-600 font-semibold">
                {accessCode ? "已激活" : "未验证"}
              </span>
            </button>
            <a
              href="https://ai.ronin77.xyz/console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm"
            >
              <span>访问正式控制台</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
