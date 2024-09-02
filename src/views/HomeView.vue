<template>
    <div class="container text-center pt-4">
        <div class="row justify-content-center">
            <div class="col-6">
                <h2>HOSTILES</h2>
                <ul class="list-group list-group-flush">
                    <li v-for="[key, enemy] in enemies" :key="key" class="list-group-item list-group-item-action">
                        <div class="row align-items-center text-start">
                            <div class="col-auto">
                                ID: {{ key }}
                            </div>
                            <div class="col">
                                [ status: alive ]
                                <div class="fw-bold text-uppercase">{{ enemy.name }}</div>
                                HP: {{ enemy.currentHP }} / {{ enemy.maxHP }} ({{ (enemy.currentHP / enemy.maxHP *
                                    100).toFixed(0) }}%)
                                AC: {{ enemy.ac }}
                            </div>
                        </div>
                    </li>
                </ul>

                <div class="justify-content-center pt-4">
                    <div class="input-group pt-3">
                        <input type="text" class="form-control" placeholder="Enter command..." v-model="command"
                            @keyup.enter="processCommand" />
                        <button class="btn btn-outline-primary" @click="processCommand">Run</button>
                    </div>
                </div>
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
    const id = String(enemies.value.size + 1);

    const data = {
        name: name,
        maxHP: Number(hp),
        currentHP: Number(hp),
        ac: ac
    };

    enemies.value.set(id, data);
};

const saveEnemies = () => {
    localStorage.setItem("saved_enemies", JSON.stringify(Array.from(enemies.value.entries())));
};
</script>
