class NotificationManager {
  constructor() {
    this.container = document.getElementById('notification-container');
  }

  show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    
    this.container.appendChild(notification);
    
    notification.offsetHeight;
    
    notification.classList.add('show');

    setTimeout(() => {
      this.remove(notification);
    }, 3000);
  }

  remove(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      this.container.removeChild(notification);
    }, 300);
  }
}

class NGLApp {
    constructor() {
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.diceBtn = document.getElementById('dice-btn');
        this.WEBHOOK_URL = 'https://discord.com/api/webhooks/1337698510551777301/GehYsmg-JtIVgKZXl-4Z-hIEYd6ce0_uzzYK7-vfpGShZ1Egr6TUcL3tPHOAXHSqJB8W';
        
        this.notificationManager = new NotificationManager();
        this.usedSuggestions = new Set();
        this.suggestions = [
            "what's the biggest lie you've ever told and got away with?",
            "have you ever been in love, or do you just like the idea of it?",
            "what's something you've done drunk (or super tired) that still haunts you?",
            "have you ever caught feelings for someone you *definitely* shouldn't have?",
            "who was your worst kiss, and why?",
            "what's the pettiest thing you've ever done out of spite?",
            "have you ever stalked someone's social media so hard you accidentally liked an old post?",
            "if your ex (or crush) texted you right now, would you answer?",
            "have you ever sent a risky text and prayed they didn't screenshot it?",
            "what's your most recent intrusive thought you almost acted on?",
            "if you had to expose one secret from your group chat, what would it be?",
            "what's something you pretend to like because everyone else does?",
            "have you ever flirted with someone just to get something out of it?",
            "what's a weird turn-on you have but never admit?",
            "what's the most jealous you've ever been over someone?",
            "would you rather accidentally send a screenshot *to* the person you screenshotted or post a cringy thirst trap publicly?",
            "have you ever been the 'side piece' in a relationship (knowingly or not)?",
            "what's the wildest excuse you've ever used to cancel plans?",
            "if you had to describe your type in three toxic traits, what would they be?",
            "have you ever used someone for attention?",
            "do you have a 'revenge fantasy' about someone? spill.",
            "have you ever caught someone talking sh*t about you? what did you do?",
            "what's the most chaotic thing you've ever done in a relationship or situationship?",
            "if someone offered you $10k to expose *all* your texts and dms, would you do it?",
            "have you ever faked feelings for someone?",
            "what's the worst thing you've ever said about someone behind their back?",
            "if you had to ruin one person's life with a single sentence, what would you say?",
            "have you ever hooked up with someone you *knew* was bad for you but did it anyway?",
            "if you could swap bodies with your enemy for a day, what's the first thing you'd do?",
            "would you rather get caught cheating or catch someone cheating on you?",
            "have you ever had a friend you secretly couldn't stand?",
            "if someone went through your camera roll right now, would you be embarrassed?",
            "what's a text you've left on read that you *absolutely* should've replied to?",
            "if you had to delete one person from your life forever, who would it be?",
            "have you ever made someone cry and *not* felt bad about it?",
            "would you rather be famous but hated, or irrelevant and loved?",
            "what's the worst thing you've done out of pure boredom?"
        ];
        this.initEventListeners();
        this.initDiceButton();
    }

    initEventListeners() {
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
    }

    initDiceButton() {
        this.diceBtn.addEventListener('click', () => this.generateRandomSuggestion());
    }

    generateRandomSuggestion() {
        // If all suggestions have been used, reset the set
        if (this.usedSuggestions.size === this.suggestions.length) {
            this.usedSuggestions.clear();
        }

        // Find a suggestion that hasn't been used before
        const availableSuggestions = this.suggestions.filter(
            suggestion => !this.usedSuggestions.has(suggestion)
        );

        const randomSuggestion = availableSuggestions[
            Math.floor(Math.random() * availableSuggestions.length)
        ];

        // Mark the suggestion as used
        this.usedSuggestions.add(randomSuggestion);
        this.messageInput.value = randomSuggestion;
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            try {
                const response = await fetch(this.WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        embeds: [{
                            title: "New Question Alert!",
                            description: `\`\`\`${message}\`\`\``,
                            color: 0x2b2d31 // Discord color int for #2b2d31
                        }]
                    })
                });

                if (response.ok) {
                    this.notificationManager.show('Message Sent!', 'success');
                    this.messageInput.value = '';
                } else {
                    this.notificationManager.show('Failed to Send', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                this.notificationManager.show('Network Error', 'error');
            }
        } else {
            this.notificationManager.show('Message is Empty', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NGLApp();
});