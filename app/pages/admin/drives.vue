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
import { PenLine, CalendarIcon, Search } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateFormatter, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { cn } from '@/lib/utils'

import { toast } from 'vue-sonner'

const defaultPlaceholder = today(getLocalTimeZone())

// just a ref, no types
const isDialogOpen = ref(false)

const isSubmitting = ref(false)
const isRegistered = ref(false)
const isLoading = ref(false)
const search = ref('')
const driveStatusFilter = ref<'all' | 'yet to start' | 'in progress' | 'completed'>('all')
const isEditDialogOpen = ref(false)
const isEditSubmitting = ref(false)
const editDriveId = ref<string | null>(null)

// const formState = computed(() => {
//   if (isRegistered.value) return 'registered'
//   if (isSubmitting.value) return 'registering'

//   const values = Object.values(form.value)
//   const filledCount = values.filter(v => v.trim() !== '').length
//   const allFilled = values.every(v => v.trim() !== '')

//   if (filledCount === 0) return 'empty'
//   if (allFilled) return 'filled'
//   return 'partiallyFilled'
// })

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const driveForm = ref({
  company_name: '',
  company_website: '',
  job_title: '',
  job_description: '',
  expected_compensation: 0,
  departments: {
    cse: false,
    ece: false,
    eee: false,
    mech: false,
  },
  required_cgpa: 7.5,
  venue: '',
  date_of_drive: today(getLocalTimeZone()),
})

const emptyDepartments = {
  cse: false,
  ece: false,
  eee: false,
  mech: false,
}

const editForm = ref({
  company_name: '',
  company_website: '',
  job_title: '',
  job_description: '',
  expected_compensation: 0,
  departments: { ...emptyDepartments },
  required_cgpa: 7.5,
  venue: '',
  date_of_drive: today(getLocalTimeZone()),
})

const editOriginalSnapshot = ref('')

const resetDriveForm = () => {
  driveForm.value = {
    company_name: '',
    company_website: '',
    job_title: '',
    job_description: '',
    expected_compensation: 0,
    departments: {
      cse: false,
      ece: false,
      eee: false,
      mech: false,
    },
    required_cgpa: 7.5,
    venue: '',
    date_of_drive: today(getLocalTimeZone()),
  }
  isSubmitting.value = false
  isRegistered.value = false
}

const resetEditForm = () => {
  editForm.value = {
    company_name: '',
    company_website: '',
    job_title: '',
    job_description: '',
    expected_compensation: 0,
    departments: { ...emptyDepartments },
    required_cgpa: 7.5,
    venue: '',
    date_of_drive: today(getLocalTimeZone()),
  }
  editDriveId.value = null
  isEditSubmitting.value = false
  editOriginalSnapshot.value = ''
}

const confirmAction = (message: string) => {
  if (!import.meta.client) return true
  return window.confirm(message)
}

const toCalendarDate = (value?: string) => {
  if (!value) return today(getLocalTimeZone())
  const iso = value.includes('T') ? value.split('T')[0] : value
  return parseDate(iso)
}

const getEditSnapshot = () =>
  JSON.stringify({
    company_website: editForm.value.company_website,
    job_title: editForm.value.job_title,
    job_description: editForm.value.job_description,
    expected_compensation: editForm.value.expected_compensation,
    departments: editForm.value.departments,
    required_cgpa: editForm.value.required_cgpa,
    venue: editForm.value.venue,
    date_of_drive: editForm.value.date_of_drive?.toString(),
  })

const isEditDirty = () => editOriginalSnapshot.value !== getEditSnapshot()

const openEditDialog = (drive: DriveDoc) => {
  editDriveId.value = drive._id
  editForm.value = {
    company_name: drive.company_name || '',
    company_website: drive.company_website || '',
    job_title: drive.job_title || '',
    job_description: drive.job_description || '',
    expected_compensation: drive.expected_compensation ?? 0,
    departments: { ...emptyDepartments, ...(drive.departments || {}) },
    required_cgpa: drive.required_cgpa ?? 7.5,
    venue: drive.venue || '',
    date_of_drive: toCalendarDate(drive.date_of_drive),
  }
  editOriginalSnapshot.value = getEditSnapshot()
  isEditDialogOpen.value = true
}

const handleEditDialogOpenChange = (val: boolean) => {
  if (!val && isEditDirty()) {
    if (!confirmAction('Discard your changes?')) return
  }
  isEditDialogOpen.value = val
  if (!val) resetEditForm()
}

type RegisterDriveRes = { statusCode: number; message: string }

const registerDriveForm = async () => {
  isSubmitting.value = true
  const payload = {
    ...driveForm.value,
    // If date_of_drive exists, convert it.
    // If it's missing (null/undefined), generate "today" on the fly.
    date_of_drive: driveForm.value.date_of_drive
      ? driveForm.value.date_of_drive.toDate(getLocalTimeZone())
      : today(getLocalTimeZone()).toDate(getLocalTimeZone()),
  }

  toast.promise(
    $fetch<RegisterDriveRes>('/api/admin/drive/register', {
      method: 'post',
      body: payload,
    }),
    {
      loading: 'Registering the drive...',
      success: (data: { message: string }) => {
        isSubmitting.value = false
        isDialogOpen.value = false
        loadDrives()
        return data.message || 'Drive registered successfully!'
      },
      error: (err: { data: { message: string }; message: string }) => {
        isSubmitting.value = false
        return err.data?.message || err.message || 'Failed to register drive'
      },
      finally: () => {
        isSubmitting.value = false
      },
    },
  )
}

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
  eligibleCount?: number
  respondedCount?: number
}

const drives = ref<DriveDoc[]>([])

type DriveRes = { statusCode: number; message: string; data: DriveDoc[] }

const loadDrives = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<DriveRes>('/api/admin/drive/drives' as string, {
      method: 'get',
    })

    drives.value = response.data || []
  } catch (err: unknown) {
    if (err instanceof Error) toast.error(err?.message || 'Failed to fetch drives')
  } finally {
    isLoading.value = false
  }
}

type UpdateDriveRes = { statusCode: number; message: string }

const updateDriveForm = async () => {
  if (!editDriveId.value) return
  if (!confirmAction('Save changes to this drive?')) return

  isEditSubmitting.value = true
  const payload = {
    driveId: editDriveId.value,
    company_website: editForm.value.company_website,
    job_title: editForm.value.job_title,
    job_description: editForm.value.job_description,
    expected_compensation: editForm.value.expected_compensation,
    departments: editForm.value.departments,
    required_cgpa: editForm.value.required_cgpa,
    venue: editForm.value.venue,
    date_of_drive: editForm.value.date_of_drive
      ? editForm.value.date_of_drive.toDate(getLocalTimeZone())
      : null,
  }

  try {
    const response = await $fetch<UpdateDriveRes>('/api/admin/drive/update' as string, {
      method: 'post',
      body: payload,
    })
    toast.success(response.message || 'Drive updated')
    isEditDialogOpen.value = false
    resetEditForm()
    loadDrives()
  } catch (err: unknown) {
    if (err instanceof Error) toast.error(err.message || 'Failed to update drive')
  } finally {
    isEditSubmitting.value = false
  }
}

const formatDate = (value?: string) => {
  if (!value) return 'TBD'
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return 'TBD'
  }
}

const driveStatusClasses = (status?: DriveDoc['driveStatus']) => {
  if (status === 'completed') return 'bg-slate-100 text-slate-700 border-slate-200'
  if (status === 'in progress') return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

const totalDrives = computed(() => drives.value.length)
const totalEligible = computed(() =>
  drives.value.reduce((sum, drive) => sum + (drive.eligibleCount ?? 0), 0),
)
const totalResponded = computed(() =>
  drives.value.reduce((sum, drive) => sum + (drive.respondedCount ?? 0), 0),
)
const responseRate = computed(() => {
  if (totalEligible.value === 0) return 0
  return Math.round((totalResponded.value / totalEligible.value) * 100)
})

const metricArc = (value: number, max: number) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75
  const ratio = max > 0 ? Math.min(value / max, 1) : 0
  const filled = arcLength * ratio
  return {
    radius,
    arcLength,
    dasharray: `${filled} ${arcLength}`,
  }
}

const metricCircle = (value: number, max: number) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const ratio = max > 0 ? Math.min(value / max, 1) : 0
  const filled = circumference * ratio
  return {
    radius,
    circumference,
    dasharray: `${filled} ${circumference}`,
  }
}

const filteredDrives = computed(() => {
  const query = search.value.trim().toLowerCase()
  return drives.value.filter((drive) => {
    if (driveStatusFilter.value !== 'all' && drive.driveStatus !== driveStatusFilter.value) {
      return false
    }

    if (!query) return true

    const haystack = [drive.company_name, drive.job_title, drive.job_description, drive.venue]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
})

watch(isDialogOpen, (open) => {
  if (!open) {
    resetDriveForm()
  }
})

definePageMeta({
  layout: 'page',
})

onMounted(() => {
  loadDrives()
})
</script>
<template>
  <div class="flex w-full flex-col gap-5 p-5">
    <div class="grid w-full gap-4 rounded-xl border bg-white p-5 lg:grid-cols-3">
      <div class="flex items-center gap-4">
        <div class="relative h-24 w-24">
          <svg class="h-24 w-24">
            <circle
              class="stroke-emerald-500"
              :r="metricArc(totalDrives, Math.max(totalDrives, 1)).radius"
              cx="48"
              cy="48"
              fill="transparent"
              stroke-width="8"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-xl font-semibold">{{ totalDrives }}</div>
            <div class="text-xs text-muted-foreground">Drives</div>
          </div>
        </div>
        <div>
          <div class="text-sm text-muted-foreground">Total Drives</div>
          <div class="text-lg font-semibold">All time</div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative h-24 w-24">
          <svg class="h-24 w-24 -rotate-90">
            <circle
              class="stroke-slate-100"
              :r="metricCircle(100, 100).radius"
              cx="48"
              cy="48"
              fill="transparent"
              stroke-width="8"
            />
            <circle
              class="stroke-amber-500"
              :r="metricCircle(totalEligible, Math.max(totalDrives, 1)).radius"
              cx="48"
              cy="48"
              fill="transparent"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="metricCircle(totalEligible, Math.max(totalDrives, 1)).dasharray"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div class="text-lg font-semibold">
              {{ totalEligible }} / {{ totalDrives }}
            </div>
            <div class="text-xs text-muted-foreground">Eligible</div>
          </div>
        </div>
        <div>
          <div class="text-sm text-muted-foreground">Eligible Students</div>
          <div class="text-lg font-semibold">Across drives</div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative h-24 w-24">
          <svg class="h-24 w-24 -rotate-90">
            <circle
              class="stroke-slate-100"
              :r="metricCircle(100, 100).radius"
              cx="48"
              cy="48"
              fill="transparent"
              stroke-width="8"
            />
            <circle
              class="stroke-blue-500"
              :r="metricCircle(responseRate, 100).radius"
              cx="48"
              cy="48"
              fill="transparent"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="metricCircle(responseRate, 100).dasharray"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div class="text-lg font-semibold">{{ responseRate }}%</div>
            <div class="text-xs text-muted-foreground">
              {{ totalResponded }} / {{ totalEligible }}
            </div>
          </div>
        </div>
        <div>
          <div class="text-sm text-muted-foreground">Response Rate</div>
          <div class="text-lg font-semibold">
            {{ totalResponded }} / {{ totalEligible }}
          </div>
        </div>
      </div>
    </div>

    <Dialog :open="isEditDialogOpen" @update:open="handleEditDialogOpenChange">
      <DialogContent
        class="max-h-11/12 max-w-4xl min-w-4/5 overflow-y-scroll"
        @interact-outside="(e) => isEditSubmitting && e.preventDefault()"
        @escape-key-down="(e) => isEditSubmitting && e.preventDefault()"
      >
        <DialogTitle>Edit Drive</DialogTitle>
        <div class="flex flex-row gap-5">
          <Field>
            <FieldLabel>Company Name</FieldLabel>
            <Input v-model="editForm.company_name" :disabled="true" />
          </Field>
          <Field>
            <FieldLabel>Company Website</FieldLabel>
            <Input v-model="editForm.company_website" placeholder="URL of Website" :disabled="isEditSubmitting" />
          </Field>
        </div>
        <Field>
          <FieldLabel>Job Title</FieldLabel>
          <Input
            v-model="editForm.job_title"
            placeholder="Ex: Software Engineer, Graduate Trainee"
            :disabled="isEditSubmitting"
          />
        </Field>
        <Field>
          <FieldLabel>Job Description</FieldLabel>
          <textarea
            v-model="editForm.job_description"
            placeholder="Job description..."
            type="textbox"
            class="h-56 resize-none rounded-sm border placeholder:p-2"
            :disabled="isEditSubmitting"
          />
        </Field>
        <Field>
          <FieldLabel>Expected Compensation (in LPA)</FieldLabel>
          <Input
            v-model="editForm.expected_compensation"
            placeholder="Compensation"
            type="number"
            :disabled="isEditSubmitting"
          />
        </Field>
        <div class="flex flex-row items-center justify-between">
          <Field>
            <FieldLabel>Department</FieldLabel>
            <FieldContent>
              <div class="flex flex-row gap-5">
                <div class="flex flex-row items-center justify-center gap-3">
                  <Label for="edit-cse">CSE</Label>
                  <Checkbox id="edit-cse" v-model="editForm.departments.cse" :disabled="isEditSubmitting" />
                </div>
                <div class="flex flex-row items-center justify-center gap-3">
                  <Label for="edit-ece">ECE</Label>
                  <Checkbox id="edit-ece" v-model="editForm.departments.ece" :disabled="isEditSubmitting" />
                </div>
                <div class="flex flex-row items-center justify-center gap-3">
                  <Label for="edit-eee">EEE</Label>
                  <Checkbox id="edit-eee" v-model="editForm.departments.eee" :disabled="isEditSubmitting" />
                </div>
                <div class="flex flex-row items-center justify-center gap-3">
                  <Label for="edit-mech">MECH</Label>
                  <Checkbox id="edit-mech" v-model="editForm.departments.mech" :disabled="isEditSubmitting" />
                </div>
              </div>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>CGPA Cutoff</FieldLabel>
            <Input v-model="editForm.required_cgpa" type="number" placeholder="CGPA" :disabled="isEditSubmitting" />
          </Field>
        </div>

        <div class="flex flex-row items-center justify-between gap-7">
          <Field>
            <FieldLabel>Venue/Mode:</FieldLabel>
            <Input v-model="editForm.venue" placeholder="Hall No/Virtual" :disabled="isEditSubmitting" />
          </Field>
          <Field>
            <FieldLabel> Drive Date: </FieldLabel>
            <FieldContent>
              <Popover v-slot="{ close }">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    :class="cn('justify-start text-left font-normal', !editForm.date_of_drive && 'text-muted-foreground')"
                    :disabled="isEditSubmitting"
                  >
                    <CalendarIcon />
                    {{
                      editForm.date_of_drive
                        ? df.format(editForm.date_of_drive.toDate(getLocalTimeZone()))
                        : 'Pick a date'
                    }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar
                    v-model="editForm.date_of_drive"
                    :default-placeholder="defaultPlaceholder"
                    layout="month-and-year"
                    :min-value="today(getLocalTimeZone())"
                    initial-focus
                    :disabled="isEditSubmitting"
                    @update:model-value="close"
                  />
                </PopoverContent>
              </Popover>
            </FieldContent>
          </Field>
        </div>

        <div class="flex flex-row justify-end gap-7">
          <Button variant="outline" :disabled="isEditSubmitting" @click="handleEditDialogOpenChange(false)">
            Cancel
          </Button>
          <Button :disabled="isEditSubmitting" @click="updateDriveForm"> Save </Button>
        </div>
      </DialogContent>
    </Dialog>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="flex w-full items-center gap-2 rounded-md border px-3 py-2">
        <Search class="text-muted-foreground h-4 w-4" />
        <input
          v-model="search"
          class="w-full bg-transparent text-sm outline-none"
          placeholder="Search by company, role, venue..."
        />
      </div>

      <div class="flex w-full flex-col lg:flex-row lg:gap-3">
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
        <Dialog :open="isDialogOpen" @update:open="
          (val) => {
            if (isSubmitting) return
            isDialogOpen = val
          }
        ">
          <DialogTrigger
            class="flex flex-row items-center justify-center gap-3 rounded-sm bg-black px-4 py-2 text-sm text-white">
            <span>Register Drive</span>
            <PenLine :size="12" />
          </DialogTrigger>
          <DialogContent class="max-h-11/12 max-w-4xl min-w-4/5 overflow-y-scroll"
            @interact-outside="(e) => isSubmitting && e.preventDefault()"
            @escape-key-down="(e) => isSubmitting && e.preventDefault()">
            <DialogTitle>Drive Details</DialogTitle>
            <div class="flex flex-row gap-5">
              <Field>
                <FieldLabel>Company Name</FieldLabel>
                <Input v-model="driveForm.company_name" placeholder="Recruiter" :disabled="isSubmitting" />
              </Field>
              <Field>
                <FieldLabel>Company Website</FieldLabel>
                <Input v-model="driveForm.company_website" placeholder="URL of Website" :disabled="isSubmitting" />
              </Field>
            </div>
            <Field>
              <FieldLabel>Job Title</FieldLabel>
              <Input v-model="driveForm.job_title" placeholder="Ex: Software Engineer, Graduate Trainee"
                :disabled="isSubmitting" />
            </Field>
            <Field>
              <FieldLabel>Job Description</FieldLabel>
              <textarea v-model="driveForm.job_description" placeholder="Job escription..." type="textbox"
                class="h-56 resize-none rounded-sm border placeholder:p-2" :disabled="isSubmitting" />
            </Field>
            <Field>
              <FieldLabel>Expected Compensation (in LPA)</FieldLabel>
              <Input v-model="driveForm.expected_compensation" placeholder="Compensation" type="number"
                :disabled="isSubmitting" />
            </Field>
            <div class="flex flex-row items-center justify-between">
              <Field>
                <FieldLabel>Department</FieldLabel>
                <FieldContent>
                  <div class="flex flex-row gap-5">
                    <div class="flex flex-row items-center justify-center gap-3">
                      <Label for="cse">CSE</Label>
                      <Checkbox id="cse" v-model="driveForm.departments.cse" :disabled="isSubmitting" />
                    </div>
                    <div class="flex flex-row items-center justify-center gap-3">
                      <Label for="ece">ECE</Label>
                      <Checkbox id="ece" v-model="driveForm.departments.ece" :disabled="isSubmitting" />
                    </div>
                    <div class="flex flex-row items-center justify-center gap-3">
                      <Label for="eee">EEE</Label>
                      <Checkbox id="eee" v-model="driveForm.departments.eee" :disabled="isSubmitting" />
                    </div>
                    <div class="flex flex-row items-center justify-center gap-3">
                      <Label for="mech">MECH</Label>
                      <Checkbox id="mech" v-model="driveForm.departments.mech" :disabled="isSubmitting" />
                    </div>
                  </div>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>CGPA Cutoff</FieldLabel>
                <Input v-model="driveForm.required_cgpa" type="number" placeholder="CGPA" :disabled="isSubmitting" />
              </Field>
            </div>

            <div class="flex flex-row items-center justify-between gap-7">
              <Field>
                <FieldLabel>Venue/Mode:</FieldLabel>
                <Input v-model="driveForm.venue" placeholder="Hall No/Virtual" :disabled="isSubmitting" />
              </Field>
              <Field>
                <FieldLabel> Drive Date: </FieldLabel>
                <FieldContent>
                  <Popover v-slot="{ close }">
                    <PopoverTrigger as-child>
                      <Button variant="outline" :class="cn(
                        'justify-start text-left font-normal',
                        !driveForm.date_of_drive && 'text-muted-foreground',
                      )
                        " :disabled="isSubmitting">
                        <CalendarIcon />
                        {{
                          driveForm.date_of_drive
                            ? df.format(driveForm.date_of_drive.toDate(getLocalTimeZone()))
                            : 'Pick a date'
                        }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0" align="start">
                      <Calendar v-model="driveForm.date_of_drive" :default-placeholder="defaultPlaceholder"
                        layout="month-and-year" :min-value="today(getLocalTimeZone())" initial-focus
                        :disabled="isSubmitting" @update:model-value="close" />
                    </PopoverContent>
                  </Popover>
                </FieldContent>
              </Field>
            </div>

            <div class="flex flex-row justify-end gap-7">
              <Button variant="outline" :disabled="isSubmitting" @click="resetDriveForm">
                Clear
              </Button>
              <Button :disabled="isSubmitting" @click="registerDriveForm"> Register </Button>
              <!-- <Button>Mark as Draft</Button> To Be implemented  -->
            </div>
          </DialogContent>
        </Dialog>
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

    <div v-else class="grid h-full gap-4 overflow-y-scroll">
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
            <CardTitle class="text-xl">{{ item.company_name }}</CardTitle>
            <CardDescription class="text-sm">
              {{ item.job_title }} - {{ item.venue || 'Venue TBD' }}
            </CardDescription>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              class="rounded-full border px-3 py-1 text-xs font-medium"
              :class="driveStatusClasses(item.driveStatus)"
            >
              {{ item.driveStatus || 'yet to start' }}
            </span>
            <span
              class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
            >
              Eligible: {{ item.eligibleCount ?? 0 }}
            </span>
            <span
              class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
            >
              Responded: {{ item.respondedCount ?? 0 }}
            </span>
          </div>
        </CardHeader>
        <CardContent class="text-muted-foreground space-y-3 text-sm flex flex-row justify-between items-center">
          <div>
            <p v-if="item.job_description">{{ item.job_description }}</p>
            <div class="flex flex-wrap gap-4">
              <span>Drive Date: {{ formatDate(item.date_of_drive) }}</span>
              <span>CGPA Cutoff: {{ item.required_cgpa ?? 'N/A' }}</span>
              <span>
                Expected Compensation:
                {{ item.expected_compensation ? `${item.expected_compensation} LPA` : 'N/A' }}
              </span>
            </div>
          </div>
          <Button variant="outline" @click="openEditDialog(item)">Edit</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
