class AI {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
        this.thinking = false;
    }

    async prompt(userPrompt) {
        try {
            this.thinking = true;
            const response = await fetch(`${this.apiBaseUrl}/api/prompt/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            this.thinking = false;
            return data.content;
        } catch (error) {
            console.error('Error during API call:', error);
            this.thinking = false;
            return `[error] Failed to communicate with the datafort.`;
        }
    }
}

export default AI