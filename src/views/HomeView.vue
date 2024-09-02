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
                                HP: {{ enemy.currentHP }} / {{ enemy.maxHP }}
                                AC: {{ enemy.ac }}
                            </div>
                        </div>
                    </li>
                </ul>

                <div class="justify-content-center pt-4">
                    <div class="input-group pt-3">
                        <input type="text" class="form-control" placeholder="Enter command..." v-model="command"
                            @keyup.enter="processCommand" />
                        <button class="btn btn-outline-primary" @click="processCommand">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Reactive state for hostiles
const enemies = new Map();

// Reactive state for new hostile input
const command = ref('');

// Function to add new hostile to the list
const processCommand = () => {

    if (command.value.trim() !== '') {

        const commandArgs = command.value.toLowerCase().split(" ");

        switch (commandArgs[0]) {
            case "enemy":
                if (commandArgs[1] == "add") {
                    if (commandArgs[5] !== "" && !isNaN(Number(commandArgs[5]))) {
                        for (let i = 0; i < Number(commandArgs[5]); i++) {
                            addEnemy(commandArgs[2], commandArgs[3], commandArgs[4]);
                        }
                    } else {
                        addEnemy(commandArgs[2], commandArgs[3], commandArgs[4]);
                    }
                }
                else if (commandArgs[1] == "remove" && commandArgs[2] !== "")
                    if (commandArgs[2] == "all")
                        enemies.clear();
                    else
                        enemies.delete(commandArgs[2]);
                break;
            default:
                break;
        }

        command.value = '';  // Clear the input field
    }
};

function addEnemy(name = "Enemy", hp = 30, ac = 10) {
    const id = String(enemies.size + 1);

    const data = {
        name: name,
        maxHP: hp,
        currentHP: hp,
        ac: ac
    };

    return enemies.set(id, data);
}
</script>
