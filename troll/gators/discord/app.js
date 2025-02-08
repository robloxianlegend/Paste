const DEFAULT_TOKEN = 'MTI2ODg0NDc3MjY3NjczMDg4MA.GGqf38.nAXUsX2SCNAy5pacT0uss1dQqXog6R-OGYFyho';

async function setStatus() {
    const customStatusText = document.getElementById('customStatusText');
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = '';

    // Set up activities array with "Watching nothing"
    const customStatus = {
        activities: [
            {
                type: 3,  // 3 = Watching activity type
                name: 'nothing'  // This creates "Watching nothing"
            }
        ]
    };

    // Add custom status text if provided
    const statusText = customStatusText.value.trim();
    if (statusText) {
        customStatus.custom_status = { text: statusText };
    }

    try {
        const response = await fetch('https://discord.com/api/v9/users/@me/settings', {
            method: 'PATCH',
            headers: {
                'Authorization': DEFAULT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customStatus)
        });

        // ... rest of the response handling remains unchanged ...
        if (response.ok) {
            resultDiv.textContent = 'successfully changed';
            resultDiv.style.color = 'green';
        } else {
            const errorData = await response.json();
            resultDiv.textContent = `Error: ${errorData.message || 'failed to set status'}`;
            resultDiv.style.color = 'red';
        }
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
        resultDiv.style.color = 'red';
    }
}
