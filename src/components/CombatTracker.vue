<template>
    <h2 class="header_text">敵HOSTILES</h2>
    <ul class="list-group list-group-flush">
        <li v-for="[key, enemy] in enemies" :key="key" class="list-group-item list-group-item-action"
            v-bind:class="{ 'list-group-item-primary': enemy.currentHP <= 0 }" @click="quickSelect(key)">
            <Entity :entity="enemy" :entityKey="key" />
        </li>
        <!-- If no enemies -->
        <li class="list-group-item mt-1" v-if="enemies.size == 0">
            <p class="m-0">Initialize...</p>
            <p class="m-0">No enemies detected.</p>
            <p class="m-0 text-muted">hi ฅ^•ﻌ•^ฅ</p>
            <p class="m-0 text-muted">psst! to begin, type:</p>
            <p class="m-0 text-muted">enemy add "name" "hp" "ac" "count"</p>

        </li>
    </ul>

    <div class="justify-content-center">
        <div class="input-group pt-3">
            <input type="text" class="form-control command-input" placeholder="Enter command..." v-model="command"
                @keyup.enter="processCommand" />
            <button class="btn btn-outline-primary" @click="processCommand">Run</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import Entity from './Entity.vue'
import { useAIStore } from '@/stores/datafort';
import { useLootStore } from '@/stores/stores';

const ai = useAIStore();

const room = ai.room;

// Reactive state for hostiles
const enemies = ref(new Map());

// Reactive state for new hostile input
const command = ref('');

// Load enemies from localStorage when the component is mounted
onMounted(() => {
    const storedEnemies = localStorage.getItem('saved_enemies');
    if (storedEnemies) {
        enemies.value = new Map(JSON.parse(storedEnemies));
    }
});

const quickSelect = (key) => {
    if (key) {
        const parsed = parseSelected(command.value);

        // Check if the key is already present
        const hasKey = parsed.some((e) => e.id == key);

        if (!hasKey) {
            command.value = parsed.length > 0
                ? `${command.value.trim()},${key} `
                : `${key} `;
        }

        document.querySelector(".command-input").focus();
    }
};



const genID = () => {
    return ((new Date()).getTime() + enemies.value.size).toString(36).slice(5);
}

const addEntity = (name = "Enemy", hp = 30, ac = 10) => {
    const id = genID();

    const data = {
        id: id,
        name: name,
        maxHP: Number(hp),
        currentHP: Number(hp),
        ac: ac,
        notes: [],
        inv: []
    };

    enemies.value.set(id, data);
};

const saveEnemies = () => {
    localStorage.setItem("saved_enemies", JSON.stringify(Array.from(enemies.value.entries())));
};

// Access the global instance to call this.$md
const { proxy } = getCurrentInstance();

// for processing commands on a selected enemy
const processSelectCommand = (commandArgs, selected) => {
    switch (commandArgs[1]) {
        case "max": case "heal":
            // heal fully
            selected.currentHP = selected.maxHP;

            proxy.$cyber.write(`${selected.name} (${selected.id}) fully healed to ${selected.maxHP} hp`);
            break;

        case "notes": case "note":
            if (commandArgs[2]) {
                if (commandArgs[2] == "clear") {
                    const count = selected.notes.length;

                    selected.notes = []; // clear notes

                    proxy.$cyber.write(`${selected.name} (${selected.id}) ${count} note(s) cleared`);
                } else {
                    let text = commandArgs.slice(2).join(" ");
                    selected.notes.push(text);

                    proxy.$cyber.write(`${selected.name} (${selected.id}) note => ${text}`);
                }
            }

            break;
        case "weapon": case "inv":
            if (commandArgs[2]) {
                if (commandArgs[2] == "clear") {
                    selected.inv = []; // clear notes
                } else {
                    let text = commandArgs.slice(2).join(" ");
                    selected.inv.push(text);
                }
            }

            break;

        case "copy":
            let times = 1;
            if (commandArgs[2]) {
                if (!isNaN(Number(commandArgs[2])))
                    times = Number(commandArgs[2]);
            }

            for (let i = 0; i < times; i++) {
                let copy = JSON.parse(JSON.stringify(selected));
                copy.id = genID(); // set new id

                enemies.value.set(copy.id, copy);
            }

            break;
        case "remove": case "delete":
            enemies.value.delete(selected.id);

            break;

        case "roll":
            let text = commandArgs.slice(2).join(" ");

            proxy.$cyber.write(`${selected.name} (${selected.id}) rolls ${text}`);

            proxy.$roll(text);

            break;
        default:
            // add / remove hp

            let value = Number(commandArgs[1]);

            // dice roll support
            if (/^-?(\d+)?d\d+([+-]\d+)?$/.test(commandArgs[1])) {
                const roll = proxy.$roll(commandArgs[1]);
                value = roll.total;
            }

            if (isNaN(value)) {
                break;
            }

            if (commandArgs[2]) {
                if (Math.sign(value) === -1) {
                    proxy.$cyber.write(`${commandArgs[2]} dealt ${value * -1} damage to ${selected.name} (${selected.id})`);
                } else {
                    proxy.$cyber.write(`${commandArgs[2]} healed ${selected.name} (${selected.id}) by ${value} points`);
                }
            }

            proxy.$cyber.write(`${selected.name} (${selected.id}) hp: ${selected.currentHP} -> ${selected.currentHP + value} (${value})`);


            selected.currentHP += value;
            break;
    }
}

const parseSelected = (input) => {
    const selectedEnemies = new Set();  // Use a Set to avoid duplicates

    input.trim().split(",").forEach(v => {
        const trimmedValue = v.trim();
        const enemy = enemies.value.get(trimmedValue);
        if (enemy) {
            selectedEnemies.add(enemy);
        }
    });

    return Array.from(selectedEnemies);  // Convert Set back to an array
}


// Function to add new hostile to the list
const processCommand = () => {
    if (command.value.trim() !== '') {

        // Split command by spaces, but keep quoted strings together
        const commandArgs = command.value.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/"/g, ''));

        switch (commandArgs[0].toLowerCase()) {
            case "enemy":
                switch (commandArgs[1]) {
                    case "add":
                        if (commandArgs[5] !== "" && !isNaN(Number(commandArgs[5]))) {
                            for (let i = 0; i < Number(commandArgs[5]); i++) {
                                addEntity(commandArgs[2], commandArgs[3], commandArgs[4]);
                            }
                        } else {
                            addEntity(commandArgs[2], commandArgs[3], commandArgs[4]);
                        }
                    case "remove":
                        if (commandArgs[2] !== "") {
                            if (commandArgs[2] === "all") {
                                enemies.value.clear();
                            } else {
                                enemies.value.delete(commandArgs[2]);
                            }
                        }
                    default:
                        break;
                }
                break;
            case "roll":
                commandArgs[0] = "" // remove the roll part

                proxy.$roll(commandArgs.join(" ").trim());
                break;
            case "log":
                switch (commandArgs[1]) {
                    case "clear":
                        proxy.$cyber.clear(); // clear log

                        break;
                    default:
                        commandArgs[0] = "";

                        proxy.$cyber.write("[LOG] " + commandArgs.join(" ").trim());

                        break;
                }
            case "ai":
                // commands relating to ai stuff
                // any function call with proxy.$ai requires backend to be online

                switch (commandArgs[1]) {
                    case "prompt":
                        commandArgs[0] = "";
                        commandArgs[1] = "";

                        let smart = false;

                        if (commandArgs[3] == "true") {
                            smart = true;
                        }

                        ai.prompt(commandArgs[2], smart)
                            .then((r) => {
                                proxy.$cyber.write(`[AI] ${r}`);
                            });

                        break;

                    default:
                        break;
                }

                break;
            case "room":
                if (commandArgs[1] == "clear") {
                    ai.clearRoom();
                    localStorage.removeItem("room"); // remove from save too
                    break; // reset and get out
                } else if (commandArgs[1] == "more") {
                    room.enhance = room.enhance ? false : true;
                    break;
                } else if (commandArgs[1] == "mission" || commandArgs[1] == "objective") {
                    // set the mission / objective in the room
                    if (room.enhance == true) {
                        room.enhance = false; // reset
                        room.in_depth.poi = "";
                    }

                    room.in_depth.objective = commandArgs[2];

                    // set to true to refresh
                    room.enhance = true;

                    proxy.$cyber.write(`room objective changed => ${room.in_depth.objective ? room.in_depth.objective : "No objective"}`);
                    break;
                } else if (commandArgs[1] == "add") {
                    if (!room.description) {
                        proxy.$cyber.write(`[warn] Can't follow up if there is no room.`);
                    } else {
                        const prevContext = [{ role: "assistant", content: room.description }]; // compile context

                        const promptText = `Add onto the previous description with instructions: "${commandArgs[2]}". Ensure that the new content blends seamlessly with the existing description, maintaining the same style and tone. Keep the description concise, brief, and to the point. No more than ${commandArgs[3] ? commandArgs[3] : "40"} words. Focus only on the key details provided and avoid repeating any information already included. Do not add extra background or unrelated content.`;

                        ai.prompt(promptText, true, prevContext)
                            .then((response) => {
                                const formattedDescription = `<p>${response.replace(/\n/g, '</p><p>')}</p>`;
                                const desc = room.description;
                                room.description = "";
                                room.description = desc + `<p>...</p>${formattedDescription}`;

                                // this code is just to force it to refresh
                                room.context += " ";
                                room.content = room.context.trim();
                            });
                    }
                    break;
                } else if (commandArgs[1] == "navigate") {
                    if (!room.name) {
                        proxy.$cyber.write(`[warn] Can't navigate if there is no current room.`);
                    } else {
                        const destination = commandArgs[2];
                        if (!destination) {
                            proxy.$cyber.write(`[warn] Please specify a destination to navigate to.`);
                        } else {
                            const prevContext = [{ role: "assistant", content: room.description }];

                            const promptText = `In our Cyberpunk Red campaign, the player is currently in "${room.name}" described as "${room.description}". They wish to navigate to "${destination}". Provide the new room's name and a brief context for this new location. Format your response exactly as follows:

                                Room Name: [new room name]
                                Context: [new context]

                                The context should be concise, no more than one sentence.`;

                            ai.prompt(promptText, true, prevContext)
                                .then((response) => {
                                    // Parse the response
                                    const roomNameMatch = response.match(/Room Name:\s*(.*)/i);
                                    const contextMatch = response.match(/Context:\s*(.*)/i);

                                    if (roomNameMatch && contextMatch) {
                                        const newRoomName = roomNameMatch[1].trim();
                                        const newRoomContext = contextMatch[1].trim();

                                        ai.clearRoom();

                                        room.name = newRoomName;
                                        room.context = newRoomContext;
                                        room.display = true;

                                    } else {
                                        proxy.$cyber.write(`[warn] Failed to parse the new room information.`);
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error during AI prompt:', error);
                                    proxy.$cyber.write(`[error] Failed to navigate to a new room.`);
                                });
                        }
                    }
                    break;
                }

                const name = commandArgs[1];
                const context = commandArgs[2];

                ai.clearRoom();

                room.name = name;
                room.context = context;
                room.display = true;

                break;

            case "loot":
                const lootStore = useLootStore();
                commandArgs[0] = "";

                ai.generateLoot(commandArgs.join(" ").trim(), lootStore.lootableGearList).then((x) => {
                    lootStore.arr.splice(0); // clear the array reactively
                    lootStore.arr.push(...x); // push the new loot
                });

            default:
                // by default, we assume they've selected an enemy

                const selected = parseSelected(commandArgs[0]);

                selected.forEach((v) => {
                    processSelectCommand(commandArgs, v);
                });

                break;
        }

        command.value = '';  // Clear the input field
        saveEnemies();  // Save enemies to localStorage
    }
};
</script>
