
export interface DorkPart {
  id: string;
  operator: string;
  value: string;
  enabled: boolean;
}

export interface SavedDork {
  id: string;
  name: string;
  query: string;
  description: string;
  createdAt: number;
}

export interface ResourceItem {
  name: string;
  url: string;
  category: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  groundingLinks?: Array<{ title: string; uri: string }>;
}
