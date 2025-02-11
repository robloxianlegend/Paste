function Message({ 
  message, 
  reactions, 
  onReaction, 
  activeEmojiPicker, 
  onToggleEmojiPicker, 
  allUsers,
  onDeleteMessage,
  onEditMessage,
  currentUser
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(message.content);

  // Function to render message content with tags
  const renderMessageContent = (content) => {
    // Regex to find @username mentions
    const tagRegex = /@(\w+)/g;
    const parts = content.split(tagRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {  // This is a username
        const matchedUser = allUsers.find(user => user.username === part);
        return matchedUser ? (
          <span 
            key={index} 
            className="user-mention" 
            title={`Mention of ${part}`}
          >
            @{part}
          </span>
        ) : (
          <span key={index}>@{part}</span>
        );
      }
      return part;
    });
  };

  const handleEditSubmit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    await onEditMessage(message.id, editContent.trim());
    setIsEditing(false);
  };

  const isOwner = message.username === currentUser;

  return (
    <div key={message.id} className={`message ${message.edited ? 'edited' : ''}`}>
      <img 
        className="message-avatar" 
        src={`https://images.websim.ai/avatar/${message.username}`}
        alt={message.username} 
      />
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{message.username}</span>
          <span className="message-time">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        {isEditing ? (
          <div>
            <input
              type="text"
              className="edit-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
            />
            <div className="edit-actions">
              <button className="edit-button save-edit" onClick={handleEditSubmit}>
                Save
              </button>
              <button className="edit-button cancel-edit" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.content && (
              <div className="message-text">
                {renderMessageContent(message.content)}
              </div>
            )}
            {message.imageUrl && (
              <img 
                className="message-image" 
                src={message.imageUrl} 
                alt="Uploaded content"
                onClick={() => window.open(message.imageUrl, '_blank')}
              />
            )}
          </>
        )}
        <MessageReactions 
          messageId={message.id}
          reactions={reactions}
          onReaction={onReaction}
          activeEmojiPicker={activeEmojiPicker}
          onToggleEmojiPicker={onToggleEmojiPicker}
        />
      </div>
      {isOwner && !isEditing && (
        <div className="message-actions">
          <button 
            className="message-action-btn"
            onClick={() => setIsEditing(true)}
            title="Edit message"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button 
            className="message-action-btn delete"
            onClick={() => onDeleteMessage(message.id)}
            title="Delete message"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}