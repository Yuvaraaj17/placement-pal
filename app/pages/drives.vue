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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
  status: 'unseen' | 'seen' | 'willing' | 'not willing'
  driveUpdated?: boolean
  createdAt?: string
}

const token = useCookie('access_token').value
const decoded = token ? decodeJWT(token) : null
const userId = ref<string>(decoded?.user_id || '')

const isLoading = ref(false)
const isUpdating = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<'all' | 'unseen' | 'seen' | 'willing' | 'not willing'>('all')
const driveStatusFilter = ref<'all' | 'yet to start' | 'in progress' | 'completed'>('all')

const eligibility = ref<EligibilityDoc[]>([])
const selectedEligibility = ref<EligibilityDoc | null>(null)
const isViewOpen = ref(false)

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
  if (status === 'seen') return 'bg-slate-100 text-slate-700 border-slate-200'
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
    if (selectedEligibility.value?.driveId?._id === driveId) {
      selectedEligibility.value = { ...selectedEligibility.value, status: updated.status }
      isViewOpen.value = false
    }
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

const openDrive = (item: EligibilityDoc) => {
  selectedEligibility.value = item
  isViewOpen.value = true
  if (item.status === 'unseen' && item.driveId?._id) {
    markSeen(item.driveId._id)
  }
}

const closeDrive = () => {
  isViewOpen.value = false
  selectedEligibility.value = null
}

const markSeen = async (driveId: string) => {
  if (!userId.value) return
  try {
    const response = await $fetch<{ data: EligibilityDoc | null }>('/api/student/drive/seen', {
      method: 'post',
      body: { userId: userId.value, driveId },
    })
    if (response.data) {
      eligibility.value = eligibility.value.map((item) =>
        item.driveId && item.driveId._id === driveId
          ? { ...item, status: 'seen', driveUpdated: false }
          : item,
      )
      if (selectedEligibility.value?.driveId?._id === driveId) {
        selectedEligibility.value = {
          ...selectedEligibility.value,
          status: 'seen',
          driveUpdated: false,
        }
      }
    }
  } catch {
    // ignore mark seen failures
  }
}

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
            <SelectItem value="seen">Seen</SelectItem>
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

    <Dialog :open="isViewOpen" @update:open="(val) => (!val ? closeDrive() : null)">
      <DialogContent class="h-160 min-w-[75vw]">
        <div class="flex h-full flex-col">
          <DialogTitle class="mb-3">Drive Details</DialogTitle>
          <div v-if="selectedEligibility?.driveId" class="flex min-h-0 flex-1 flex-col gap-4">
            <div class="flex flex-col gap-2 border-b pb-3">
              <div class="text-lg font-semibold text-foreground">
                {{ selectedEligibility.driveId.company_name }}
              </div>
              <div class="text-sm text-muted-foreground">
                {{ selectedEligibility.driveId.job_title }} -
                {{ selectedEligibility.driveId.venue || 'Venue TBD' }}
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  class="rounded-full border px-3 py-1 text-xs font-medium"
                  :class="statusBadgeClasses(selectedEligibility.status)"
                >
                  {{ selectedEligibility.status }}
                </span>
                <span
                  v-if="selectedEligibility.status === 'unseen' && !selectedEligibility.driveUpdated"
                  class="rounded-full border px-3 py-1 text-xs font-medium bg-sky-50 text-sky-700 border-sky-200"
                >
                  New
                </span>
                <span
                  v-if="selectedEligibility.driveUpdated"
                  class="rounded-full border px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200"
                >
                  Drive Updated
                </span>
                <span
                  class="rounded-full border px-3 py-1 text-xs font-medium"
                  :class="driveStatusClasses(selectedEligibility.driveId.driveStatus)"
                >
                  {{ selectedEligibility.driveId.driveStatus || 'yet to start' }}
                </span>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto text-sm text-muted-foreground">
              <div class="grid gap-4 lg:grid-cols-4">
                <div class="space-y-2 lg:col-span-3">
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">
                    About the role
                  </div>
                  <p v-if="selectedEligibility.driveId.job_description" class="whitespace-pre-line">
                    {{ selectedEligibility.driveId.job_description }}
                  </p>
                  <p v-else>No description provided.</p>
                </div>
                <div class="space-y-2 lg:col-span-1">
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">Details</div>
                  <div class="space-y-2">
                    <div>Drive Date: {{ formatDate(selectedEligibility.driveId.date_of_drive) }}</div>
                    <div>CGPA Cutoff: {{ selectedEligibility.driveId.required_cgpa ?? 'N/A' }}</div>
                    <div>
                      Expected Compensation:
                      {{
                        selectedEligibility.driveId.expected_compensation
                          ? `${selectedEligibility.driveId.expected_compensation} LPA`
                          : 'N/A'
                      }}
                    </div>
                    <div>
                      Company Website:
                      {{ selectedEligibility.driveId.company_website || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-2 border-t pt-3">
              <Button
                :disabled="
                  isUpdating === selectedEligibility.driveId._id ||
                  selectedEligibility.status === 'willing'
                "
                @click="
                  selectedEligibility?.driveId &&
                    respondToDrive(selectedEligibility.driveId._id, 'willing')
                "
              >
                <span v-if="isUpdating !== selectedEligibility.driveId._id">I'm Interested</span>
                <span v-else class="flex items-center gap-2"> <Spinner /> Updating </span>
              </Button>
              <Button
                variant="outline"
                :disabled="
                  isUpdating === selectedEligibility.driveId._id ||
                  selectedEligibility.status === 'not willing'
                "
                @click="
                  selectedEligibility?.driveId &&
                    respondToDrive(selectedEligibility.driveId._id, 'not willing')
                "
              >
                Not Interested
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <div v-if="!isLoading" class="grid h-full gap-4 overflow-y-scroll">
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
              v-if="item.status === 'unseen' && !item.driveUpdated"
              class="rounded-full border px-3 py-1 text-xs font-medium bg-sky-50 text-sky-700 border-sky-200"
            >
              New
            </span>
            <span
              v-if="item.driveUpdated"
              class="rounded-full border px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200"
            >
              Drive Updated
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
          <Button variant="outline" @click="openDrive(item)">View</Button>
        </CardFooter>
      </Card>
    </div>
  </section>
</template>
