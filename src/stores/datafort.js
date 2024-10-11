import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAIStore = defineStore('ai', () => {
    // AI related state and methods
    const apiBaseUrl = "http://localhost:3000";
    const thinking = ref(false);

    const prompt = async (userPrompt, smart = false, context = []) => {
        try {
            thinking.value = true;
            const response = await fetch(`${apiBaseUrl}/api/prompt/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userPrompt, smart, context }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            thinking.value = false;
            return data.content;
        } catch (error) {
            console.error('Error during API call:', error);
            thinking.value = false;
            return `[error] Failed to communicate with the datafort.`;
        }
    };

    // Room-related state and methods
    const room = ref({
        name: "",
        context: "",
        display: false,
        description: "",
        enhance: false,
        in_depth: {}
    });

    function clearRoom() {
        room.value.name = "";
        room.value.context = "";
        room.value.display = false; // tells to show the room

        // generated when displayed
        room.value.description = "";
        room.value.accent = "";

        // enhance flags to use in_depth features
        room.value.enhance = false;
        room.value.in_depth = {};
    }

    return {
        // AI
        apiBaseUrl,
        thinking,
        prompt,

        // Room
        room,
        clearRoom
    };
});
