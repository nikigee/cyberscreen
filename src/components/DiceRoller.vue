<template>
    <div>
        <h2 class="header_text text-xl-start text-center">運DICE</h2>
        <div>
            <ul class="list-group list-group-flush mb-1">
                <li v-for="(d, index) in $md.diceHistory" v-show="index >= ($md.diceHistory.length - 1)"
                    class="list-group-item list-group-item-action text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <div @click="$roll(d.dice)">
                            <p class="mb-0 text-muted text-start">{{ d.dice }}</p>
                            <div class="d-flex align-items-center">
                                <div class="pe-3 text-center">
                                    <p class="fs-3 m-0 fw-bold" :class="d.total == d.max && 'text-success'">{{
                                        d.total }}</p>
                                    <p class="m-0 text-muted">total</p>
                                </div>
                                <div class="ps-3 border-start">
                                    <div class="d-flex">
                                        <p v-for="(single, i) in d.list" class="m-0 text-center px-1 ">
                                            <span v-if="i != 0">{{ i }}. </span><span v-for="v in single.list"
                                                class="dice m-1 border rounded border-primary text-primary">{{ v
                                                }}</span>
                                        </p>
                                    </div>
                                    <p class="m-0 text-muted text-center">({{ d.compText }})</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button @click="$md.diceHistory.splice(index, 1)" class="btn text-muted p-0"><i
                                    class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                </li>
                <li v-if="$md.diceHistory.length == 0" class="list-group-item text-white">
                    <p class="text-muted text-start m-0 py-2">...feeling lucky?</p>
                </li>
            </ul>
            <p class="border text-muted mb-2">終了行</p>
            <div class="text-start d-flex mb-2">
                <span v-for="quickroll in commandParser.quickrolls" class="border mx-1 px-2 quickroll" @click="$roll(quickroll)">{{ quickroll }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCommandStore } from '@/stores/commandStore';

const commandParser = useCommandStore();

</script>

<script>
export default {
    data() {
        return {
            diceInput: ''
        };
    },
    methods: {
        roll() {
            const command = this.diceInput.split(" ")[0]; // simple command parsing
            let args = this.diceInput.substring(this.diceInput.indexOf(" ") + 1);
            if (this.diceInput == "") {
                return;
            }

            if (this.diceInput == "clear") {
                this.$md.diceHistory.splice(0, this.$md.diceHistory.length);
                this.diceInput = "";
                return;
            }
            else {
                const roll = this.$md.Dice.x(this.diceInput);
                this.$md.diceHistory.push(roll);
                this.diceInput = "";
            }


        }
    }
}
</script>

<style lang="scss" scoped>
.dice {
    display: inline-block;
    text-align: center;
    min-width: 30px;
    font-size: large;
}

.quickroll{
    color: var(--bs-primary);
    border-color: var(--bs-primary) !important;
    cursor: pointer;
    user-select: none;
}

.quickroll:hover{
    color: white;
    border-color: white !important;
}
</style>