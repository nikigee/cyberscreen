<template>
    <div class="col-xl-6">
        <h2 class="header_text">HOSTILES</h2>
        <ul class="list-group list-group-flush">
            <li v-for="[key, enemy] in enemies" :key="key" class="list-group-item list-group-item-action"
                v-bind:class="{ 'list-group-item-primary': enemy.currentHP <= 0 }" @click="quickSelect(key)">
                <div class="row align-items-center text-start">
                    <div class="col-auto">
                        <span class="text-muted">ID:</span> {{ key }}
                    </div>
                    <div class="col">
                        [ status: {{ enemy.currentHP <= 0 ? "neutralized" : "alive" }} ]
                        <div class="fw-bold text-uppercase">{{ enemy.name }}</div>
                        <span class="text-muted">HP:</span> {{ enemy.currentHP }} / {{ enemy.maxHP }}
                        ({{
                            percentage(enemy) }}%)
                        <span class="text-muted">AC:</span> {{ enemy.ac }}
                        
                        <div v-if="enemy.inv.length > 0"><span class="text-muted">INV:</span> {{
                            enemy.inv.join(", ") }}</div>

                        <div v-if="enemy.notes.length > 0" class="text-muted">notes: {{
                            JSON.stringify(enemy.notes)
                        }}</div>
                    </div>
                </div>
            </li>
            <!-- If no enemies -->
            <li class="list-group-item list-group-item-action mt-1" v-if="enemies.size == 0">
                <p class="m-0">Initialize...</p>
                <p class="m-0">No enemies detected.</p>
                <p class="m-0 text-muted">hi ฅ^•ﻌ•^ฅ</p>
                <p class="m-0 text-muted">psst! to begin, type:</p>
                <p class="m-0 text-muted">enemy add "name" "hp" "ac" "count"</p>

            </li>
        </ul>

        <div class="justify-content-center">
            <div class="input-group pt-3">
                <input type="text" class="form-control command-input" placeholder="Enter command..."
                    v-model="command" @keyup.enter="processCommand" />
                <button class="btn btn-outline-primary" @click="processCommand">Run</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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
    // TODO: to be expanded on later
    if (key) {
        command.value = `${key} `;
        document.querySelector(".command-input").focus();
    }
};

// Function to add new hostile to the list
const processCommand = () => {
    if (command.value.trim() !== '') {

        // Split command by spaces, but keep quoted strings together
        const commandArgs = command.value.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/"/g, ''));

        switch (commandArgs[0].toLowerCase()) {
            case "enemy":
                if (commandArgs[1] === "add") {
                    if (commandArgs[5] !== "" && !isNaN(Number(commandArgs[5]))) {
                        for (let i = 0; i < Number(commandArgs[5]); i++) {
                            addEnemy(commandArgs[2], commandArgs[3], commandArgs[4]);
                        }
                    } else {
                        addEnemy(commandArgs[2], commandArgs[3], commandArgs[4]);
                    }
                }
                else if (commandArgs[1] === "remove" && commandArgs[2] !== "") {
                    if (commandArgs[2] === "all") {
                        enemies.value.clear();
                    } else {
                        enemies.value.delete(commandArgs[2]);
                    }
                }
                break;
            default:
                // by default, we assume they've selected an enemy

                const selected = enemies.value.get(commandArgs[0]);
                if (selected) {
                    switch (commandArgs[1]) {
                        case "max": case "heal":
                            // heal fully
                            selected.currentHP = selected.maxHP;
                            break;

                        case "notes": case "note":
                            if (commandArgs[2]) {
                                if (commandArgs[2] == "clear") {
                                    selected.notes = []; // clear notes
                                } else {
                                    let text = commandArgs.slice(2).join(" ");
                                    selected.notes.push(text);
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
                        default:
                            // add / remove hp

                            let value = Number(commandArgs[1]);
                            if (isNaN(value)) {
                                break;
                            }

                            selected.currentHP += value;
                            break;
                    }
                }
                break;
        }

        command.value = '';  // Clear the input field
        saveEnemies();  // Save enemies to localStorage
    }
};

const addEnemy = (name = "Enemy", hp = 30, ac = 10) => {
    const id = ((new Date()).getTime() + enemies.value.size).toString(36).slice(5);

    const data = {
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
</script>
