function ChatInput({ 
  newMessage, 
  onMessageChange, 
  onSubmit,
  onFileSelect,
  uploadingImage,
  selectedImagePreview,
  onRemoveImage,
  fileInputRef,
  allUsers
}) {
  const [showUserSuggestions, setShowUserSuggestions] = React.useState(false);
  const [filteredUsers, setFilteredUsers] = React.useState([]);

  const handleMessageChange = (value) => {
    onMessageChange(value);

    // Check for @ symbol and filter users
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const prefix = value.slice(atIndex + 1).toLowerCase();
      
      // Use a Map to get unique users based on username
      const uniqueUsers = new Map();
      allUsers.forEach(user => {
        if (user.username.toLowerCase().startsWith(prefix)) {
          // Only add if the username isn't already in the map
          if (!uniqueUsers.has(user.username)) {
            uniqueUsers.set(user.username, user);
          }
        }
      });
      
      // Convert back to an array
      const suggestions = Array.from(uniqueUsers.values());
      
      setFilteredUsers(suggestions);
      setShowUserSuggestions(suggestions.length > 0);
    } else {
      setShowUserSuggestions(false);
    }
  };

  const handleUserSelect = (username) => {
    const atIndex = newMessage.lastIndexOf('@');
    const newMessageValue = newMessage.slice(0, atIndex) + `@${username} `;
    onMessageChange(newMessageValue);
    setShowUserSuggestions(false);
  };

  return (
    <>
      <form className="chat-input" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Send a message"
          value={newMessage}
          onChange={(e) => handleMessageChange(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <button 
          type="button" 
          className="upload-button"
          onClick={() => fileInputRef.current.click()}
        >
          <i className="ri-image-line"></i>
        </button>
        <button type="submit" className="upload-button">
          {uploadingImage ? (
            <div className="loading-indicator"></div>
          ) : (
            <i className="ri-send-plane-fill"></i>
          )}
        </button>
      </form>
      {showUserSuggestions && (
        <div className="user-suggestions">
          {filteredUsers.map(user => (
            <div 
              key={user.username} 
              className="user-suggestion"
              onClick={() => handleUserSelect(user.username)}
            >
              <img 
                src={`https://images.websim.ai/avatar/${user.username}`} 
                alt={user.username} 
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      )}
      {selectedImagePreview && (
        <div className="image-upload-preview">
          <img src={selectedImagePreview} alt="Upload preview" />
          <span className="remove-image" onClick={onRemoveImage}>
            <i className="ri-close-line"></i>
          </span>
        </div>
      )}
    </>
  );
}