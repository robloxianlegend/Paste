const TOKEN = ''; // Add your Discord token here

class UserBotOS {
  constructor() {
    this.ws = null;
    this.heartbeatInterval = null;
    this.sequence = null;
    this.sessionId = null;
    this.token = null;
    this.userId = null;
    this.lastChannelId = null;
    this.startTime = Date.now();
    this.version = 5.0; // Version 5.0
    this.logo = 'https://api.websim.ai/blobs/0194e519-af74-7929-a2ec-6ab456a867dc.png';
    this.appName = 'Thermicord';
    
    this.setupLoginScreen();
    
    // Add command prefix
    this.prefix = '!';
    
    // Initialize Discord commands
    this.discordCommands = {
      'ping': this.handlePing.bind(this),
      'echo': this.handleEcho.bind(this),
      'status': this.handleStatus.bind(this),
      'help': this.handleHelp.bind(this)
    };

    // Initialize terminal commands
    this.commands = {
      'help': this.showHelp.bind(this),
      'restart': this.restart.bind(this),
      'status': this.status.bind(this),
      'clear': this.clear.bind(this),
      'echo': this.echo.bind(this)
    };

    // Initialize command flags/options
    this.commandFlags = {
      'restart': {
        'force_showing_boot_commands': {
          description: 'Shows detailed boot process',
          handler: this.handleForceShowingBootCommands.bind(this)
        },
        'time': {
          description: 'Shows restart timestamp',
          handler: this.handleTimeFlag.bind(this)
        }
      },
      'clear': {
        'time': {
          description: 'Shows clear operation timestamp',
          handler: this.handleTimeFlag.bind(this)
        },
        'keep_commands': {
          description: 'Keeps command messages while clearing',
          handler: this.handleKeepCommandsFlag.bind(this)
        },
        'fast': {
          description: 'Performs fast clear without delay',
          handler: () => true
        }
      },
      'status': {
        'detailed': {
          description: 'Shows detailed status information',
          handler: this.handleDetailedFlag.bind(this)
        },
        'time': {
          description: 'Shows status check timestamp',
          handler: this.handleTimeFlag.bind(this)
        }
      }
    };

    // Initialize file system
    this.fileSystem = {
      '/': {
        type: 'dir',
        content: {
          'home': {
            type: 'dir',
            content: {
              'documents': {
                type: 'dir',
                content: {}
              },
              'welcome.txt': {
                type: 'file',
                content: 'Welcome to UserBot OS!'
              }
            }
          },
          'system': {
            type: 'dir',
            content: {
              'about.txt': {
                type: 'file',
                content: 'owned by gatorkeys'
              }
            }
          }
        }
      }
    };

    this.currentPath = '/';

    // Add more commands
    Object.assign(this.commands, {
      'cd': this.cd.bind(this),
      'ls': this.ls.bind(this),
      'pwd': this.pwd.bind(this),
      'mkdir': this.mkdir.bind(this),
      'touch': this.touch.bind(this),
      'cat': this.cat.bind(this),
      'rm': this.rm.bind(this),
      'uptime': this.uptime.bind(this)
    });

    // Add new commands
    Object.assign(this.commands, {
      'pkg': this.pkg.bind(this),
      'link-image': this.linkImage.bind(this),
      'link-emoji': this.linkEmoji.bind(this),
      'link-url': this.linkUrl.bind(this),
    });

    // Add new command
    Object.assign(this.commands, {
      'project': this.project.bind(this)
    });

    // Add new command
    Object.assign(this.commands, {
      'thinking': this.thinking.bind(this)
    });

    // Add new command
    Object.assign(this.commands, {
      'reconnect': this.reconnect.bind(this)
    });

    // Add new commands
    Object.assign(this.commands, {
      'version': this.version_cmd.bind(this),
      'ver': this.version_cmd.bind(this),
      'about': this.about.bind(this)
    });

    // Add new commands
    Object.assign(this.commands, {
      'config': this.config.bind(this),
      'edit': this.edit.bind(this)
    });

    // Add sudo command
    Object.assign(this.commands, {
      'sudo': this.sudo.bind(this)
    });

    // Update command descriptions
    this.commandDescriptions = {
      'help': {
        desc: 'Show available commands and usage',
        usage: '$sh help [command]',
        example: '$sh help restart'
      },
      'restart': {
        desc: 'Restart the bot connection',
        usage: '$sh restart [-force_showing_boot_commands] [-time]',
        example: '$sh restart -force_showing_boot_commands -time'
      },
      'status': {
        desc: 'Show system status and information',
        usage: '$sh status [-detailed] [-time]',
        example: '$sh status -detailed -time'
      },
      'clear': {
        desc: 'Clear terminal and/or channel messages',
        usage: '$sh clear [-keep_commands] [-time] [-fast]',
        example: '$sh clear -keep_commands -fast'
      },
      'echo': {
        desc: 'Display a message in terminal/channel',
        usage: '$sh echo <message>',
        example: '$sh echo Hello World!'
      },
      'cd': {
        desc: 'Change current directory',
        usage: '$sh cd <path>',
        example: '$sh cd /home/documents'
      },
      'ls': {
        desc: 'List directory contents',
        usage: '$sh ls [path]',
        example: '$sh ls /home'
      },
      'pwd': {
        desc: 'Print working directory',
        usage: '$sh pwd',
        example: '$sh pwd'
      },
      'mkdir': {
        desc: 'Create a new directory',
        usage: '$sh mkdir <dirname>',
        example: '$sh mkdir newdir'
      },
      'touch': {
        desc: 'Create a new empty file',
        usage: '$sh touch <filename>',
        example: '$sh touch newfile.txt'
      },
      'cat': {
        desc: 'Display file contents',
        usage: '$sh cat <filename>',
        example: '$sh cat welcome.txt'
      },
      'rm': {
        desc: 'Remove file or directory',
        usage: '$sh rm <path>',
        example: '$sh rm oldfile.txt'
      },
      'uptime': {
        desc: 'Show system uptime',
        usage: '$sh uptime',
        example: '$sh uptime'
      },
      'pkg': {
        desc: 'Package management system',
        usage: '$sh pkg [install|upgrade|list] [package]',
        example: '$sh pkg install animation-utils'
      },
      'link-image': {
        desc: 'Create a linked image in markdown',
        usage: '$sh link-image <name> <url> [-autoanimate]',
        example: '$sh link-image cool-pic https://example.com/image.png'
      },
      'link-emoji': {
        desc: 'Create a custom emoji link',
        usage: '$sh link-emoji <name> <url> [-autoanimate]',
        example: '$sh link-emoji party https://example.com/party.png'
      },
      'link-url': {
        desc: 'Create a markdown URL link',
        usage: '$sh link-url <name> <url>',
        example: '$sh link-url github https://github.com'
      },
      'project': {
        desc: 'Show project URL and information',
        usage: '$sh project',
        example: '$sh project'
      },
      'thinking': {
        desc: 'Generate an AI response to your prompt',
        usage: '$sh thinking <prompt>',
        example: '$sh thinking what is the meaning of life?'
      },
      'reconnect': {
        desc: 'Reconnect with a new token',
        usage: '$sh reconnect <token>',
        example: '$sh reconnect YOUR_TOKEN_HERE'
      },
      'version': {
        desc: 'Display UserBot OS version',
        usage: '$sh version',
        example: '$sh version'
      },
      'ver': {
        desc: 'Alias for version command',
        usage: '$sh ver',
        example: '$sh ver'
      },
      'about': {
        desc: 'Show detailed system information',
        usage: '$sh about',
        example: '$sh about'
      },
      'config': {
        desc: 'Show or edit user configuration',
        usage: '$sh config [-self] [-edit] [-save]',
        example: '$sh config -edit'
      },
      'edit': {
        desc: 'Open message editor',
        usage: '$sh edit [-self]',
        example: '$sh edit -self'
      },
      'sudo': {
        desc: 'Execute commands with elevated privileges',
        usage: '$sh sudo <command>',
        example: '$sh sudo restart'
      }
    };

    // Initialize package system
    this.packages = {
      'animation-utils': { version: '1.0.0', installed: false },
      'markdown-extra': { version: '1.2.0', installed: false },
      'emoji-pack': { version: '0.8.0', installed: false },
      'terminal-themes': { version: '2.1.0', installed: false }
    };

    // Initialize user configuration
    this.userConfig = {
      theme: 'default',
      notifications: true,
      autoReconnect: true,
      language: 'en',
      timezone: 'UTC',
      customPrefix: '$sh'
    };

    this.selfMode = false;
    this.configEditing = false;
    this.tempConfig = null;
  }

  setupLoginScreen() {
    const loginBtn = document.getElementById('login-btn');
    const tokenInput = document.getElementById('token-input');

    loginBtn.addEventListener('click', () => {
      const token = tokenInput.value.trim();
      if (!token) {
        alert('Please enter your Discord token');
        return;
      }

      this.token = token;
      this.initializeTerminal();
    });

    tokenInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  }

  initializeTerminal() {
    // Hide login screen and show terminal
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('terminal').style.display = 'block';

    // Initialize terminal elements
    this.terminal = document.getElementById('terminal-output');
    this.input = document.getElementById('terminal-input');
    this.statusIndicator = document.getElementById('status-indicator');
    
    this.setupEventListeners();
    this.connect();
    this.input.focus();
  }

  log(message, type = '') {
    const div = document.createElement('div');
    div.className = `command-output ${type}`;
    div.textContent = message;
    this.terminal.appendChild(div);
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  setupEventListeners() {
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = this.input.value.trim();
        this.input.value = '';
        
        if (command) {
          this.log(`$ ${command}`);
          this.processCommand(command);
        }
      }
    });
  }

  async processCommand(commandStr) {
    const commands = commandStr.split(';').map(cmd => cmd.trim());
    
    for (const command of commands) {
      if (!command) continue;
      
      const parts = command.split(' ');
      if (parts[0] !== '$sh') {
        this.log('```diff\n- Commands must start with $sh\n```', 'error');
        continue;
      }
      
      const commandName = parts[1];
      const args = [];
      const options = {};
      
      // Improved flag parsing
      for (let i = 2; i < parts.length; i++) {
        if (parts[i].startsWith('-')) {
          const flag = parts[i].slice(1);
          options[flag] = true;
          
          // Handle flag-specific functionality
          if (this.commandFlags[commandName] && this.commandFlags[commandName][flag]) {
            const handler = this.commandFlags[commandName][flag].handler;
            if (handler) {
              options[flag] = await handler(args, options);
            }
          }
        } else {
          args.push(parts[i]);
        }
      }

      if (this.commands[commandName]) {
        try {
          // Pass both args and options to command
          const result = await this.commands[commandName](args, options);
          if (result) {
            const shouldSend = !options.self;
            if (this.lastChannelId && shouldSend) {
              await this.sendMessage(this.lastChannelId, result);
            } else if (options.self) {
              await this.sendMessage(this.lastChannelId, result, { self: true });
            }
          }
        } catch (error) {
          this.log(`Error executing command: ${error.message}`, 'error');
        }
      } else {
        this.log('```diff\n- Unknown command: ' + commandName + '\nUse "$sh help" to see available commands\n```', 'error');
      }
    }
  }

  async connect() {
    try {
      const response = await fetch('https://discord.com/api/v9/gateway');
      const { url } = await response.json();
      
      this.ws = new WebSocket(`${url}?v=9&encoding=json`);
      
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = async () => {
        this.statusIndicator.classList.remove('online');
        this.log('Disconnected from Discord', 'error');

        // Send automatic response in terminal
        this.log(`\`\`\`diff
- Connection Lost
+ Attempting automatic reconnection in 5 seconds...
\`\`\``, 'warning');

        // If we have a channel ID, send a message there too
        if (this.lastChannelId) {
          try {
            await this.sendMessage(this.lastChannelId, `**❌ Connection Lost**
> 🔄 Attempting automatic reconnection...
> ⏰ Disconnected at: \`${this.handleTimeFlag()}\``);
          } catch (error) {
            // If sending message fails, just log to terminal
            this.log('Could not send disconnect notification to Discord', 'error');
          }
        }

        // Cleanup current connection
        this.cleanup();

        // Wait 5 seconds before attempting reconnection
        setTimeout(async () => {
          this.log('Attempting to reconnect...', 'info');
          try {
            await this.connect();
            this.log('Successfully reconnected!', 'success');
            if (this.lastChannelId) {
              try {
                await this.sendMessage(this.lastChannelId, `**✅ Connection Restored**
> 🚀 Successfully reconnected
> ⏰ Reconnected at: \`${this.handleTimeFlag()}\``);
              } catch (error) {
                this.log('Could not send reconnection notification to Discord', 'error');
              }
            }
          } catch (error) {
            this.log('Reconnection failed, will retry in 5 seconds...', 'error');
            // Keep trying to reconnect
            setTimeout(() => this.ws.onclose(), 5000);
          }
        }, 5000);
      };
    } catch (err) {
      this.log('Failed to connect: ' + err.message, 'error');
    }
  }

  handleMessage(event) {
    const data = JSON.parse(event.data);
    this.sequence = data.s || this.sequence;

    switch (data.op) {
      case 10: // Hello
        this.heartbeat(data.d.heartbeat_interval);
        this.identify();
        break;
      
      case 0: // Dispatch
        if (data.t === 'READY') {
          this.sessionId = data.d.session_id;
          this.userId = data.d.user.id; 
          this.statusIndicator.classList.add('online');
          this.log('Connected to Discord', 'success');
          this.log(`Logged in as: ${data.d.user.username}#${data.d.user.discriminator}`, 'success');
        } else if (data.t === 'MESSAGE_CREATE') {
          this.handleDiscordMessage(data.d);
        }
        break;
    }
  }

  identify() {
    this.ws.send(JSON.stringify({
      op: 2,
      d: {
        token: this.token,
        intents: 513, 
        properties: {
          $os: 'linux',
          $browser: 'chrome',
          $device: 'chrome'
        },
        presence: {
          status: 'online',
          activities: [{
            name: 'owned by gatorkeys',
            type: 0
          }]
        }
      }
    }));
  }

  async handleDiscordMessage(message) {
    if (message.author.id !== this.userId) return;

    this.lastChannelId = message.channel_id;

    if (message.content.startsWith('$sh')) {
      this.log(`Command detected in channel ${message.channel_id}: ${message.content}`, 'success');
      
      const args = message.content.slice(3).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (this.commands[command]) {
        try {
          const result = await this.commands[command](args);
          
          if (result) {
            await this.sendMessage(message.channel_id, `Command output:\n${result}`, 
              { self: this.selfMode });
          }
        } catch (error) {
          this.log(`Error executing command ${command}: ${error.message}`, 'error');
          await this.sendMessage(message.channel_id, `\`\`\`diff\n- Error: ${error.message}\n\`\`\``,
            { self: this.selfMode });
        }
      } else {
        this.log(`\`\`\`diff\n- Unknown command: ${command}\nUse "$sh help" to see available commands\n\`\`\``, 'error');
        await this.sendMessage(message.channel_id, `\`\`\`diff\n- Unknown command: ${command}\nUse "$sh help" to see available commands\n\`\`\``,
          { self: this.selfMode });
      }
    }

    if (message.content.startsWith(this.prefix)) {
      const args = message.content.slice(this.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (this.discordCommands.hasOwnProperty(command)) {
        this.log(`Executing Discord command: ${command}`, 'success');
        try {
          await this.discordCommands[command](message, args);
        } catch (error) {
          this.log(`\`\`\`diff\n- Error executing command ${command}: ${error.message}\n\`\`\``, 'error');
        }
      }
    }
  }

  async handlePing(message) {
    await this.sendMessage(message.channel_id, '**Pong!** 🏓');
  }

  async handleEcho(message, args) {
    const content = args.join(' ');
    await this.sendMessage(message.channel_id, `*Echo:* ${content}`);
  }

  async handleStatus(message) {
    const uptime = process.uptime();
    const status = `**UserBot OS Status**
> 🟢 Connection: Online
> 🔧 Prefix: \`${this.prefix}\`
> 📦 Commands loaded: \`${Object.keys(this.discordCommands).length}\``;
    
    await this.sendMessage(message.channel_id, status);
  }

  async handleHelp(message) {
    const helpText = `**Available Discord Commands**
\`\`\`md
# Basic Commands
${this.prefix}ping  - Test bot responsiveness
${this.prefix}echo  - Repeat a message
${this.prefix}status - Show bot status
${this.prefix}help  - Show this help message
\`\`\``;
    
    await this.sendMessage(message.channel_id, helpText);
  }

  async sendMessage(channelId, content, options = {}) {
    try {
      // Add rate limit delay
      await this.rateLimitDelay();
      
      const messageData = {
        content,
        flags: options.self ? 64 : undefined
      };

      const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          const retryAfter = data.retry_after || 5;
          
          this.log(`Rate limited. Waiting ${retryAfter} seconds...`, 'error');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.sendMessage(channelId, content, options);
        }
        
        throw new Error(`Failed to send message: ${response.status}`);
      }

      this.log(`Message sent to channel ${channelId}${options.self ? ' (ephemeral)' : ''}`, 'success');
      this.lastMessageTime = Date.now();
      
    } catch (error) {
      this.log(`Failed to send message: ${error.message}`, 'error');
      
      if (error.message.includes('429')) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.sendMessage(channelId, content, options);
      }
      
      throw error;
    }
  }

  // Add rate limit delay method
  async rateLimitDelay() {
    if (this.lastMessageTime) {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      const minDelay = 1000; // Minimum 1 second between messages
      
      if (timeSinceLastMessage < minDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, minDelay - timeSinceLastMessage)
        );
      }
    }
  }

  async updateProgressMessage(channelId, messageId, progress, total) {
    try {
      const percentage = Math.round((progress / total) * 100);
      const barLength = 20;
      const filledLength = Math.round((percentage / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      const content = `**Progress Update**
\`\`\`
${percentage}% ${bar} (${progress}/${total})
\`\`\``;
      
      await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });
    } catch (error) {
      this.log(`Failed to update progress: ${error.message}`, 'error');
    }
  }

  async sendProgressMessage(channelId, initialMessage) {
    try {
      const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: initialMessage })
      });

      if (!response.ok) {
        throw new Error(`Failed to send progress message: ${response.status}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      this.log(`Failed to send progress message: ${error.message}`, 'error');
      throw error;
    }
  }

  async clear(args = [], options = {}) {
    this.terminal.innerHTML = '';
    
    const channelId = this.lastChannelId;
    let progressMsgId;
    const keepCommands = options.keep_commands;
    const showTime = options.time;
    const fastMode = options.fast;
    
    if (channelId) {
      let statusMessage = '**🧹 Starting Cleanup Operation**\n';
      if (showTime) {
        statusMessage += `> ⏰ Timestamp: \`${this.handleTimeFlag()}\`\n`;
      }
      if (fastMode) {
        statusMessage += '> ⚡ Fast mode enabled\n';
      }

      progressMsgId = await this.sendProgressMessage(channelId, statusMessage + '\nProgress: 0% ░░░░░░░░░░░░░░░░░░░░ (0/0)');
    }

    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages?limit=100`, {
      headers: {
        'Authorization': this.token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }
    
    const messages = await response.json();
    const userMessages = messages
      .filter(msg => {
        if (msg.id === progressMsgId) return false;
        if (msg.author.id !== this.userId) return false;
        if (keepCommands && msg.content.startsWith('$sh')) return false;
        return true;
      });

    const totalMessages = userMessages.length;
    
    for (let i = 0; i < userMessages.length; i++) {
      const message = userMessages[i];
      
      await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${message.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': this.token
        }
      });
      
      if (channelId) {
        await this.updateProgressMessage(channelId, progressMsgId, i + 1, totalMessages);
      }
      if (!fastMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (channelId) {
      await this.updateProgressMessage(channelId, progressMsgId, totalMessages, totalMessages);
      
      let completionMessage = '**✅ Cleanup Operation Complete**\n';
      completionMessage += `> 🗑️ Deleted \`${totalMessages}\` messages\n`;
      if (showTime) {
        completionMessage += `> ⏰ Completed at: \`${this.handleTimeFlag()}\`\n`;
      }
      if (keepCommands) {
        completionMessage += '> 📌 Command messages were preserved\n';
      }
      if (fastMode) {
        completionMessage += '> ⚡ Fast mode was used\n';
      }

      setTimeout(async () => {
        await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${progressMsgId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: completionMessage })
        });
      }, fastMode ? 500 : 2000);
    }
    
    this.log('Channel cleared of user messages', 'success');
    return `\`\`\`diff\n+ Terminal and channel cleared.\n\`\`\``;
  }

  async restart(args = [], options = {}) {
    const channelId = this.lastChannelId;
    let progressMsgId;
    const showBootCommands = options.force_showing_boot_commands;
    const showTime = options.time;

    let statusMessage = '**🔄 Initiating Restart Sequence**\n';
    if (showTime) {
      statusMessage += `> ⏰ Timestamp: \`${this.handleTimeFlag()}\`\n`;
    }

    try {
      if (channelId) {
        progressMsgId = await this.sendProgressMessage(channelId, statusMessage + '\nProgress: 0% ░░░░░░░░░░░░░░░░░░░░ (0/4)');
      }

      const bootSteps = [
        'Closing WebSocket connection...',
        'Cleaning up resources...',
        'Initializing new connection...',
        'Establishing connection...'
      ];

      // Step 1: Close WebSocket
      if (this.ws) {
        this.ws.close();
        if (showBootCommands) this.log(bootSteps[0], 'info');
        if (channelId) {
          await this.updateProgressMessage(channelId, progressMsgId, 1, 4);
        }
      }

      // Step 2: Cleanup
      this.cleanup();
      if (showBootCommands) this.log(bootSteps[1], 'info');
      if (channelId) {
        await this.updateProgressMessage(channelId, progressMsgId, 2, 4);
      }

      // Step 3: Wait and initialize
      if (showBootCommands) this.log(bootSteps[2], 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (channelId) {
        await this.updateProgressMessage(channelId, progressMsgId, 3, 4);
      }

      // Step 4: Reconnect
      if (showBootCommands) this.log(bootSteps[3], 'info');
      await this.connect();
      if (channelId) {
        await this.updateProgressMessage(channelId, progressMsgId, 4, 4);
        
        let completionMessage = '**✅ System Restart Complete**\n';
        completionMessage += '> 🚀 Bot is now operational\n';
        if (showTime) {
          completionMessage += `> ⏰ Completed at: \`${this.handleTimeFlag()}\`\n`;
        }

        setTimeout(async () => {
          await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${progressMsgId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': this.token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: completionMessage })
          });
        }, 2000);
      }

    } catch (error) {
      if (channelId && progressMsgId) {
        await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${progressMsgId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: `❌ Restart failed: ${error.message}` })
        });
      }
      throw error;
    }

    return `\`\`\`diff\n+ Bot connection restarted.\n\`\`\``;
  }

  async status(args = [], options = {}) {
    const status = this.ws && this.ws.readyState === WebSocket.OPEN ? '🟢 Connected' : '🔴 Disconnected';
    let statusMessage = `**System Status Report**\n> Status: ${status}`;

    if (options.detailed) {
      const details = this.handleDetailedFlag();
      statusMessage += `\n> ⏱️ Uptime: \`${details.uptime}\``;
      if (details.memory) {
        statusMessage += `\n> 💾 Memory: \`${Math.round(details.memory.used / 1024 / 1024)}MB\` / \`${Math.round(details.memory.total / 1024 / 1024)}MB\``;
      }
      statusMessage += `\n> 🔌 WebSocket: \`${details.wsState}\``;
    }

    if (options.time) {
      statusMessage += `\n> ⏰ Timestamp: \`${this.handleTimeFlag()}\``;
    }

    return statusMessage;
  }

  handleTimeFlag() {
    return new Date().toISOString();
  }

  handleDetailedFlag() {
    return {
      memory: {
        total: performance.memory?.totalJSHeapSize,
        used: performance.memory?.usedJSHeapSize
      },
      uptime: this.getUptime(),
      wsState: this.ws?.readyState
    };
  }

  handleForceShowingBootCommands() {
    return true;
  }

  handleKeepCommandsFlag() {
    return true;
  }

  getUptime() {
    const now = Date.now();
    const diff = now - this.startTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }

  showHelp(args = []) {
    if (args.length > 0) {
      const command = args[0];
      if (this.commandDescriptions[command]) {
        const cmd = this.commandDescriptions[command];
        return `**Command Help: ${command}**
\`\`\`md
# Description
${cmd.desc}

# Usage
${cmd.usage}

# Example
${cmd.example}

${this.commandFlags[command] ? '\n# Available Flags' : ''}
${this.commandFlags[command] ? Object.entries(this.commandFlags[command])
  .map(([flag, info]) => `- ${flag}: ${info.description}`).join('\n') : ''}
\`\`\``;
      } else {
        return '❌ Command not found. Use `$sh help` to see all available commands.';
      }
    }

    let helpText = `**🖥️ UserBot OS Help Guide**
\`\`\`md
# System Commands
${Object.entries(this.commandDescriptions)
  .map(([cmd, info]) => `${cmd.padEnd(10)} - ${info.desc}`)
  .join('\n')}

# General Usage
- All commands start with "$sh"
- Use "-flag" to add options to commands
- Use "help <command>" for detailed information

# Examples
$sh status -detailed
$sh clear -fast -keep_commands
$sh restart -force_showing_boot_commands

# File System Navigation
- Use "/" for root directory
- Use ".." to go up one directory
- Use absolute or relative paths
\`\`\`

For detailed help on any command, type:
\`$sh help <command>\``;

    return helpText;
  }

  echo(args) {
    return `\`\`\`diff\n+ ${args.join(' ')}\n\`\`\``;
  }

  status() {
    const status = this.ws && this.ws.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected';
    return `\`\`\`diff\n${this.ws && this.ws.readyState === WebSocket.OPEN ? '+' : '-'} Bot Status: ${status}\n\`\`\``;
  }

  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    }
    return this.currentPath === '/' ? 
      `/${path}` : 
      `${this.currentPath}/${path}`;
  }

  getNodeAtPath(path) {
    const parts = path.split('/').filter(p => p);
    let current = this.fileSystem['/'];
    
    for (const part of parts) {
      if (!current.content[part]) {
        return null;
      }
      current = current.content[part];
    }
    
    return current;
  }

  cd(args) {
    const newPath = args[0] || '/';
    const resolvedPath = this.resolvePath(newPath);
    
    if (newPath === '..') {
      const parts = this.currentPath.split('/').filter(p => p);
      parts.pop();
      this.currentPath = parts.length ? `/${parts.join('/')}` : '/';
      return `\`\`\`diff\n+ Changed directory to: ${this.currentPath}\n\`\`\``;
    }

    const node = this.getNodeAtPath(resolvedPath);
    if (!node || node.type !== 'dir') {
      throw new Error('Directory not found');
    }

    this.currentPath = resolvedPath;
    return `\`\`\`diff\n+ Changed directory to: ${this.currentPath}\n\`\`\``;
  }

  ls(args) {
    const path = args[0] || this.currentPath;
    const resolvedPath = this.resolvePath(path);
    const node = this.getNodeAtPath(resolvedPath);
    
    if (!node || node.type !== 'dir') {
      throw new Error('Directory not found');
    }

    const items = Object.entries(node.content).map(([name, item]) => {
      const type = item.type === 'dir' ? '📁' : '📄';
      return `${type} ${name}`;
    });

    return items.length ? items.join('\n') : '(empty directory)';
  }

  pwd() {
    return `\`\`\`diff\n+ Current path: ${this.currentPath}\n\`\`\``;
  }

  mkdir(args) {
    if (!args.length) {
      throw new Error('Directory name required');
    }

    const dirName = args[0];
    const resolvedPath = this.resolvePath(dirName);
    const parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '/';
    const parent = this.getNodeAtPath(parentPath);

    if (!parent || parent.type !== 'dir') {
      throw new Error('Parent directory not found');
    }

    const newDirName = resolvedPath.split('/').pop();
    parent.content[newDirName] = {
      type: 'dir',
      content: {}
    };

    return `\`\`\`diff\n+ Created directory: ${resolvedPath}\n\`\`\``;
  }

  touch(args) {
    if (!args.length) {
      throw new Error('File name required');
    }

    const fileName = args[0];
    const resolvedPath = this.resolvePath(fileName);
    const parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '/';
    const parent = this.getNodeAtPath(parentPath);

    if (!parent || parent.type !== 'dir') {
      throw new Error('Parent directory not found');
    }

    const newFileName = resolvedPath.split('/').pop();
    parent.content[newFileName] = {
      type: 'file',
      content: ''
    };

    return `\`\`\`diff\n+ Created file: ${resolvedPath}\n\`\`\``;
  }

  cat(args) {
    if (!args.length) {
      throw new Error('File name required');
    }

    const fileName = args[0];
    const resolvedPath = this.resolvePath(fileName);
    const node = this.getNodeAtPath(resolvedPath);

    if (!node || node.type !== 'file') {
      throw new Error('File not found');
    }

    return node.content || '(empty file)';
  }

  rm(args) {
    if (!args.length) {
      throw new Error('Path required');
    }

    const path = args[0];
    const resolvedPath = this.resolvePath(path);
    const parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '/';
    const parent = this.getNodeAtPath(parentPath);
    const nodeName = resolvedPath.split('/').pop();

    if (!parent || !parent.content[nodeName]) {
      throw new Error('Path not found');
    }

    delete parent.content[nodeName];
    return `\`\`\`diff\n- Removed: ${resolvedPath}\n\`\`\``;
  }

  uptime() {
    return `\`\`\`diff\n+ System uptime: ${this.getUptime()}\n\`\`\``;
  }

  async pkg(args = [], options = {}) {
    if (!args.length) {
      return `**📦 Package Management**
\`\`\`md
Usage: 
  $sh pkg <command> [package]

Commands:
  install  - Install a package
  upgrade  - Upgrade installed packages
  list     - List available packages
\`\`\``;
    }

    const [subcommand, packageName] = args;
    const channelId = this.lastChannelId;

    switch (subcommand) {
      case 'install':
        if (!packageName) {
          throw new Error('Package name required');
        }
        if (!this.packages[packageName]) {
          throw new Error('Package not found');
        }
        
        const progressMsgId = await this.sendProgressMessage(channelId, 
          '**📦 Installing Package**\n```\nProgress: 0% ░░░░░░░░░░░░░░░░░░░░ (0/3)\n```');
        
        // Simulate installation steps
        for (let i = 1; i <= 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.updateProgressMessage(channelId, progressMsgId, i, 3);
        }
        
        this.packages[packageName].installed = true;
        
        return `**✅ Package Installation Complete**
> 📦 Package: \`${packageName}\`
> 📌 Version: \`${this.packages[packageName].version}\``;

      case 'upgrade':
        const installed = Object.entries(this.packages).filter(([, pkg]) => pkg.installed);
        if (!installed.length) {
          return '❌ No packages installed';
        }
        
        const upgradeMsgId = await this.sendProgressMessage(channelId,
          '**🔄 Upgrading Packages**\n```\nProgress: 0% ░░░░░░░░░░░░░░░░░░░░ (0/${installed.length})\n```');
        
        for (let i = 1; i <= installed.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.updateProgressMessage(channelId, upgradeMsgId, i, installed.length);
        }
        
        return `**✅ Package Upgrade Complete**
> 📦 Upgraded \`${installed.length}\` packages`;

      case 'list':
        return `**📦 Available Packages**
\`\`\`md
${Object.entries(this.packages)
  .map(([name, pkg]) => `${pkg.installed ? '✓' : '•'} ${name.padEnd(20)} v${pkg.version}`)
  .join('\n')}
\`\`\``;

      default:
        throw new Error('Invalid package command');
    }
  }

  async linkImage(args = [], options = {}) {
    if (args.length < 2) {
      throw new Error('Name and URL required');
    }
    
    const [name, url] = args;
    const markdown = options.autoanimate ? 
      `![${name}](${url}?animate=true)` :
      `![${name}](${url})`;
    
    if (this.lastChannelId) {
      await this.sendMessage(this.lastChannelId, markdown);
    }
    return `\`\`\`diff\n+ Created image link: ${markdown}\n\`\`\``;
  }

  async linkEmoji(args = [], options = {}) {
    if (args.length < 2) {
      throw new Error('Name and URL required');
    }
    
    const [name, url] = args;
    const enhancedUrl = `${url}?size=48&name=${name.toLowerCase().replace(/\s+/g, '-')}`;
    const markdown = options.autoanimate ? 
      `[${name}](${enhancedUrl}&animate=true)` :
      `[${name}](${enhancedUrl})`;
    
    if (this.lastChannelId) {
      await this.sendMessage(this.lastChannelId, markdown);
    }
    return `\`\`\`diff\n+ Created emoji link: ${markdown}\n\`\`\``;
  }

  async linkUrl(args = []) {
    if (args.length < 2) {
      throw new Error('Name and URL required');
    }
    
    const [name, url] = args;
    const markdown = `[${name}](${url})`;
    
    if (this.lastChannelId) {
      await this.sendMessage(this.lastChannelId, markdown);
    }
    return `\`\`\`diff\n+ Created URL link: ${markdown}\n\`\`\``;
  }

  async project() {
    return `**🔗 Project Information**
> 📂 Project: \`${this.ap

pName} v${this.version} (latest)\`
> 🌐 URL: [WebSim.ai Project](https://websim.ai/@LeoplexGlow/discord-userbot-os/)
> 👨‍💻 Author: \`@LeoplexGlow\`

Visit the project page to learn more, collaborate, or contribute!`;
  }

  async thinking(args = []) {
    if (!args.length) {
      throw new Error('Prompt required');
    }

    const prompt = args.join(' ');
    const channelId = this.lastChannelId;

    try {
      // Send initial "thinking" message
      const thinkingMsgId = await this.sendProgressMessage(channelId,
        '**🤔 Thinking...**\n> Processing your prompt...');

      // Call the AI completion endpoint
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a thoughtful, engaging response to the following prompt. 
          Use markdown formatting to make the response more readable and interesting.
          Keep the response concise but informative.
          
          <typescript-interface>
          interface Response {
            response: string;
          }
          </typescript-interface>
          
          <example>
          {
            "response": "**The Nature of Time**\n> Time is like a river flowing in one direction, carrying us along its current.\n\nWe experience it linearly, but physicists tell us it's more complex than that. Time is relative and can:\n\n• Slow down at high speeds\n• Be affected by gravity\n• Possibly not even exist at quantum scales"
          }
          </example>

          Prompt: ${prompt}`,
          data: prompt
        })
      });

      const data = await response.json();

      // Update the message with the AI response
      await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${thinkingMsgId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `**🤖 AI Response**\n${data.response}`
        })
      });

      return `\`\`\`diff\n+ Generated AI response for prompt: "${prompt}"\n\`\`\``;
    } catch (error) {
      this.log(`Failed to generate AI response: ${error.message}`, 'error');
      throw new Error('Failed to generate AI response');
    }
  }

  async reconnect(args = []) {
    if (!args.length) {
      throw new Error('Token required');
    }

    const newToken = args[0];
    const channelId = this.lastChannelId;

    try {
      let statusMessage = '**🔄 Initiating Reconnection Sequence**\n';
      const progressMsgId = await this.sendProgressMessage(channelId, 
        statusMessage + '\n```\nProgress: 0% ░░░░░░░░░░░░░░░░░░░░ (0/4)\n```');

      // Step 1: Close existing connection
      if (this.ws) {
        this.ws.close();
        await this.updateProgressMessage(channelId, progressMsgId, 1, 4);
      }

      // Step 2: Cleanup
      this.cleanup();
      await this.updateProgressMessage(channelId, progressMsgId, 2, 4);

      // Step 3: Update token
      this.token = newToken;
      await this.updateProgressMessage(channelId, progressMsgId, 3, 4);

      // Step 4: Establish new connection
      await this.connect();
      await this.updateProgressMessage(channelId, progressMsgId, 4, 4);

      setTimeout(async () => {
        let completionMessage = '**✅ Reconnection Complete**\n';
        completionMessage += '> 🔐 New token configured\n';
        completionMessage += '> 🚀 Bot is now operational\n';
        completionMessage += `> ⏰ Completed at: \`${this.handleTimeFlag()}\`\n`;

        await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${progressMsgId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: completionMessage })
        });
      }, 2000);

      return `\`\`\`diff\n+ Reconnected with new token successfully.\n\`\`\``;
    } catch (error) {
      if (channelId) {
        await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${progressMsgId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: `❌ Reconnection failed: ${error.message}`
          })
        });
      }
      throw new Error(`Failed to reconnect: ${error.message}`);
    }
  }

  async version_cmd() {
    if (this.lastChannelId) {
      await this.sendMessage(this.lastChannelId, `[${this.appName}](${this.logo})`);
    }
    return `\`\`\`diff\n+ ${this.appName} v${this.version}\n\`\`\``;
  }

  async about() {
    if (this.lastChannelId) {
      await this.sendMessage(this.lastChannelId, `[${this.appName}](${this.logo})`);
    }

    const info = {
      version: this.version,
      buildDate: '2024',
      platform: 'WebSim',
      runtime: 'JavaScript',
      wsState: this.ws?.readyState || 'Not Connected',
      uptime: this.getUptime(),
      memory: performance.memory ? 
        `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB` : 
        'Not Available'
    };

    return `**📱 ${this.appName} Information**
\`\`\`md
# System Information
Version     : v${info.version}
Build Date  : ${info.buildDate}
Platform    : ${info.platform}
Runtime     : ${info.runtime}

# Performance
WebSocket   : ${info.wsState}
Uptime      : ${info.uptime}
Memory      : ${info.memory}

# Features
• Advanced Terminal Emulation
• Discord Integration
• File System Simulation
• Package Management
• AI Integration
• Custom Link Generation
\`\`\``;
  }

  async config(args = [], options = {}) {
    if (options.edit) {
      if (args.length >= 2) {
        // Handle direct editing
        const [key, ...valueArr] = args;
        const value = valueArr.join(' ');
        
        if (!this.userConfig.hasOwnProperty(key)) {
          throw new Error(`Invalid configuration key: ${key}`);
        }
        
        this.tempConfig = { ...this.userConfig };
        this.tempConfig[key] = value;
        this.configEditing = true;
        
        return `**⚙️ Configuration Update**\n\`\`\`diff\n+ Updated ${key} to: ${value}\nUse "$sh config -save" to save changes\n\`\`\``;
      } else {
        this.configEditing = true;
        this.tempConfig = { ...this.userConfig };
        return this.showConfigEditor(options);
      }
    }
    
    if (options.save) {
      if (!this.configEditing) {
        throw new Error('No configuration changes to save');
      }
      
      this.userConfig = { ...this.tempConfig };
      this.configEditing = false;
      this.tempConfig = null;
      
      return `**✅ Configuration Saved**\n\`\`\`diff\n+ Changes saved successfully\n\`\`\``;
    }
    
    return this.showConfigStatus(options);
  }

  showConfigEditor(options = {}) {
    const editorMessage = `**⚙️ Configuration Editor**
\`\`\`diff
+ Current Configuration
${Object.entries(this.tempConfig)
  .map(([key, value]) => `${key.padEnd(15)}: ${value}`)
  .join('\n')}

! Instructions
- Edit values using: $sh config -edit <key> <value>
- Save changes with: $sh config -save
- Cancel with: $sh config
\`\`\``;

    return editorMessage;
  }

  showConfigStatus(options = {}) {
    const statusMessage = `**⚙️ Configuration Status**
\`\`\`diff
+ Current Settings
${Object.entries(this.userConfig)
  .map(([key, value]) => `${key.padEnd(15)}: ${value}`)
  .join('\n')}

! System Info
Version        : v${this.version}
WebSocket      : ${this.ws?.readyState === 1 ? 'Connected' : 'Disconnected'}
Last Updated   : ${new Date().toLocaleString()}
\`\`\``;

    return statusMessage;
  }

  async sudo(args = [], options = {}) {
    if (!args.length) {
      throw new Error('Command required for sudo');
    }

    const commandName = args[0];
    const commandArgs = args.slice(1);

    if (!this.commands[commandName]) {
      throw new Error(`Command not found: ${commandName}`);
    }

    options.elevated = true;
    return await this.commands[commandName](commandArgs, options);
  }

  async edit(args = [], options = {}) {
    const editorMessage = `**📝 Message Editor**
\`\`\`md
# Controls
• Type your message below
• Use markdown for formatting
• Preview updates in real-time

[ Editor Ready ]
\`\`\`
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
Type your message here...
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁`;

    if (this.lastChannelId) {
      await this.sendMessage(this.lastChannelId, editorMessage, { self: options.self });
    }
    return `\`\`\`diff\n+ Editor opened\n\`\`\``;
  }

  heartbeat(interval) {
    this.heartbeatInterval = setInterval(() => {
      this.ws.send(JSON.stringify({
        op: 1,
        d: this.sequence
      }));
    }, interval);
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Start the bot
}

new UserBotOS();
