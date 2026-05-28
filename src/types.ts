export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  updatedAt: string;
}

export interface ModelDetail {
  id: string;
  name: string;
  category: "GPT系列" | "Claude系列" | "Gemini系列" | "DeepSeek系列" | "AI 图像模型" | "API 聚合模型";
  provider: string;
  tags: string[];
  suitedFor: string;
  priceTag: string;
  contextLimit: string;
  description: string;
  recommendPriority: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing: string;
  quota: string;
  isPopular: boolean;
  suitedFor: string;
  modelsSupported: string[];
  features: string[];
}

export type CanvasItemType = "sticky" | "text" | "prompt" | "image" | "attachment" | "result";

export interface CanvasCard {
  id: string;
  type: CanvasItemType;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  isEditing?: boolean;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  zIndex?: number;
}

export interface DocCatalog {
  id: string;
  title: string;
  items: {
    id: string;
    label: string;
    contentCode: string;
  }[];
}
