<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarClock, Download, FilePlus2, Pencil } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'page',
  middleware: 'auth',
})

const route = useRoute()
const isRootRoute = computed(() => route.path === '/resumevault')

interface ResumeListItem {
  _id: string
  title?: string
  createdAt?: string
  updatedAt?: string
}

const resumes = ref<ResumeListItem[]>([])
const isLoading = ref(true)

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

const fetchResumes = async () => {
  try {
    isLoading.value = true
    const response = await $fetch('/api/student/resume', {
      method: 'get',
    })
    if (response.statusCode !== 200) {
      toast.error(response.message || 'Failed to load resumes')
      resumes.value = []
      return
    }
    resumes.value = response.data || []
  } catch (error) {
    toast.error('Failed to load resumes')
    resumes.value = []
  } finally {
    isLoading.value = false
  }
}

const openEdit = (resumeId: string) => {
  navigateTo(`/resumevault/new?resumeId=${resumeId}`)
}

const openDownload = (resumeId: string) => {
  if (!process.client) return
  window.open(`/resumevault/print?resumeId=${resumeId}`, '_blank')
}

const createResume = () => {
  navigateTo('/resumevault/new')
}

onMounted(fetchResumes)
</script>

<template>
  <NuxtPage v-if="!isRootRoute" />

  <div v-else class="w-full space-y-6 p-6">
    <header class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Resume Vault</p>
        <h1 class="text-2xl font-semibold text-slate-900">Your resume versions</h1>
        <p class="text-sm text-slate-600">Create, edit, and download versions anytime.</p>
      </div>
    </header>

    <section v-if="isLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="index in 3" :key="index" class="animate-pulse border-dashed">
        <CardHeader>
          <div class="h-4 w-24 rounded bg-slate-200"></div>
          <div class="mt-2 h-3 w-32 rounded bg-slate-100"></div>
        </CardHeader>
        <CardContent>
          <div class="h-3 w-40 rounded bg-slate-100"></div>
        </CardContent>
      </Card>
    </section>

    <section v-else-if="!resumes.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        class="group flex aspect-[210/297] h-[200px] w-auto cursor-pointer items-center justify-center border-dashed bg-slate-50/70 transition hover:border-slate-300 hover:bg-white"
        @click="createResume"
      >
        <CardContent class="flex flex-col items-center gap-3 py-10 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <FilePlus2 class="h-6 w-6 text-slate-700" />
          </div>
          <p class="text-sm font-semibold text-slate-800">Create resume</p>
          <p class="text-xs text-slate-500">Start your first version</p>
        </CardContent>
      </Card>
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        class="group flex aspect-[210/297] h-[200px] w-auto cursor-pointer items-center justify-center border-dashed bg-slate-50/70 transition hover:border-slate-300 hover:bg-white"
        @click="createResume"
      >
        <CardContent class="flex flex-col items-center gap-3 py-10 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <FilePlus2 class="h-6 w-6 text-slate-700" />
          </div>
          <p class="text-sm font-semibold text-slate-800">Create resume</p>
          <p class="text-xs text-slate-500">Start a new version</p>
        </CardContent>
      </Card>
      <Card v-for="resume in resumes" :key="resume._id" class="flex h-full flex-col">
        <CardHeader>
          <CardTitle class="text-lg">
            {{ resume.title || 'Untitled Resume' }}
          </CardTitle>
          <CardDescription class="flex items-center gap-2 text-xs">
            <CalendarClock class="h-3.5 w-3.5" />
            Updated {{ formatDate(resume.updatedAt || resume.createdAt) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="text-sm text-slate-600">
          <p>Created {{ formatDate(resume.createdAt) }}</p>
        </CardContent>
        <CardFooter class="mt-auto flex gap-2">
          <Button variant="outline" class="flex-1 gap-2" @click="openEdit(resume._id)">
            <Pencil class="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" class="flex-1 gap-2" @click="openDownload(resume._id)">
            <Download class="h-4 w-4" />
            PDF
          </Button>
        </CardFooter>
      </Card>
    </section>
  </div>
</template>
