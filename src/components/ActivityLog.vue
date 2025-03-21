<template>
    <div class="text-start">
        <div class="bg-secondary text-dark px-2">CONSOLE</div>
        <div style="height: 25vh; min-height: 150px;" class="border border-secondary py-1 console">
            <div v-if="$cyber.log.length === 0">
                <span class="entry text-muted">> cyber log start</span>
            </div>

            <div v-for="item in $cyber.log" :key="item.id">
                <span class="entry text-secondary">> {{ item.content }}</span>
            </div>
        </div>
        <div class="text-end text-secondary pt-1 processing" v-if="ai.thinking"><span class="load">|</span> AI Processing...</div>
    </div>
</template>

<script setup>
const ai = useAIStore();

</script>

<script>
import { useAIStore } from '@/stores/datafort';
import { nextTick } from 'vue';

export default {
    watch: {
        '$cyber.log': {
            handler() {
                nextTick(() => {
                    this.scroll();
                });
            },
            deep: true, // Watch for changes inside the array
        }
    },
    methods: {
        scroll() {
            const container = document.querySelector("div.console");
            container.scrollTo(0, container.scrollHeight);
        }
    }
}
</script>

<style lang="scss" scoped>
.entry {
    display: block;
    margin-left: 0.5rem;
    font-size: small;
}

.console {
    overflow: auto;
}

@keyframes loading {
    0% {
        text-shadow: 0px 0px 0px inherit;
    }

    100% {
        text-shadow: 0px 0px 15px cyan;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


.processing {
    font-size: small;
    text-transform: uppercase;
    animation: loading 2s ease infinite;
    animation-fill-mode: both;
    animation-direction: alternate;
}

.load {
    animation: spin 0.5s steps(5) infinite;
    display: inline-block;
    transform-origin: center;
    font-size: large;
    vertical-align: middle;
}
</style>
