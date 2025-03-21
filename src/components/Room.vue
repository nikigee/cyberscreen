<template>
    <div class="text-start">
        <h2 class="header_text header_bg text-center text-black py-1 px-2"
            :style="{ backgroundColor: accent }">
            {{ room.name }}
        </h2>
        <p>...</p>
        <!-- Render description with HTML formatting and transition -->
        <transition name="fade">
            <div v-if="description" v-html="description"></div>
        </transition>

        <transition name="fade">
            <div v-if="in_depth.poi">
                <h3 class="header_text h4 mt-4 mb-1" :style="{ color: accent }">
                    Points of Interest
                </h3>
                <transition name="fade">
                    <p class="mb-2" :style="{ color: accent }" v-if="in_depth.objective">[ ! ] {{
                        in_depth.objective
                        }}.</p>
                </transition>
                <div v-html="in_depth.poi"></div>
            </div>
        </transition>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import DOMPurify from 'dompurify';
import { useAIStore } from '@/stores/datafort';
import GFX from './GFX.vue';

const ai = useAIStore();
const room = ai.room;

const description = ref('');
const accent = ref('');
const in_depth = ref({});

// Save the room object to localStorage whenever it changes
watch(
    () => room,
    () => {
        try {
            localStorage.setItem('room', JSON.stringify(room));
        } catch (error) {
            console.error('Error saving room to localStorage:', error);
        }
    },
    { deep: true }
);

// Generate the description and accent color
async function generateRoomDetails() {
    description.value = ''; // Clear description to trigger transition
    in_depth.value = {};

    try {
        // Generate description if not available
        if (!room.description) {
            const promptText = `Please write a vivid and immersive description of the location "${DOMPurify.sanitize(
                room.name
            )}" for a Cyberpunk Red campaign. Keep it easy for a dm to narrate. Incorporate the following context: "${DOMPurify.sanitize(
                room.context
            )}". The description should be no more than two paragraphs. Each paragraph should be less than 70 words. Do not include a title or any additional headings.`;

            const response = await ai.prompt(promptText, true);
            const formattedDescription = `<p>${response.replace(/\n/g, '</p><p>')}</p>`;
            room.description = DOMPurify.sanitize(formattedDescription);
        }
        description.value = room.description;

        // Generate accent color if not available
        if (!room.accent) {
            const promptText = `Based on the following description: "${room.description}", suggest a bright neon color in CSS hex code that complements a dark cyberpunk-themed black background for a web application. Provide only the hex code without any additional text or explanation.`;
            const response = await ai.prompt(promptText, false);
            const hexCode = response.trim();
            if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexCode)) {
                room.accent = hexCode;
            } else {
                throw new Error('Invalid hex code received from AI');
            }
        }
        accent.value = room.accent;

        // Only run this if the user opts to make the room more detailed / in depth
        if (!room.enhance) {
            room.in_depth = {}; // clear if not enhanced
            return;
        }
        console.log("Room is enhanced");

        // if theres an objective, assign it here
        if (room.in_depth.objective) {
            in_depth.value.objective = room.in_depth.objective; // assign
            console.log("Objective is assigned");
        }

        if (!room.in_depth.poi) {
            let promptText = `Based on the following description: "${room.description}", create a list of at least four points of interest within this room for a Cyberpunk Red tabletop session. Each point of interest should be interactive and offer opportunities for players to find loot, discover clues, or engage with NPCs relevant to their goals. For each item, provide a brief description (one or two sentences) that is concise and directly related to the players' objectives. Format the list with bold titles for each point of interest using double asterisks (**), followed by a colon and the description. Do not include an introduction or conclusion; just provide the list.`;
            if (room.in_depth.objective) {
                promptText += ` The party's objective in this room is: "${room.in_depth.objective}".`;
            }


            const response = await ai.prompt(promptText, true);

            // Replace **text** with <b>text</b> in the response
            const processedResponse = response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            // Process the response and assign it to in_depth.poi
            const formattedPOI = `<p>${processedResponse.replace(/\n/g, '</p><p>')}</p>`;
            room.in_depth.poi = DOMPurify.sanitize(formattedPOI);
        }
        in_depth.value.poi = room.in_depth.poi;



    } catch (error) {
        console.error('Error generating room details:', error);
    }
}


onMounted(generateRoomDetails);

// Regenerate details when room name or context changes
watch(
    () => [room.name, room.context, room.enhance],
    generateRoomDetails
);
</script>

<style scoped>
/* Fade transition for the description */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes slideIn {
    0% {
        width: 80%;
    }

    100% {
        width: 100%;
    }
}


/* Accent color transition */
.header_bg {
    transition: background-color 0.5s ease-in-out;
    background-color: white;
    animation: slideIn 0.5s ease;
}
</style>