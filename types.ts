
export interface RollResult {
  dice1: number;
  dice2: number;
  timestamp: Date;
}

export interface GeminiCommentary {
  text: string;
  sentiment: 'lucky' | 'unlucky' | 'neutral' | 'amazing';
}
