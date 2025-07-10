import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAIStore = defineStore('ai', () => {
    // AI related state and methods
    const apiBaseUrl = import.meta.env.VITE_API_URL;
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

    // function to generate a container of loot based on the given name
    // The AI selects items from the given table which would fit inside that container
    // example: "Hidden safe"
    // lootTable is an array of objects
    // returns an array of objects
    const generateLoot = async (containerName, lootTable) => {
        try {
            if (!Array.isArray(lootTable) || lootTable.length === 0) {
                console.error("generateLoot: lootTable must be a non-empty array.");
                return [];
            }

            const userPrompt = `
    You are selecting items to place inside a container called "${containerName}".
    Here is the available loot table:
    
    ${JSON.stringify(lootTable, null, 2)}
    
    Pick a small number of items (2 to 5) that would realistically fit inside that container.
    For each selected item, return an object with:
    - name
    - quantity (whatever makes sense)
    - cost (same as the item in the lootTable)
    
    Return ONLY a JSON array of the selected items.
    `;

            let aiResponse = await prompt(userPrompt, true); // smart=true for better selection
            aiResponse = aiResponse.replace("```json", "");
            aiResponse = aiResponse.replace("```", "");

            let loot;

            try {
                loot = JSON.parse(aiResponse);
            } catch (parseError) {
                console.log(aiResponse);
                console.error('Failed to parse AI loot response:', parseError);
                return [];
            }

            if (!Array.isArray(loot)) {
                console.log(aiResponse);
                console.error('AI did not return an array.');
                return [];
            }

            console.log("container name: ", containerName);
            console.log("loot: ", loot);
            return loot;
        } catch (error) {
            console.error('generateLoot error:', error);
            return [];
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
        generateLoot,

        // Room
        room,
        clearRoom
    };
});
