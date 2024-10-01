<template>
    <h2 class="header_text">敵HOSTILES</h2>
    <ul class="list-group list-group-flush">
        <li v-for="[key, enemy] in enemies" :key="key" class="list-group-item list-group-item-action"
            v-bind:class="{ 'list-group-item-primary': enemy.currentHP <= 0 }" @click="quickSelect(key)">
            <div class="row align-items-center text-start">
                <div class="col-auto">
                    <span class="text-muted">ID:</span> {{ key }}
                </div>
                <div class="col">
                    <div class="d-flex justify-content-between">
                        <!-- Left side -->
                        <div>
                            <span>[ status: {{ getStatus(enemy) }} ]</span>
                            <div class="fw-bold text-uppercase">{{ enemy.name }}</div>

                            <div v-if="enemy.notes.length > 0" class="text-muted">
                                notes: {{ JSON.stringify(enemy.notes) }}
                            </div>
                        </div>
                        <!-- Right side -->
                        <div class="text-end">
                            <div><span class="text-muted">HP:</span> {{ enemy.currentHP }} / {{ enemy.maxHP }} ({{
                                percentage(enemy) }}%) <span class="text-muted">AC:</span> {{ enemy.ac }}</div>
                            <div v-if="enemy.inv.length > 0">
                                <span class="text-muted">equipment:</span> {{ enemy.inv.join(", ") }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

const addEnemy = (name = "Enemy", hp = 30, ac = 10) => {
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

const percentage = (enemy) => {
    return (enemy.currentHP / enemy.maxHP * 100).toFixed(0);
}

const getStatus = (enemy) => {
    return (enemy.currentHP <= 0 ? 'neutralized' : 'alive');
}

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
                                addEnemy(commandArgs[2], commandArgs[3], commandArgs[4]);
                            }
                        } else {
                            addEnemy(commandArgs[2], commandArgs[3], commandArgs[4]);
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

                // const roll = proxy.$md.Dice.x(commandArgs.join(" ").trim());

                // proxy.$md.diceHistory.push(roll);
                // proxy.$cyber.write(`rolled ${roll.dice}, total: ${roll.total}`)

                proxy.$roll(commandArgs.join(" ").trim());
                break;
            case "log":
                switch (commandArgs[1]) {
                    case "clear":
                        proxy.$cyber.clear(); // clear log

                        break;
                    case "add":
                        commandArgs[0] = "";
                        commandArgs[1] = "";

                        proxy.$cyber.write(commandArgs.join(" ").trim());

                        break;
                    default:
                        break;
                }
            case "ai":
                commandArgs[0] = "";
                
                proxy.$ai.prompt(commandArgs.join(" ").trim())
                    .then((r) => {
                        proxy.$cyber.write(r.content);
                    });

                break;
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
