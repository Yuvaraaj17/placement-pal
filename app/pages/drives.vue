<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Calendar, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { decodeJWT } from '@/utils/jwt'

definePageMeta({
  layout: 'page',
  middleware: 'auth',
})

type DriveDoc = {
  _id: string
  company_name: string
  company_website?: string
  job_title: string
  job_description?: string
  expected_compensation?: number
  departments?: Record<string, boolean>
  required_cgpa?: number
  venue?: string
  date_of_drive?: string
  driveStatus?: 'yet to start' | 'in progress' | 'completed'
}

type EligibilityDoc = {
  _id: string
  studentUserId: string
  driveId: DriveDoc | null
  status: 'unseen' | 'willing' | 'not willing'
  createdAt?: string
}

const token = useCookie('access_token').value
const decoded = token ? decodeJWT(token) : null
const userId = ref<string>(decoded?.user_id || '')

const isLoading = ref(false)
const isUpdating = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<'all' | 'unseen' | 'willing' | 'not willing'>('all')
const driveStatusFilter = ref<'all' | 'yet to start' | 'in progress' | 'completed'>('all')

const eligibility = ref<EligibilityDoc[]>([])

const formatDate = (value?: string) => {
  if (!value) return 'TBD'
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return 'TBD'
  }
}

const statusBadgeClasses = (status: EligibilityDoc['status']) => {
  if (status === 'willing') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'not willing') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const driveStatusClasses = (status?: DriveDoc['driveStatus']) => {
  if (status === 'completed') return 'bg-slate-100 text-slate-700 border-slate-200'
  if (status === 'in progress') return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

const loadEligibleDrives = async () => {
  if (!userId.value) {
    toast.error('Unable to identify the logged-in user.')
    return
  }

  isLoading.value = true
  try {
    const response = await $fetch<{ data: EligibilityDoc[] }>('/api/student/drive/eligible', {
      method: 'post',
      body: {
        userId: userId.value,
      },
    })
    eligibility.value = response.data || []
  } catch (err: unknown) {
    if (err instanceof Error) toast.error(err?.message || 'Failed to fetch drives')
  } finally {
    isLoading.value = false
  }
}

const respondToDrive = async (driveId: string, status: 'willing' | 'not willing') => {
  if (!userId.value) {
    toast.error('Unable to identify the logged-in user.')
    return
  }

  isUpdating.value = driveId
  try {
    const response = await $fetch<{ data: EligibilityDoc }>('/api/student/drive/respond', {
      method: 'post',
      body: {
        userId: userId.value,
        driveId,
        status,
      },
    })
    const updated = response.data
    eligibility.value = eligibility.value.map((item) =>
      item.driveId && item.driveId._id === driveId ? { ...item, status: updated.status } : item,
    )
    toast.success('Response updated.')
  } catch (err: unknown) {
    if (err instanceof Error) toast.error(err?.message || 'Failed to update response')
  } finally {
    isUpdating.value = null
  }
}

const filteredDrives = computed(() => {
  const query = search.value.trim().toLowerCase()
  return eligibility.value.filter((item) => {
    if (!item.driveId) return false

    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (driveStatusFilter.value !== 'all' && item.driveId.driveStatus !== driveStatusFilter.value)
      return false

    if (!query) return true

    const haystack = [
      item.driveId.company_name,
      item.driveId.job_title,
      item.driveId.job_description,
      item.driveId.venue,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
})

onMounted(() => {
  loadEligibleDrives()
})
</script>

<template>
  <section class="flex w-full flex-col gap-6 p-5">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 text-2xl font-semibold">
        <Calendar class="h-6 w-6" />
        <span>Placement Drives</span>
      </div>
      <p class="text-muted-foreground text-sm">
        Review your eligible drives and respond to the ones you want to attend.
      </p>
    </div>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="flex w-full items-center gap-2 rounded-md border px-3 py-2">
        <Search class="text-muted-foreground h-4 w-4" />
        <input
          v-model="search"
          class="w-full bg-transparent text-sm outline-none"
          placeholder="Search by company, role, venue..."
        />
      </div>

      <div class="flex w-full flex-col gap-2 sm:flex-row">
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full sm:w-56">
            <SelectValue placeholder="Eligibility status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unseen">Unseen</SelectItem>
            <SelectItem value="willing">Willing</SelectItem>
            <SelectItem value="not willing">Not willing</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="driveStatusFilter">
          <SelectTrigger class="w-full sm:w-56">
            <SelectValue placeholder="Drive status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All drives</SelectItem>
            <SelectItem value="yet to start">Yet to start</SelectItem>
            <SelectItem value="in progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Separator />

    <div v-if="isLoading" class="grid gap-4">
      <Card v-for="n in 3" :key="n">
        <CardHeader>
          <Skeleton class="h-5 w-48" />
          <Skeleton class="mt-2 h-4 w-32" />
        </CardHeader>
        <CardContent class="space-y-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-2/3" />
        </CardContent>
        <CardFooter class="flex gap-2">
          <Skeleton class="h-9 w-24" />
          <Skeleton class="h-9 w-24" />
        </CardFooter>
      </Card>
    </div>

    <div v-else class="grid h-full gap-4 overflow-y-scroll bg-red-100">
      <Card v-if="filteredDrives.length === 0">
        <CardHeader>
          <CardTitle class="text-lg">No drives found</CardTitle>
          <CardDescription>
            Try updating your filters or check back later for new drives.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card v-for="item in filteredDrives" :key="item._id" class="h-fit border-slate-200">
        <CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle class="text-xl">{{ item.driveId?.company_name }}</CardTitle>
            <CardDescription class="text-sm">
              {{ item.driveId?.job_title }} - {{ item.driveId?.venue || 'Venue TBD' }}
            </CardDescription>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              class="rounded-full border px-3 py-1 text-xs font-medium"
              :class="statusBadgeClasses(item.status)"
            >
              {{ item.status }}
            </span>
            <span
              class="rounded-full border px-3 py-1 text-xs font-medium"
              :class="driveStatusClasses(item.driveId?.driveStatus)"
            >
              {{ item.driveId?.driveStatus || 'yet to start' }}
            </span>
          </div>
        </CardHeader>
        <CardContent class="text-muted-foreground space-y-3 text-sm">
          <p v-if="item.driveId?.job_description">{{ item.driveId?.job_description }}</p>
          <div class="flex flex-wrap gap-4">
            <span>Drive Date: {{ formatDate(item.driveId?.date_of_drive) }}</span>
            <span>CGPA Cutoff: {{ item.driveId?.required_cgpa ?? 'N/A' }}</span>
            <span>
              Expected Compensation:
              {{
                item.driveId?.expected_compensation
                  ? `${item.driveId?.expected_compensation} LPA`
                  : 'N/A'
              }}
            </span>
          </div>
        </CardContent>
        <CardFooter class="flex flex-wrap gap-2">
          <Button
            :disabled="isUpdating === item.driveId?._id || item.status === 'willing'"
            @click="item.driveId && respondToDrive(item.driveId._id, 'willing')"
          >
            <span v-if="isUpdating !== item.driveId?._id">I'm Interested</span>
            <span v-else class="flex items-center gap-2"> <Spinner /> Updating </span>
          </Button>
          <Button
            variant="outline"
            :disabled="isUpdating === item.driveId?._id || item.status === 'not willing'"
            @click="item.driveId && respondToDrive(item.driveId._id, 'not willing')"
          >
            Not Interested
          </Button>
        </CardFooter>
      </Card>
    </div>
  </section>
</template>
