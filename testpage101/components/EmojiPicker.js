const EMOJI_LIST = ['👍', '❤️', '😄', '😮', '😢', '😡', '🎉', '🙏', '👀', '💯'];

function EmojiPicker({ onSelect, ref }) {
  return (
    <div className="emoji-picker" ref={ref}>
      {EMOJI_LIST.map(emoji => (
        <button 
          key={emoji}
          onClick={(e) => onSelect(emoji, e)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}