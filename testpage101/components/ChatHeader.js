function ChatHeader({ onToggleMusic, isMusicPlaying }) {
  return (
    <div className="chat-header">
      <div className="header-left">
        <i className="ri-chat-3-line"></i> Globalize
      </div>
      <div className="header-right">
        <button className="music-toggle" onClick={onToggleMusic}>
          <i className={`ri-${isMusicPlaying ? 'volume-up' : 'volume-mute'}-fill`}></i>
        </button>
      </div>
    </div>
  );
}