import { ref, computed, watch, getCurrentInstance } from 'vue';
import { defineStore } from 'pinia';
import { useAIStore } from '@/stores/datafort';
import { useMagicDice } from './mdStore';
import * as bootstrap from 'bootstrap'; // Import Bootstrap JS

const COMMAND_DEFS = {
    help: { desc: 'Show available commands' },
    entity: {
        desc: 'Manage entities',
        sub: {
            add: { desc: 'Add entity: entity add "name" hp ac count' },
            remove: { desc: 'Remove entity: entity remove [id|all]' }
        }
    },
    enemy: { alias: 'entity' },
    en: { alias: 'entity' },
    roll: { desc: 'Roll dice: roll 1d20+5' },
    log: {
        desc: 'Manage log',
        sub: {
            clear: { desc: 'Clear log' },
            export: { desc: 'Export log to .log file' }
        }
    },
    ai: {
        desc: 'AI commands',
        sub: {
            prompt: { desc: 'Send AI prompt: ai prompt "text" [smart=true/false]' }
        }
    },
    room: {
        desc: 'Manage room',
        sub: {
            clear: { desc: 'Clear room' },
            more: { desc: 'Toggle room enhance' },
            mission: { desc: 'Set objective: room mission "objective"' },
            objective: { alias: 'mission' },
            add: { desc: 'Add details: room add "instructions" [word count]' },
            navigate: { desc: 'Navigate: room navigate "destination"' }
        }
    }
};

const ENTITY_CMDS = {
    max: { desc: 'Heal fully' },
    heal: { alias: 'max' },
    friendly: { desc: 'Toggle friendly' },
    notes: { desc: 'Add/clear notes: notes [text|clear]' },
    note: { alias: 'notes' },
    inv: { desc: 'Add/clear inventory: inv [text|clear]' },
    weapon: { alias: 'inv' },
    copy: { desc: 'Copy entity: copy [times]' },
    cp: { alias: 'copy' },
    remove: { desc: 'Remove entity' },
    delete: { alias: 'remove' },
    rm: { alias: 'remove' },
    roll: { desc: 'Roll dice: roll "dice"' },
    init: { desc: 'Set initiative: init [score]' },
    initiative: { alias: 'init' },
    edit: { desc: 'Open edit modal' }
};

export const useCommandStore = defineStore('command', () => {
    const ai = useAIStore();
    const { md, cyberlog, roll } = useMagicDice();

    const room = ai.room;

    class Entity {
        constructor(props = {}) {
            this.id = props.id || '';
            this.name = props.name || 'Entity';
            this.maxHP = Number(props.maxHP ?? 30);
            this.currentHP = Number(props.currentHP ?? this.maxHP);
            this.ac = Number(props.ac ?? 10);
            this.notes = Array.isArray(props.notes) ? props.notes : [];
            this.inv = Array.isArray(props.inv) ? props.inv : [];
            this.init = props.init || { v: 0, score: 0 };
            this.friendly = !!props.friendly;
        }
    }

    function loadEntities() {
        let en;
        const storedEntities = localStorage.getItem('saved_entities');
        if (storedEntities) {
            const arr = JSON.parse(storedEntities);
            en = new Map(arr.map(([k, v]) => [k, new Entity(v)]));
        } else {
            en = new Map();
        }
        return en;
    }

    // Reactive state for hostiles
    const entities = ref(loadEntities());
    const editEntityID = ref('');

    const sortedEntities = computed(() => {
        return Array.from(entities.value.values()).sort((a, b) => {
            if (b.init.v !== a.init.v) return b.init.v - a.init.v;
            return b.init.score - a.init.score;
        });
    });

    const turnIndex = ref(0);

    watch(sortedEntities, (newVal) => {
        if (newVal.length === 0) {
            turnIndex.value = 0;
        } else if (turnIndex.value >= newVal.length) {
            turnIndex.value = Math.max(0, newVal.length - 1);
        }
    }, { deep: true });

    const nextTurn = () => {
        if (sortedEntities.value.length > 0) {
            turnIndex.value = (turnIndex.value + 1) % sortedEntities.value.length;
        }
    };

    const prevTurn = () => {
        if (sortedEntities.value.length > 0) {
            turnIndex.value = (turnIndex.value - 1 + sortedEntities.value.length) % sortedEntities.value.length;
        }
    };

    const resetTurn = () => {
        turnIndex.value = 0;
    };

    const turnEntityId = computed(() => {
        if (sortedEntities.value.length > 0 && turnIndex.value >= 0 && turnIndex.value < sortedEntities.value.length) {
            return sortedEntities.value[turnIndex.value].id;
        }
        return null;
    });

    // Reactive state for new hostile input
    const command = ref('');
    const commandHistory = ref([]);
    const historyIndex = ref(-1);

    const getTokens = (str) => {
        const regex = /(?:[^\s"]+|"[^"]*")+/g;
        const matches = str.match(regex);
        if (!matches) return [];

        const endsWithSpace = str.endsWith(' ');
        const tokens = matches.map(arg => arg.replace(/"/g, ''));
        if (endsWithSpace) tokens.push('');
        return tokens;
    };

    const currentSuggestions = computed(() => {
        if (!command.value.trim() && !command.value.endsWith(' ')) return [];

        const tokens = getTokens(command.value);
        if (tokens.length === 0) return [];

        const lastToken = tokens[tokens.length - 1].toLowerCase();
        const isFirstToken = tokens.length === 1;
        let suggestions = [];

        if (isFirstToken) {
            Object.entries(COMMAND_DEFS).forEach(([key, val]) => {
                if (!val.alias && key.startsWith(lastToken)) {
                    suggestions.push({ text: key, description: val.desc });
                }
            });

            const prefixParts = lastToken.split(',');
            const currentPart = prefixParts.pop();
            const prefix = prefixParts.length > 0 ? prefixParts.join(',') + ',' : '';

            entities.value.forEach((entity, id) => {
                if (id.toLowerCase().startsWith(currentPart)) {
                    suggestions.push({ text: prefix + id, description: `Entity: ${entity.name}` });
                }
            });
        } else {
            const firstToken = tokens[0].toLowerCase();
            const baseCmd = COMMAND_DEFS[firstToken]?.alias ? COMMAND_DEFS[COMMAND_DEFS[firstToken].alias] : COMMAND_DEFS[firstToken];

            if (baseCmd && baseCmd.sub && tokens.length === 2) {
                Object.entries(baseCmd.sub).forEach(([key, val]) => {
                    if (!val.alias && key.startsWith(lastToken)) {
                        suggestions.push({ text: key, description: val.desc });
                    }
                });
            }

            const isEntitySelection = firstToken.split(',').every(id => entities.value.has(id.trim()));
            if (isEntitySelection && tokens.length === 2) {
                Object.entries(ENTITY_CMDS).forEach(([key, val]) => {
                    if (!val.alias && key.startsWith(lastToken)) {
                        suggestions.push({ text: key, description: val.desc });
                    }
                });
            }
        }
        return suggestions;
    });

    const applySuggestion = (suggestionText) => {
        const lastSpace = command.value.lastIndexOf(' ');
        if (lastSpace === -1) {
            command.value = suggestionText + ' ';
        } else {
            command.value = command.value.substring(0, lastSpace + 1) + suggestionText + ' ';
        }
    };

    const navigateHistory = (dir) => {
        if (commandHistory.value.length === 0) return;

        if (dir === -1) { // Up
            if (historyIndex.value < commandHistory.value.length - 1) {
                historyIndex.value++;
                command.value = commandHistory.value[commandHistory.value.length - 1 - historyIndex.value];
            }
        } else if (dir === 1) { // Down
            if (historyIndex.value > 0) {
                historyIndex.value--;
                command.value = commandHistory.value[commandHistory.value.length - 1 - historyIndex.value];
            } else if (historyIndex.value === 0) {
                historyIndex.value = -1;
                command.value = '';
            }
        }
    };

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
                    const rolledDice = match[0];
                    if (!quickrolls.value.includes(rolledDice)) {
                        quickrolls.value.push(rolledDice);
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
            init: {
                v: 0,
                score: 0
            },
            friendly: false
        };

        entities.value.set(id, new Entity(data));
    };

    const saveEntities = () => {
        localStorage.setItem("saved_entities", JSON.stringify(Array.from(entities.value.entries())));
        console.log("saved entity list");
    };

    // for processing commands on a selected entity
    const processSelectCommand = (commandArgs, selected) => {
        switch (commandArgs[1]) {
            case "max": case "heal":
                // heal fully
                selected.currentHP = selected.maxHP;

                cyberlog.write(`${selected.name} (${selected.id}) fully healed to ${selected.maxHP} hp`);
                break;

            case "friendly":
                selected.friendly = !selected.friendly;
                break;

            case "notes": case "note":
                if (commandArgs[2]) {
                    if (commandArgs[2] == "clear") {
                        const count = selected.notes.length;

                        selected.notes = []; // clear notes

                        cyberlog.write(`${selected.name} (${selected.id}) ${count} note(s) cleared`);
                    } else {
                        let text = commandArgs.slice(2).join(" ");
                        selected.notes.push(text);

                        cyberlog.write(`${selected.name} (${selected.id}) note => ${text}`);
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

            case "copy": case "cp":
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
            case "remove": case "delete": case "rm":
                entities.value.delete(selected.id);

                break;

            case "roll":
                let text = commandArgs.slice(2).join(" ");

                cyberlog.write(`${selected.name} (${selected.id}) rolls ${text}`);

                roll(text);

                break;
            case "init": case "initiative":
                if (commandArgs[2]) {
                    const initScore = Number(commandArgs[2]);
                    if (!isNaN(initScore)) {
                        selected.init.score = initScore;
                    }
                }
                break;
            case "edit":
                editEntityID.value = selected.id;

                // open bootstrap modal
                const modal = new bootstrap.Modal("#entityEdit");
                modal.show();

                break;
            default:
                // add / remove hp

                let value = Number(commandArgs[1]);

                // dice roll support
                if (/^-?(\d+)?d\d+([+-]\d+)?$/.test(commandArgs[1])) {
                    const rolledDice = roll(commandArgs[1]);
                    value = rolledDice.total;
                }

                if (isNaN(value)) {
                    break;
                }

                if (commandArgs[2]) {
                    if (Math.sign(value) === -1) {
                        cyberlog.write(`${commandArgs[2]} dealt ${value * -1} damage to ${selected.name} (${selected.id})`);
                    } else {
                        cyberlog.write(`${commandArgs[2]} healed ${selected.name} (${selected.id}) by ${value} points`);
                    }
                }

                cyberlog.write(`${selected.name} (${selected.id}) hp: ${selected.currentHP} -> ${selected.currentHP + value} (${value})`);


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

            // History
            commandHistory.value.push(command.value);
            historyIndex.value = -1;

            // Split command by spaces, but keep quoted strings together
            const commandArgs = command.value.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/"/g, ''));

            switch (commandArgs[0].toLowerCase()) {
                case "help":
                    cyberlog.write("=== Available Commands ===");
                    Object.entries(COMMAND_DEFS).forEach(([key, val]) => {
                        if (!val.alias) {
                            let msg = `- ${key}: ${val.desc}`;
                            if (val.sub) {
                                msg += ` (Subcommands: ${Object.keys(val.sub).join(', ')})`;
                            }
                            cyberlog.write(msg);
                        }
                    });
                    cyberlog.write("=== Entity Commands (usage: [id] [command]) ===");
                    cyberlog.write(Object.entries(ENTITY_CMDS).filter(([k, v]) => !v.alias).map(([k, v]) => k).join(", "));
                    break;
                case "entity": case "enemy": case "en":
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
                                        if (v.friendly == false)
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

                    roll(commandArgs.join(" ").trim());
                    break;
                case "log":
                    switch (commandArgs[1]) {
                        case "clear":
                            cyberlog.clear(); // clear log

                            break;
                        case "export": {
                            const logLines = cyberlog.log.map(item => {
                                if (item.isDateMarker) {
                                    return item.content;
                                } else {
                                    const date = new Date(item.timestamp || item.id);
                                    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                    return `[${timeStr}] ${item.content}`;
                                }
                            });
                            const blob = new Blob([logLines.join("\n")], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `cyberlog_export_${Date.now()}.log`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            cyberlog.write("Exported log to .log file");
                            break;
                        }
                        default:
                            commandArgs[0] = "";

                            cyberlog.write("[LOG] " + commandArgs.join(" ").trim());

                            break;
                    }
                    break;
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
                                    cyberlog.write(`[AI] ${r}`);
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

                        cyberlog.write(`room objective changed => ${room.in_depth.objective ? room.in_depth.objective : "No objective"}`);
                        break;
                    } else if (commandArgs[1] == "add") {
                        if (!room.description) {
                            cyberlog.write(`[warn] Can't follow up if there is no room.`);
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
                            cyberlog.write(`[warn] Can't navigate if there is no current room.`);
                        } else {
                            const destination = commandArgs[2];
                            if (!destination) {
                                cyberlog.write(`[warn] Please specify a destination to navigate to.`);
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
                                            cyberlog.write(`[warn] Failed to parse the new room information.`);
                                        }
                                    })
                                    .catch((error) => {
                                        console.error('Error during AI prompt:', error);
                                        cyberlog.write(`[error] Failed to navigate to a new room.`);
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
        currentSuggestions,
        applySuggestion,
        navigateHistory,
        quickrolls,
        processCommand,
        quickSelect,
        editEntityID,
        saveEntities,
        sortedEntities,
        turnIndex,
        turnEntityId,
        nextTurn,
        prevTurn,
        resetTurn
    };

})