export type AnimationType = 'none' | 'wave' | 'breathe' | 'bounce' | 'slide';

export interface MemeConfig {
  // Avatar
  avatarImage: string | null; // Base64
  avatarShape: 'circle' | 'square';
  showAvatarBorder: boolean;

  // Bubble
  bubbleText: string;
  widgetText: string;
  showWidget: boolean;
  bubbleBgColor: string;
  textColor: string;
  
  // Animation
  animationType: AnimationType;
}

export const DEFAULT_CONFIG: MemeConfig = {
  avatarImage: null,
  avatarShape: 'circle',
  showAvatarBorder: true,
  bubbleText: 'Hello World',
  widgetText: 'Widget',
  showWidget: true,
  bubbleBgColor: '#ffffff',
  textColor: '#000000',
  animationType: 'breathe',
};

export interface MemeHistoryItem {
  id: string;
  created_at: string;
  config: MemeConfig;
  title: string;
}
