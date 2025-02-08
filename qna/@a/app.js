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

class AnsweredQuestionsManager {
    constructor() {
        this.modal = document.getElementById('answered-questions-modal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.questionsList = document.getElementById('answered-questions-list');
        this.seeQuestionsLink = document.getElementById('see-answered-questions');
        
        this.questions = [];
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.seeQuestionsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });
        
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }
    
    addQuestion(question) {
        this.questions.push(question);
        this.updateQuestionsList();
    }
    
    updateQuestionsList() {
        this.questionsList.innerHTML = this.questions
            .map(q => `<div class="question">${q}</div>`)
            .join('');
    }
    
    showModal() {
        this.modal.style.display = 'block';
    }
    
    hideModal() {
        this.modal.style.display = 'none';
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
        this.answeredQuestionsManager = new AnsweredQuestionsManager();
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
        const suggestions = [
            "what's the worst date you've ever been on?",
            "do you even like school?",
            "have you ever watched harry potter?",
            "are you straight?",
            "what was your worst day ever?",
            "where are your parents from?",
            "u busy this weekend?",
            "how many hours of sleep did you get last night?",
            "have any netflix recommendations?",
            "spill some tea",
            "what phone do you have?",
            "when was the last time you cried?",
            "how tall are u?",
            "what's the most embarrassing thing you've ever done in public?",
            "if you had to delete all but three apps on your phone, which ones would you keep?",
            "have you ever had a crush on a fictional character?",
            "what's the weirdest food combination you actually love?",
            "if you could swap lives with someone for a day, who would it be and why?",
            "what's the most awkward text you've ever sent?",
            "do you believe in soulmates?",
            "You're awesome! 😎",
            "If you could travel anywhere, where would you go? ✈️",
            "Shoutout to the dev who made this awesome app! 🚀"
        ];

        // If all suggestions have been used, reset the set
        if (this.usedSuggestions.size === suggestions.length) {
            this.usedSuggestions.clear();
        }

        // Find a suggestion that hasn't been used before
        const availableSuggestions = suggestions.filter(
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
                    // Add the question to answered questions
                    this.answeredQuestionsManager.addQuestion(message);
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