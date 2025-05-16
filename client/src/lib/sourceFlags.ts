// A utility function for getting country flag emojis for news source names
export const sourceFlags: Record<string, string> = {
  "Al Jazeera": "🇶🇦🇬🇧",
  "AP News": "🇺🇸",
  "BBC News": "🇬🇧",
  "Bloomberg": "🇺🇸🇬🇧",
  "Deutsche Welle": "🇩🇪",
  "Financial Times": "🇬🇧🇯🇵",
  "Fox News": "🇺🇸",
  "France 24": "🇫🇷",
  "Haaretz": "🇮🇱",
  "NPR": "🇺🇸",
  "Reuters": "🇨🇦🇬🇧",
  "RT": "🇷🇺",
  "South China Post": "🇨🇳",
  "Tehran Times": "🇮🇷",
  "The Epoch Times": "🇺🇸",
  "The Hill": "🇺🇸",
  "The Japan Times": "🇯🇵",
  "The Jerusalem Post": "🇮🇱",
  "Times of India": "🇮🇳",
  "UN News": "🌐",
  "SCOTUSblog": "🇺🇸",
  "The Intercept": "🇺🇸",
  "ZeroHedge": "🇺🇸"
};

export function getSourceFlag(sourceName: string): string {
  return sourceFlags[sourceName] || "";
}