<script setup lang="ts">
import { hardSkills, softSkills, type Skill } from '~/assets/data/consts'
import { Check, PlusIcon, Trash2, X } from 'lucide-vue-next'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'page',
  middleware: 'auth',
})

interface Experience {
  job_title: string
  company: string
  from_month: string
  from_year: string
  to_month: string
  to_year: string
  job_location: string
  responsibilities: string
}

interface Education {
  degree: string
  institution_name: string
  year: number | string
}

interface Project {
  project_title: string
  project_description: string
  tech_stack: string
  link: string
}

interface ResumeSkill {
  id: string
  skill: string
}

interface ResumeContent {
  personalInfo: {
    name: string
    phone_code: string
    phone_number: string
    email: string
    location: string
    linkedin: string
    github: string
  }
  summary: {
    pref_role: string
    summary: string
  }
  skills: ResumeSkill[]
  experienceList: Experience[]
  educationList: Education[]
  projectsList: Project[]
  isCurrent: boolean
  isFresher: boolean
}

const route = useRoute()
const resumeId = computed(() =>
  typeof route.query.resumeId === 'string' ? route.query.resumeId : '',
)
const isLoading = ref(false)
const isSaving = ref(false)

const previewRef = ref<HTMLDivElement | null>(null)
const isOverflowing = ref<boolean>(false)

const personalInfo = reactive({
  name: '',
  phone_code: '',
  phone_number: '',
  email: '',
  location: '',
  linkedin: '',
  github: '',
})

const summary = reactive({
  pref_role: '',
  summary: '',
})

const resumeTitle = computed(() =>
  personalInfo.name ? `${personalInfo.name} Resume` : 'Untitled Resume',
)

const buildResumePayload = (): ResumeContent => ({
  personalInfo: { ...personalInfo },
  summary: { ...summary },
  skills: addedSkillsList.value.map((skill) => ({ id: skill.id, skill: skill.skill })),
  experienceList: experienceList.map((item) => ({ ...item })),
  educationList: educationList.map((item) => ({ ...item })),
  projectsList: projectsList.map((item) => ({ ...item })),
  isCurrent: isCurrent.value,
  isFresher: isFresher.value,
})

const applyResumePayload = (payload: ResumeContent) => {
  Object.assign(personalInfo, payload.personalInfo || {})
  Object.assign(summary, payload.summary || {})

  const skillMap: SkillTrack = {}
  if (Array.isArray(payload.skills)) {
    payload.skills.forEach((item) => {
      if (item?.id && item?.skill) {
        skillMap[item.id] = item.skill
      }
    })
  }
  addedSkills.value = skillMap

  experienceList.length = 0
  if (Array.isArray(payload.experienceList) && payload.experienceList.length) {
    experienceList.push(...payload.experienceList)
  } else {
    experienceList.push({
      job_title: '',
      company: '',
      from_month: '',
      from_year: '',
      to_month: '',
      to_year: '',
      job_location: '',
      responsibilities: '',
    })
  }

  educationList.length = 0
  if (Array.isArray(payload.educationList) && payload.educationList.length) {
    educationList.push(...payload.educationList)
  } else {
    educationList.push({
      degree: '',
      institution_name: '',
      year: 0,
    })
  }

  projectsList.length = 0
  if (Array.isArray(payload.projectsList) && payload.projectsList.length) {
    projectsList.push(...payload.projectsList)
  } else {
    projectsList.push({
      project_title: '',
      project_description: '',
      tech_stack: '',
      link: '',
    })
  }

  isCurrent.value = Boolean(payload.isCurrent)
  isFresher.value = Boolean(payload.isFresher)
}

const loadResume = async () => {
  if (!resumeId.value) return
  try {
    isLoading.value = true
    const response = await $fetch(`/api/student/resume/${resumeId.value}`, {
      method: 'get',
    })
    if (response.statusCode !== 200 || !response.data?.content) {
      toast.error(response.message || 'Failed to load resume')
      return
    }
    applyResumePayload(response.data.content as ResumeContent)
  } catch (error) {
    toast.error('Failed to load resume')
  } finally {
    isLoading.value = false
  }
}

const saveResume = async () => {
  try {
    isSaving.value = true
    const response = await $fetch('/api/student/resume/save', {
      method: 'post',
      body: {
        resumeId: resumeId.value || undefined,
        title: resumeTitle.value,
        content: buildResumePayload(),
      },
    })

    if (![200, 201].includes(response.statusCode)) {
      toast.error(response.message || 'Failed to save resume')
      return
    }

    toast.success(response.message || 'Resume saved')
    navigateTo('/resumevault')
  } catch (error) {
    toast.error('Failed to save resume')
  } finally {
    isSaving.value = false
  }
}

interface SkillTrack {
  [key: string]: string
}

// 1. Change to ref
const addedSkills = ref<SkillTrack>({})

// 2. Updated computed (needs .value)
const addedSkillsList = computed(() =>
  Object.entries(addedSkills.value).map(([id, skill]) => ({ id, skill })),
)

// 3. Updated Add
const addSkill = (skillObj: Skill) => {
  addedSkills.value[skillObj.id] = skillObj.skill
}

// 4. Updated Remove (NO DELETE USED)
const removeSkill = (id: string) => {
  const { [id]: _, ...remaining } = addedSkills.value
  addedSkills.value = remaining // Replaces the object, triggering reactivity perfectly
}

const checkOverflow = (): void => {
  const el = previewRef.value
  if (!el) return

  isOverflowing.value = el.scrollHeight > el.clientHeight
}

const resumeSnapshot = computed(() => ({
  personalInfo: { ...personalInfo },
  summary: { ...summary },
  skills: addedSkillsList.value.map((item) => ({ ...item })),
  experienceList: experienceList.map((item) => ({ ...item })),
  educationList: educationList.map((item) => ({ ...item })),
  projectsList: projectsList.map((item) => ({ ...item })),
}))

watch(resumeSnapshot, checkOverflow, { deep: true })

onMounted(async () => {
  await loadResume()
  checkOverflow()
})

const months = [
  { label: 'January', value: 'Jan' },
  { label: 'February', value: 'Feb' },
  { label: 'March', value: 'Mar' },
  { label: 'April', value: 'Apr' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'Jun' },
  { label: 'July', value: 'Jul' },
  { label: 'August', value: 'Aug' },
  { label: 'September', value: 'Sep' },
  { label: 'October', value: 'Oct' },
  { label: 'November', value: 'Nov' },
  { label: 'December', value: 'Dec' },
]

// YEARS (generate from 1980 → current year)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

const isCurrent = ref(false)
const isFresher = ref(false)

const emptyExperience: Experience = {
  job_title: '',
  company: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  job_location: '',
  responsibilities: '',
}

const experienceList = reactive<Experience[]>([
  {
    job_title: '',
    company: '',
    from_month: '',
    from_year: '',
    to_month: '',
    to_year: '',
    job_location: '',
    responsibilities: '',
  },
])

const addExperience = () => {
  experienceList.push({
    job_title: '',
    company: '',
    from_month: '',
    from_year: '',
    to_month: '',
    to_year: '',
    job_location: '',
    responsibilities: '',
  })
}

const removeExperience = (index: number) => {
  experienceList.splice(index, 1)
}

const resetExperience = () => {
  experienceList.length = 0
  experienceList.push(emptyExperience)
}

const emptyEducation: Education = {
  degree: '',
  institution_name: '',
  year: 0,
}

const educationList = reactive<Education[]>([
  {
    degree: '',
    institution_name: '',
    year: 0,
  },
])

const addEducation = () => {
  educationList.push(emptyEducation)
}

const removeEducation = (index: number) => {
  educationList.splice(index, 1)
}

const emptyProject: Project = {
  project_title: '',
  project_description: '',
  tech_stack: '',
  link: '',
}

const projectsList = reactive<Project[]>([
  {
    project_title: '',
    project_description: '',
    tech_stack: '',
    link: '',
  },
])

const addProjects = () => {
  projectsList.push(emptyProject)
}

const removeProject = (index: number) => {
  projectsList.splice(index, 1)
}
</script>

<template>
    <div class="flex h-screen max-h-screen flex-col overflow-hidden">
    <!-- 📝 LEFT : FORM (scrollable) -->
      <header
        class="flex flex-col gap-4 border-b border-slate-200 bg-white px-8 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Resume Vault</p>
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ resumeId ? 'Edit Resume' : 'Create Resume' }}
          </h1>
          <p class="text-sm text-slate-600">
            {{ resumeTitle }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" class="px-4" @click="navigateTo('/resumevault')">
            Back to Vault
          </Button>
          <Button class="px-5" :disabled="isSaving || isLoading" @click="saveResume">
            {{ isSaving ? 'Saving...' : 'Save Resume' }}
          </Button>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <div class="w-full space-y-12 overflow-y-auto bg-white p-10 lg:w-1/2">
      <!-- ⭐ PERSONAL INFO -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Personal Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input v-model="personalInfo.name" placeholder="Your Name" />
          </Field>
          <div class="flex flex-row items-end justify-center gap-2">
            <Field class="w-fit">
              <Select>
                <SelectTrigger>
                  <SelectValue>+91</SelectValue>
                </SelectTrigger>
                <!-- <SelectContent>
                  <SelectItem value="12">
                    +12
                  </SelectItem>
                </SelectContent> -->
              </Select>
            </Field>
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input v-model="personalInfo.phone_number" placeholder="12345 67890" />
            </Field>
          </div>

          <Field>
            <FieldLabel>Email</FieldLabel><Input v-model="personalInfo.email" type="email" />
          </Field>
          <Field>
            <FieldLabel>Location</FieldLabel>
            <Input v-model="personalInfo.location" placeholder="City, State" />
          </Field>

          <Field>
            <FieldLabel>LinkedIn</FieldLabel><Input v-model="personalInfo.linkedin" />
          </Field>
          <Field> <FieldLabel>GitHub</FieldLabel><Input v-model="personalInfo.github" /> </Field>
        </div>
      </section>

      <!-- ⭐ SUMMARY -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Summary / Objective</h2>
        <Field>
          <FieldLabel>Preferred Role</FieldLabel>
          <Input v-model="summary.pref_role" placeholder="Frontend Developer" />
        </Field>
        <Field>
          <FieldLabel>Short Summary</FieldLabel>
          <Textarea
            v-model="summary.summary"
            class="h-34 resize-none"
            placeholder="2–3 line pitch..."
          />
        </Field>
      </section>

      <!-- ⭐ SKILLS -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Skills</h2>
        <div class="flex flex-row gap-5">
          <Field>
            <FieldLabel>Hard Skills</FieldLabel>
            <FieldContent>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline"> <PlusIcon /><span>Add Skill</span> </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start">
                  <Command>
                    <CommandInput>Type Skill...</CommandInput>
                    <CommandList class="max-h-50 overflow-y-auto">
                      <CommandGroup>
                        <CommandItem
                          v-for="skill in hardSkills"
                          :key="skill.id"
                          :value="skill.skill"
                          class="flex flex-row justify-between"
                          @select="addSkill(skill)"
                        >
                          <span>{{ skill.skill }}</span>
                          <Check
                            v-if="addedSkillsList.find((item) => item.id === skill.id)"
                            class="justify-self-end"
                          />
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Soft Skills</FieldLabel>
            <FieldContent>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline"> <PlusIcon /><span>Add Skill</span> </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start">
                  <Command>
                    <CommandInput>Type Skill...</CommandInput>
                    <CommandList class="max-h-50 overflow-y-auto">
                      <CommandGroup>
                        <CommandItem
                          v-for="skill in softSkills"
                          :key="skill.id"
                          :value="skill.skill"
                          class="flex flex-row justify-between"
                          @select="addSkill(skill)"
                        >
                          <span>{{ skill.skill }}</span>
                          <Check
                            v-if="addedSkillsList.find((item) => item.id === skill.id)"
                            class="justify-self-end"
                          />
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FieldContent>
          </Field>
        </div>
        <Field>
          <FieldLabel>Your skills</FieldLabel>
          <FieldContent>
            <Card class="flex min-h-36 overflow-y-scroll">
              <CardContent class="-mt-2 -ml-2 flex flex-wrap gap-2">
                <span
                  v-for="(skill, id) in addedSkillsList"
                  :key="id"
                  class="text-muted-foreground flex w-fit flex-row items-end justify-center gap-1 rounded-full bg-gray-200 px-2 py-1 text-xs"
                >
                  <p class="whitespace-nowrap">
                    {{ skill.skill }}
                  </p>
                  <X :size="12" @click="removeSkill(skill.id)" />
                </span>
              </CardContent>
            </Card>
          </FieldContent>
        </Field>
      </section>

      <!-- ⭐ EXPERIENCE -->
      <section class="space-y-6">
        <div class="flex flex-row items-center justify-between border-b pb-2">
          <h2 class="text-xl font-semibold">Experience</h2>
          <div class="flex flex-row gap-5 pr-5">
            <Label for="fresher">Fresher ?</Label>
            <Checkbox id="fresher" v-model="isFresher" @click="resetExperience" />
          </div>
        </div>

        <section
          v-for="(item, ind) in experienceList"
          :key="ind"
          class="space-y-6"
          :class="{
            'pointer-events-none opacity-50': isFresher,
          }"
        >
          <Field>
            <div class="flex flex-row items-center justify-between pr-3">
              <FieldLabel>Job Title</FieldLabel>
              <div :class="{ 'cursor-not-allowed': experienceList.length == 1 }">
                <Trash2
                  :size="16"
                  :class="{
                    'pointer-events-none': experienceList.length == 1,
                  }"
                  @click="removeExperience(ind)"
                />
              </div>
            </div>
            <Input :v-model="item.job_title" />
          </Field>
          <Field> <FieldLabel>Company</FieldLabel><Input :v-model="item.company" /> </Field>

          <div class="grid grid-cols-3 gap-24">
            <!-- FROM DATE -->
            <Field>
              <FieldLabel>From</FieldLabel>
              <div class="flex gap-2">
                <Select :v-model="item.from_month">
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="m in months" :key="m.value" :value="m.value">
                      {{ m.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select :v-model="item.from_year">
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="y in years" :key="y" :value="y">{{ y }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>

            <!-- TO DATE -->
            <Field>
              <div class="flex flex-row items-center justify-between">
                <FieldLabel>To</FieldLabel>
                <div v-if="ind == 0" class="flex flex-row items-end justify-end gap-4 px-1">
                  <Label for="current">Current</Label>
                  <Checkbox id="current" :v-model="isCurrent" />
                </div>
              </div>
              <div class="flex gap-2">
                <Select :v-model="item.to_month" :disabled="isCurrent">
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="m in months" :key="m.value" :value="m.value">
                      {{ m.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select :v-model="item.to_year" :disabled="isCurrent">
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="y in years" :key="y" :value="y">{{ y }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>
            <!-- LOCATION -->
            <Field>
              <FieldLabel>Location</FieldLabel>
              <Input :v-model="item.job_location" placeholder="Chennai" />
            </Field>
          </div>

          <!-- RESPONSIBILITIES -->
          <Field>
            <FieldLabel>Responsibilities</FieldLabel>
            <Textarea
              :v-model="item.responsibilities"
              class="h-44 resize-none"
              placeholder="• Built UI components..."
            />
          </Field>

          <!-- ADD EXPERIENCE -->
        </section>
        <Field>
          <Button @click="addExperience">Add Another Experience</Button>
        </Field>
      </section>

      <!-- ⭐ EDUCATION -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Education</h2>
        <section v-for="(item, ind) in educationList" :key="ind" class="space-y-6">
          <Field>
            <div class="flex flex-row items-center justify-between pr-3">
              <FieldLabel>Degree</FieldLabel>
              <div :class="{ 'cursor-not-allowed': educationList.length == 1 }">
                <Trash2
                  :size="16"
                  :class="{
                    'pointer-events-none': educationList.length == 1,
                  }"
                  @click="removeEducation(ind)"
                />
              </div>
            </div>
            <Input :v-model="item.degree" />
          </Field>
          <div class="flex flex-row gap-4">
            <Field>
              <FieldLabel>Institute</FieldLabel><Input :v-model="item.institution_name" />
            </Field>
            <Field class="w-fit">
              <FieldLabel>Graduation Year</FieldLabel>
              <Input :v-model="item.year" placeholder="2024" />
            </Field>
          </div>
        </section>
        <Field>
          <Button @click="addEducation">Add Another Education</Button>
        </Field>
      </section>

      <!-- ⭐ PROJECTS -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Projects</h2>
        <section v-for="(item, ind) in projectsList" :key="ind" class="space-y-6">
          <Field>
            <div class="flex flex-row items-center justify-between pr-3">
              <FieldLabel>Title</FieldLabel>
              <div :class="{ 'cursor-not-allowed': projectsList.length == 1 }">
                <Trash2
                  :size="16"
                  :class="{
                    'pointer-events-none': projectsList.length == 1,
                  }"
                  @click="removeProject(ind)"
                />
              </div>
            </div>
            <Input :v-model="item.project_title" />
          </Field>
          <Field> <FieldLabel>Tech Used</FieldLabel><Input :v-model="item.tech_stack" /> </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea :v-model="item.project_description" class="h-44 resize-none" />
          </Field>
          <Field>
            <FieldLabel>Link</FieldLabel><Input :v-model="item.link" placeholder="https://..." />
          </Field>
        </section>
        <Field>
          <Button @click="addProjects">Add Another Project</Button>
        </Field>
      </section>

      <!-- SUBMIT -->
      <Button class="mt-4 w-full py-6 text-lg" :disabled="isSaving || isLoading" @click="saveResume">
        {{ isSaving ? 'Saving...' : 'Save Resume' }}
      </Button>
    </div>

    <!-- 📄 RIGHT : FIXED PREVIEW -->
    <div class="hidden w-1/2 items-start justify-center bg-gray-200 p-4 lg:flex">
      <!-- A4 SHEET (NO SCROLL) -->
      <div
        ref="previewRef"
        class="sticky top-4 h-[297mm] w-[210mm] overflow-hidden bg-white p-10 shadow-lg"
        :class="{ 'overflow-warning': isOverflowing }"
      >
        <h1 class="text-3xl font-bold">{{ personalInfo.name }}</h1>
        <p class="mb-1 text-sm text-gray-600">
          {{ personalInfo.location }} | {{ personalInfo.email }} | {{ personalInfo.phone_number }}
        </p>
        <p class="mb-1 text-sm text-gray-600">
          {{ personalInfo.linkedin }} | {{ personalInfo.github }}
        </p>
        <hr class="my-4" />

        <h2 class="text-lg font-semibold">Summary</h2>
        <p class="text-sm">{{ summary.summary }}</p>

        <h2 class="mt-4 text-lg font-semibold">Skills</h2>
        <div class="flex flex-wrap">
          <p v-for="(skill, ind) in addedSkillsList" :key="ind" class="text-sm whitespace-nowrap">
            {{ skill.skill }} ,
          </p>
        </div>

        <h2 class="mt-4 text-lg font-semibold">Experience</h2>
        <div v-for="(exp, ind) in experienceList" :key="ind">
          <p class="text-sm font-medium">{{ exp.job_title }} — {{ exp.company }}</p>
          <p class="text-xs">{{ exp.from_year }} - {{ exp.to_year }} • {{ exp.job_location }}</p>
          <pre class="mt-2 text-xs whitespace-pre-line">{{ exp.responsibilities }}</pre>
        </div>

        <h2 class="mt-4 text-lg font-semibold">Education</h2>
        <p v-for="(edu, ind) in educationList" :key="ind" class="text-sm">
          {{ edu.degree }} - {{ edu.institution_name }} ({{ edu.year }})
        </p>

        <h2 class="mt-4 text-lg font-semibold">Projects</h2>
        <div v-for="(proj, ind) in projectsList" :key="ind">
          <p class="text-sm font-medium">{{ proj.project_title }}</p>
          <p class="text-xs">{{ proj.tech_stack }}</p>
          <pre class="text-xs">{{ proj.project_description }}</pre>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.overflow-warning {
  outline: 2px solid red;
}
</style>
