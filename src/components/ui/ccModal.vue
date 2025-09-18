<template>
    <div class="modal fade" :id="props.idd" tabindex="-1" :aria-labelledby="props.idd + 'Label'">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" :id="props.idd + 'Label'">{{ props.title }}</h1>
                    <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                </div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['title', 'idd']);


</script>

<style lang="css">
.modal-footer{
    border-top: 0px;
}

</style>