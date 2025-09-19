export interface ExtractedContent {
  title: string;
  content: string;
  author: string;
  description: string;
  url: string;
  domain: string;
  timestamp: string;
  wordCount: number;
  excerpt: string;
}

export interface ContentExtractionResult {
  success: boolean;
  data?: ExtractedContent;
  error?: string;
}

export interface DownloadRequest {
  content: string;
  filename: string;
}

export interface Message {
  action: string;
  payload?: any;
}

export interface PopupState {
  isLoading: boolean;
  isProcessing: boolean;
  lastError?: string;
  status: 'idle' | 'extracting' | 'converting' | 'downloading' | 'complete' | 'error';
}