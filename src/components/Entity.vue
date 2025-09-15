<template>
	<div class="row align-items-center text-start">
		<div class="col-auto">
			<span class="text-muted">ID:</span> {{ entityKey }}
		</div>
		<div class="col">
			<div class="d-flex justify-content-between mt-1">
				<!-- Left side -->
				<div>
					<span>[ status: {{ getStatus(entity) }} ] </span>
					<div class="fw-bold text-uppercase">{{ entity.name }}</div>

					<div v-if="entity.notes.length > 0" class="text-muted">
						notes: {{ JSON.stringify(entity.notes) }}
					</div>
				</div>
				<!-- Right side -->
				<div class="text-end ms-1">
					<div><span class="text-muted">HP:</span> {{ entity.currentHP }} / {{ entity.maxHP }} ({{
						percentage(entity) }}%) <span class="text-muted">AC:</span> {{ entity.ac }}</div>
					<div v-if="entity.inv.length > 0">
						<span class="text-muted">equipment:</span> {{ entity.inv.join(", ") }}
					</div>
					<div v-if="entity.friendly" class="text-secondary friendly">// FRIENDLY</div>
				</div>
			</div>
			<div class="mt-1" style="overflow: hidden;"
				:style="'visibility:' + (shouldDisplay(percentage(entity)) ? 'visible' : 'hidden') + ';'">
				<div class="bg-secondary bar" :style="'width: ' + percentage(entity) + '%;'" style="height: 1px;">
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
const percentage = (entity) => {
	return (entity.currentHP / entity.maxHP * 100).toFixed(0);
}

const getStatus = (entity) => {
	return (entity.currentHP <= 0 ? 'neutralized' : 'alive');
}

const shouldDisplay = (percentage) => {
	if (percentage < 100 && percentage > 0) {
		return true;
	} else {
		return false;
	}
}

</script>

<script>

export default {
	props: {
		entity: Object,
		entityKey: String
	}
}
</script>

<style lang="scss" scoped>
.bar {
	transition: 1s ease-out;
}

.friendly{
	font-size: 0.8rem;
}
</style>