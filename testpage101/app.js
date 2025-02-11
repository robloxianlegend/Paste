const room = new WebsimSocket();
const { useState, useEffect, useRef } = React;

function App() {
  const messages = React.useSyncExternalStore(
    room.collection('message').subscribe,
    () => room.collection('message').getList() || []
  );

  const reactions = React.useSyncExternalStore(
    room.collection('reaction').subscribe,
    () => room.collection('reaction').getList() || []
  );

  const [newMessage, setNewMessage] = useState('');
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(new Audio('./Elevator Music.mp3'));

  useEffect(() => {
    const handleClickOutside = (event) => {
      const emojiPickers = document.querySelectorAll('.emoji-picker');
      let clickedInside = false;
      emojiPickers.forEach(picker => {
        if (picker.contains(event.target)) clickedInside = true;
      });
      if (!clickedInside) setActiveEmojiPicker(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowJumpToLatest(scrolledUp);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowJumpToLatest(true);
    }
  }, [messages]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.src = './Elevator Music.mp3'; 
    audio.loop = true;

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play();
    };
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueUsers = new Set(
        messages.map(msg => ({
          username: msg.username,
          avatarUrl: `https://images.websim.ai/avatar/${msg.username}`
        }))
      );
      setAllUsers(Array.from(uniqueUsers));
    };

    fetchUsers();
  }, [messages]);

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    try {
      let imageUrl = null;
      if (selectedImage) {
        setUploadingImage(true);
        imageUrl = await websim.upload(selectedImage);
      }

      await room.collection('message').create({
        content: newMessage.trim(),
        imageUrl: imageUrl
      });

      setNewMessage('');
      setSelectedImage(null);
      setSelectedImagePreview(null);
      setUploadingImage(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddReaction = async (messageId, emoji, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const existingReaction = reactions.find(
        r => r.message_id === messageId && 
             r.emoji === emoji && 
             r.username === room.party.client.username
      );

      if (existingReaction) {
        await room.collection('reaction').delete(existingReaction.id);
      } else {
        await room.collection('reaction').create({
          message_id: messageId,
          emoji: emoji
        });
      }
    } catch (error) {
      console.error('Error managing reaction:', error);
    }
    setActiveEmojiPicker(null);
  };

  const getMessageReactions = (messageId) => {
    const messageReactions = reactions.filter(r => r.message_id === messageId);
    return messageReactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          count: 0,
          users: [],
          hasReacted: false
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.username);
      if (reaction.username === room.party.client.username) {
        acc[reaction.emoji].hasReacted = true;
      }
      return acc;
    }, {});
  };

  const handleJumpToLatest = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowJumpToLatest(false);
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Delete all reactions for this message
      const messageReactions = reactions.filter(r => r.message_id === messageId);
      for (const reaction of messageReactions) {
        await room.collection('reaction').delete(reaction.id);
      }
      
      // Delete the message
      await room.collection('message').delete(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await room.collection('message').update(messageId, {
        content: newContent,
        edited: true
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  return (
    <div className="app">
      <ChatHeader onToggleMusic={toggleMusic} isMusicPlaying={isMusicPlaying} />
      
      <div className="chat-messages" ref={messagesContainerRef}>
        {sortedMessages.map(message => (
          <Message
            key={message.id}
            message={message}
            reactions={getMessageReactions(message.id)}
            onReaction={handleAddReaction}
            activeEmojiPicker={activeEmojiPicker}
            onToggleEmojiPicker={(messageId, e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveEmojiPicker(activeEmojiPicker === messageId ? null : messageId);
            }}
            allUsers={allUsers}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            currentUser={room.party.client.username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <button 
        className={`jump-to-latest ${showJumpToLatest ? 'visible' : ''}`}
        onClick={handleJumpToLatest}
      >
        <i className="ri-arrow-down-s-line"></i>
      </button>
      
      <ChatInput
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSubmit={handleSendMessage}
        onFileSelect={handleFileSelect}
        uploadingImage={uploadingImage}
        selectedImagePreview={selectedImagePreview}
        onRemoveImage={() => {
          setSelectedImage(null);
          setSelectedImagePreview(null);
          fileInputRef.current.value = '';
        }}
        fileInputRef={fileInputRef}
        allUsers={allUsers}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);