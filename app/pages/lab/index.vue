<script setup>
import { Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'page',
})
</script>

<template>
  <div class="mt-20 ml-20 grid">
    <Card class="h-40 max-w-2xl min-w-32 items-center justify-center rounded-none">
      <CardContent>
        <NuxtLink to="/lab/resume/new">
          <Plus size="36" class="text-gray-900" />
        </NuxtLink>
      </CardContent>
    </Card>
    <!-- Other cards need to added -->
  </div>
</template>
