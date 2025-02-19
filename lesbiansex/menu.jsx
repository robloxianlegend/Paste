function Menu() {
  const room = new WebsimSocket();

  const startGame = (difficulty) => {
    if (!localStorage.getItem('aimlabs_username')) {
      alert('Please enter a username first!');
      return;
    }
    window.game.startGame(difficulty);
    document.getElementById('menu').style.display = 'none';
    document.getElementById('username-display').style.display = 'block';
  };

  return (
    <div id="menu">
      <h1 style={{
        fontSize: '36px',
        marginBottom: '30px',
        letterSpacing: '3px',
        fontWeight: '300'
      }}>AIMLABS PRACTICE</h1>
      <div className="button-container">
        <button className="menu-button" onClick={() => startGame('super_easy')}>
          Static Target (30s)
        </button>
        <button className="menu-button" onClick={() => startGame('easy')}>
          Precision (60s)
        </button>
        <button className="menu-button" onClick={() => startGame('medium')}>
          Speed Training (30s)
        </button>
        <button className="menu-button" onClick={() => startGame('hard')}>
          Expert (15s)
        </button>
      </div>
    </div>
  );
}

ReactDOM.render(<Menu />, document.getElementById('root'));