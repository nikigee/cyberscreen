<template>
    <div class="p-1 text-secondary frame">
        <div class="wrapper">
            <span class="v">オペレーションシステム: タスク進行中...</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.frame {
    perspective: 1000px;
}

@keyframes bars {
    0% {
        width: 0px;
    }
    100% {
        width: 100%;
    }
}

.v {
    font-size: large;
}

.wrapper{
    animation-name: bars;
    animation-duration: 2s;
    animation-delay: 0.5s;
    animation-fill-mode: backwards;
    animation-iteration-count: infinite;
    overflow: hidden;
    text-wrap: nowrap;
}
</style>