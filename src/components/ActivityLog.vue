<template>
    <div class="text-start">
        <div class="bg-secondary text-dark px-2">CONSOLE</div>
        <div style="height: 150px;" class="border border-secondary py-1 console">
            <span class="entry text-muted" v-if="$cyber.log.length === 0">> cyber log start</span>
            <div v-for="item in $cyber.log" :key="item.id">
                <span class="entry text-secondary">> {{ item.content }}</span>
            </div>
        </div>
    </div>
</template>

<script>
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
</style>
