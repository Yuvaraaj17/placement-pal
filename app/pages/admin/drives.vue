<script setup>
import { Button } from '@/components/ui/button'
import { PenLine, CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { cn } from '@/lib/utils'

import { toast } from 'vue-sonner'

const defaultPlaceholder = today(getLocalTimeZone())

// just a ref, no types
const isDialogOpen = ref(false)

const isSubmitting = ref(false)
const isRegistered = ref(false)

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

const registerDriveForm = async () => {
  const payload = {
    ...driveForm.value,
    // If date_of_drive exists, convert it. 
    // If it's missing (null/undefined), generate "today" on the fly.
    date_of_drive: driveForm.value.date_of_drive 
      ? driveForm.value.date_of_drive.toDate(getLocalTimeZone()) 
      : today(getLocalTimeZone()).toDate(getLocalTimeZone())
  }

  const response = await $fetch('/api/admin/drive/register', {
    method: 'post',
    body: payload,
  })

  setTimeout(() => {
    if (response.statusCode !== 200) {
      toast.error(response.message)
    } else {
      toast.message(response.message)
    }
  }, 2000)
}

watch(isDialogOpen, (newVal) => {
  if (!newVal) {
    // dialog closed → clear form
    resetDriveForm()
  }
})

definePageMeta({
  layout: 'page',
})
</script>
<template>
  <div class="flex w-full flex-col gap-5">
    <div class="flex h-2/5 w-full bg-red-300" />
    <div class="flex w-full bg-amber-100 px-5">
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger
          class="flex flex-row items-center justify-center gap-3 rounded-sm bg-black px-4 py-2 text-white"
        >
          <span>Register Drive</span>
          <PenLine size="16" />
        </DialogTrigger>
        <DialogContent class="max-w-4xl min-w-4/5">
          <DialogTitle>Drive Details</DialogTitle>
          <DialogDescription
            >Collect and Registers Drive (All Fields are mandatory)</DialogDescription
          >
          <div class="flex flex-row gap-7">
            <Field>
              <FieldLabel>Company Name</FieldLabel>
              <Input v-model="driveForm.company_name" placeholder="Recruiter" />
            </Field>
            <Field>
              <FieldLabel>Company Website</FieldLabel>
              <Input v-model="driveForm.company_website" placeholder="URL of Website" />
            </Field>
          </div>
          <Field>
            <FieldLabel>Job Title</FieldLabel>
            <Input
              v-model="driveForm.job_title"
              placeholder="Ex: Software Engineer, Graduate Trainee"
            />
          </Field>
          <Field>
            <FieldLabel>Job Description</FieldLabel>
            <textarea
              v-model="driveForm.job_description"
              placeholder="Job escription..."
              type="textbox"
              class="h-56 resize-none rounded-sm border placeholder:p-2"
            />
          </Field>
          <Field>
            <FieldLabel>Expected Compensation (in LPA)</FieldLabel>
            <Input
              v-model="driveForm.expected_compensation"
              placeholder="Compensation"
              type="number"
            />
          </Field>
          <div class="flex flex-row items-center justify-between">
            <Field>
              <FieldLabel>Department</FieldLabel>
              <FieldContent>
                <div class="flex flex-row gap-5">
                  <div class="flex flex-row items-center justify-center gap-3">
                    <Label for="cse">CSE</Label>
                    <Checkbox id="cse" v-model="driveForm.departments.cse" />
                  </div>
                  <div class="flex flex-row items-center justify-center gap-3">
                    <Label for="ece">ECE</Label>
                    <Checkbox id="ece" v-model="driveForm.departments.ece" />
                  </div>
                  <div class="flex flex-row items-center justify-center gap-3">
                    <Label for="eee">EEE</Label>
                    <Checkbox id="eee" v-model="driveForm.departments.eee" />
                  </div>
                  <div class="flex flex-row items-center justify-center gap-3">
                    <Label for="mech">MECH</Label>
                    <Checkbox id="mech" v-model="driveForm.departments.mech" />
                  </div>
                </div>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>CGPA Cutoff</FieldLabel>
              <Input v-model="driveForm.required_cgpa" type="number" placeholder="CGPA" />
            </Field>
          </div>

          <div class="flex flex-row items-center justify-between gap-7">
            <Field>
              <FieldLabel>Venue/Mode:</FieldLabel>
              <Input v-model="driveForm.venue" placeholder="Hall No/Virtual" />
            </Field>
            <Field>
              <FieldLabel> Drive Date: </FieldLabel>
              <FieldContent>
                <Popover v-slot="{ close }">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      :class="
                        cn('justify-start text-left font-normal', !driveForm.date_of_drive && 'text-muted-foreground')
                      "
                    >
                      <CalendarIcon />
                      {{
                        driveForm.date_of_drive
                          ? df.format(driveForm.date_of_drive.toDate(getLocalTimeZone()))
                          : 'Pick a date'
                      }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <Calendar
                      v-model="driveForm.date_of_drive"
                      :default-placeholder="defaultPlaceholder"
                      layout="month-and-year"
                      :min-value="today(getLocalTimeZone())"
                      initial-focus
                      @update:model-value="close"
                    />
                  </PopoverContent>
                </Popover>
              </FieldContent>
            </Field>
          </div>

          <div class="flex flex-row justify-end gap-7">
            <Button variant="outline" @click="resetDriveForm"> Clear </Button>
            <Button @click="registerDriveForm"> Register </Button>
            <!-- <Button>Mark as Draft</Button> To Be implemented  -->
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
