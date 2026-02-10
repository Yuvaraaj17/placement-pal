<template>
    <div class="flex p-5 gap-5 w-full">
        <div class=" w-full max-h-1/5 flex flex-wrap gap-16">
            <div class="h-fit w-fit px-5 py-3 rounded-xs shadow-sm bg-cyan-50" @click="goTo('/admin/lab/skills')">
                <p class="text-2xl font-semibold">Manage Skills</p>
            </div>
            <div class="h-fit w-fit px-5 py-3 rounded-xs shadow-sm bg-cyan-50" @click="goTo('/admin/lab/skills')">
                <p class="text-2xl font-semibold">Manage Content</p>
            </div>

            <div class="h-fit w-fit px-5 py-3 rounded-xs shadow-sm bg-cyan-50" @click="goTo('/admin/lab/skills')">
                <p class="text-2xl font-semibold">Manage Users</p>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'page',
    middleware: 'auth'
})

const goTo = async (path : string)=>{
    await navigateTo(path)
}

</script>
