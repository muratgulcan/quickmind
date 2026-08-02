/** Mirrors GameItem.swift */
export function createEmojiItem(emoji, name) {
  return {
    type: 'emoji',
    emoji,
    name,
    get displayName() {
      return this.name;
    },
    get displayValue() {
      return this.emoji;
    },
  };
}
