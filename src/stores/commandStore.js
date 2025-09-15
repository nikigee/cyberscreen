import { ref, getCurrentInstance } from 'vue';
import { defineStore } from 'pinia';
import { useAIStore } from '@/stores/datafort';
import { useLootStore } from '@/stores/stores';

export const useCommandStore = defineStore('command', () => {
    const ai = useAIStore();

    const room = ai.room;

    // Load entities from localStorage when the component is mounted
    function loadEntities() {
        let en;
        const storedEntities = localStorage.getItem('saved_entities');
        if (storedEntities) {
            en = new Map(JSON.parse(storedEntities));
        } else {
            en = new Map();
        }
        return en;
    }

    // Reactive state for hostiles
    const entities = ref(loadEntities());

    // Reactive state for new hostile input
    const command = ref('');



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

    const quickrolls = ref([]);

    const updateRolls = () => {
        const diceRegex = /\b(?:\d+)?d\d+(?:[+-]\d+)?\b/gi;
        quickrolls.value = [];

        entities.value.forEach(v => {
            v.inv.forEach(x => {
                const matches = [...x.matchAll(diceRegex)];
                matches.forEach(match => {
                    const roll = match[0];
                    if (!quickrolls.value.includes(roll)) {
                        quickrolls.value.push(roll);
                    }
                });
            });
        });
    };
    updateRolls();



    const genID = () => {
        return ((new Date()).getTime() + entities.value.size).toString(36).slice(5);
    }

    const addEntity = (name = "Entity", hp = 30, ac = 10) => {
        const id = genID();

        const data = {
            id: id,
            name: name,
            maxHP: Number(hp),
            currentHP: Number(hp),
            ac: ac,
            notes: [],
            inv: [],
            friendly: false
        };

        entities.value.set(id, data);
    };

    const saveEntities = () => {
        localStorage.setItem("saved_entities", JSON.stringify(Array.from(entities.value.entries())));
    };

    // Access the global instance to call this.$md
    const { proxy } = getCurrentInstance();

    // for processing commands on a selected entity
    const processSelectCommand = (commandArgs, selected) => {
        switch (commandArgs[1]) {
            case "max": case "heal":
                // heal fully
                selected.currentHP = selected.maxHP;

                proxy.$cyber.write(`${selected.name} (${selected.id}) fully healed to ${selected.maxHP} hp`);
                break;

            case "friendly":
                selected.friendly = !selected.friendly;
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

                    entities.value.set(copy.id, copy);
                }

                break;
            case "remove": case "delete":
                entities.value.delete(selected.id);

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
        const selectedEntities = new Set();  // Use a Set to avoid duplicates

        input.trim().split(",").forEach(v => {
            const trimmedValue = v.trim();
            const entity = entities.value.get(trimmedValue);
            if (entity) {
                selectedEntities.add(entity);
            }
        });

        return Array.from(selectedEntities);  // Convert Set back to an array
    }


    // Function to add new entity to the list
    const processCommand = () => {
        if (command.value.trim() !== '') {

            // Split command by spaces, but keep quoted strings together
            const commandArgs = command.value.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/"/g, ''));

            switch (commandArgs[0].toLowerCase()) {
                case "entity":
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
                                    entities.value.forEach((v, k) => {
                                        // remove every non-friendly entity
                                        if(v.friendly == false)
                                            entities.value.delete(k);
                                    });
                                } else {
                                    entities.value.delete(commandArgs[2]);
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
                    // by default, we assume they've selected an entity

                    const selected = parseSelected(commandArgs[0]);

                    selected.forEach((v) => {
                        processSelectCommand(commandArgs, v);
                    });

                    break;
            }

            command.value = '';  // Clear the input field
            updateRolls();
            saveEntities();  // Save entities to localStorage
        }
    };

    return {
        entities,
        command,
        quickrolls,
        processCommand,
        quickSelect
    };

})