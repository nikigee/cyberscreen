class AI {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    async prompt(userPrompt) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/ai/prompt/`, {
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
            return data;
        } catch (error) {
            console.error('Error during API call:', error);
            return { error: 'An error occurred while communicating with the AI.' };
        }
    }
}

export default AI