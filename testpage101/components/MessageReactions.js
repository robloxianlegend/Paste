function MessageReactions({ messageId, reactions, onReaction, activeEmojiPicker, onToggleEmojiPicker }) {
  const emojiPickerRef = React.useRef(null);

  return (
    <div className="message-reactions">
      {Object.entries(reactions).map(([emoji, data]) => (
        <div 
          key={emoji}
          className={`reaction ${data.hasReacted ? 'active' : ''}`}
          onClick={(e) => onReaction(messageId, emoji, e)}
          title={data.users.join(', ')}
        >
          {emoji} {data.count}
        </div>
      ))}
      <span 
        className="add-reaction"
        onClick={(e) => onToggleEmojiPicker(messageId, e)}
      >
        <i className="ri-add-line"></i>
      </span>
      {activeEmojiPicker === messageId && (
        <EmojiPicker 
          ref={emojiPickerRef}
          onSelect={(emoji, e) => onReaction(messageId, emoji, e)}
        />
      )}
    </div>
  );
}