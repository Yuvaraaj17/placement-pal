<script setup lang="ts">
import { hardSkills, softSkills, type Skill } from '~/assets/data/consts'
import { Check, PlusIcon, Trash2, X } from 'lucide-vue-next'
import Calendar from '~/components/ui/calendar/Calendar.vue'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'

definePageMeta({
  layout: 'page',
})

const previewRef = ref<HTMLDivElement | null>(null)
const isOverflowing = ref<boolean>(false)

const form = ref({
  // Personal Info
  name: '',
  phone: '',
  email: '',
  linkedin: '',
  github: '',
  location: '',
  // Summary
  summary: '',
  preferred_role: '',
  // Skills
  hard_skills: '',
  soft_skills: '',
  tools_tech: '',
  // Experience
  exp_job_title: '',
  exp_company: '',
  exp_dates: '',
  exp_location: '',
  exp_responsibilities: '',
  exp_achievements: '',
  exp_from_month: '',
  exp_from_year: '',
  exp_to_month: '',
  exp_to_year: '',
  // Education
  edu_degree: '',
  edu_institute: '',
  edu_year: '',
  // Projects
  proj_title: '',
  proj_tech: '',
  proj_description: '',
  proj_link: '',
  // Certifications
  cert_title: '',
  cert_org: '',
  cert_date: '',
  // Keywords
  keyword_title: '',
  jd_text: '',
})

const submitForm = () => {
  console.log('FORM SUBMITTED:', form.value)
  navigateTo('/lab/resume')
}

interface SkillTrack {
  [key: string]: string
}

const addedSkills = reactive<SkillTrack>({})

const addedSkillsList = computed(() =>
  Object.entries(addedSkills).map(([id, skill]) => ({ id, skill }))
)

const addSkill = (skillObj: Skill) => {
  console.log("selected")
  addedSkills[skillObj.id] = skillObj.skill
}

const removeSkill = (id: string) => {
  console.log("deleted")
  delete addedSkills[id]
}

const checkOverflow = (): void => {
  const el = previewRef.value
  if (!el) return

  isOverflowing.value = el.scrollHeight > el.clientHeight
}

watch(form, checkOverflow, { deep: true })
onMounted(checkOverflow)

const months = [
  { label: "January", value: "Jan" }, { label: "February", value: "Feb" },
  { label: "March", value: "Mar" }, { label: "April", value: "Apr" },
  { label: "May", value: "May" }, { label: "June", value: "Jun" },
  { label: "July", value: "Jul" }, { label: "August", value: "Aug" },
  { label: "September", value: "Sep" }, { label: "October", value: "Oct" },
  { label: "November", value: "Nov" }, { label: "December", value: "Dec" }
]

// YEARS (generate from 1980 → current year)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

const isCurrent = ref(false)
const isFresher = ref(false)

const emptyExperience : Experience = {
  job_title: '',
  company: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  job_location: '',
  responsibilities: ''
}

const experienceList : Experience[] = reactive([
  {
  job_title: '',
  company: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  job_location: '',
  responsibilities: ''
}
])

const addExperience = ()=>{
  experienceList.push(emptyExperience)
}

const removeExperience = (index : number)=>{
  experienceList.splice(1, 1);
}

const resetExperience = ()=>{
  experienceList.length = 0;
  experienceList.push(emptyExperience)
}

</script>

<template>
  <div class="flex h-screen max-h-screen overflow-hidden">
    <!-- 📝 LEFT : FORM (scrollable) -->
    <div class="w-full space-y-12 overflow-y-auto bg-white p-10 lg:w-1/2">
      <!-- ⭐ PERSONAL INFO -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Personal Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel><Input v-model="form.name" placeholder="Your Name" />
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
              <FieldLabel>Phone</FieldLabel><Input v-model="form.phone" placeholder="12345 67890" />
            </Field>
          </div>

          <Field>
            <FieldLabel>Email</FieldLabel><Input type="email" v-model="form.email" />
          </Field>
          <Field>
            <FieldLabel>Location</FieldLabel><Input v-model="form.location" placeholder="City, State" />
          </Field>

          <Field>
            <FieldLabel>LinkedIn</FieldLabel><Input v-model="form.linkedin" />
          </Field>
          <Field>
            <FieldLabel>GitHub</FieldLabel><Input v-model="form.github" />
          </Field>
        </div>
      </section>

      <!-- ⭐ SUMMARY -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Summary / Objective</h2>
        <Field>
          <FieldLabel>Preferred Role</FieldLabel><Input v-model="form.preferred_role"
            placeholder="Frontend Developer" />
        </Field>
        <Field>
          <FieldLabel>Short Summary</FieldLabel><Textarea v-model="form.summary" rows="3"
            placeholder="2–3 line pitch..." />
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
                  <Button variant="outline">
                    <PlusIcon></PlusIcon><span>Add Skill</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start">
                  <Command>
                    <CommandInput>Type Skill...</CommandInput>
                    <CommandList class="max-h-50 overflow-y-auto">
                      <CommandGroup>
                        <CommandItem v-for="skill in hardSkills" @select="addSkill(skill)" :key="skill.id"
                          :value="skill.skill" class="flex flex-row justify-between">
                          <span>{{ skill.skill }}</span>
                          <Check class="justify-self-end" v-if="addedSkillsList.find(item => item.id === skill.id)" />
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
                  <Button variant="outline">
                    <PlusIcon></PlusIcon><span>Add Skill</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start">
                  <Command>
                    <CommandInput>Type Skill...</CommandInput>
                    <CommandList class="max-h-50 overflow-y-auto">
                      <CommandGroup>
                        <CommandItem v-for="skill in softSkills" @select="addSkill(skill)" :key="skill.id"
                          :value="skill.skill" class="flex flex-row justify-between">
                          <span>{{ skill.skill }}</span>
                          <Check class="justify-self-end" v-if="addedSkillsList.find(item => item.id === skill.id)" />
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
              <CardContent class="flex -ml-2 -mt-2 gap-2">
                <span v-for="(skill, id) in addedSkillsList" :key="id"
                  class="text-xs text-muted-foreground bg-gray-200 w-fit px-2 py-1 rounded-full flex flex-row gap-1 items-end justify-center">
                  <p>
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
          <h2 class=" text-xl font-semibold">Experience</h2>
          <div class="flex flex-row pr-5 gap-5">
            <Label for="fresher">Fresher ?</Label>
            <Checkbox id="fresher" v-model="isFresher" @click="resetExperience" />
          </div>
        </div>


        <section class="space-y-6" :class="{
          'pointer-events-none opacity-50': isFresher
        }" v-for="(item,ind) in experienceList" :key="ind">
          <Field>
            <div class="flex flex-row justify-between items-center pr-3">
              <FieldLabel>Job Title</FieldLabel>
              <Trash2 :size="16" @click="removeExperience(ind)"/>
            </div>
            <Input v-model="item.job_title" />
          </Field>
          <Field>
            <FieldLabel>Company</FieldLabel><Input v-model="item.company" />
          </Field>

          <div class="grid grid-cols-3 gap-24">

            <!-- FROM DATE -->
            <Field>
              <FieldLabel>From</FieldLabel>
              <div class="flex gap-2">
                <Select v-model="item.from_month">
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="m in months" :key="m.value" :value="m.value">
                      {{ m.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select v-model="item.from_year">
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
              <div class="flex flex-row justify-between items-center">
                <FieldLabel>To</FieldLabel>
                <div class="flex flex-row gap-4 items-end justify-end px-1" v-if="ind == 0">
                  <Label for="current">Current</Label>
                  <Checkbox id="current" v-model="isCurrent" />
                </div>
              </div>
              <div class="flex gap-2">
                <Select v-model="item.to_month" :disabled="isCurrent">
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="m in months" :key="m.value" :value="m.value">
                      {{ m.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select v-model="item.to_year" :disabled="isCurrent">
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
              <FieldLabel>Location</FieldLabel><Input v-model="item.job_location" placeholder="Chennai" />
            </Field>
          </div>

          <!-- RESPONSIBILITIES -->
          <Field>
            <FieldLabel>Responsibilities</FieldLabel>
            <Textarea v-model="item.responsibilities" class="h-44 resize-none"
              placeholder="• Built UI components..." />
          </Field>
          
          <!-- ADD EXPERIENCE -->
          <Field>
            <Button @click="addExperience">Add Another Experience</Button>
          </Field>
        </section>

      </section>

      <!-- ⭐ EDUCATION -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Education</h2>
        <Field>
          <FieldLabel>Degree</FieldLabel><Input v-model="form.edu_degree" />
        </Field>
        <Field>
          <FieldLabel>Institute</FieldLabel><Input v-model="form.edu_institute" />
        </Field>
        <Field>
          <FieldLabel>Graduation Year</FieldLabel><Input v-model="form.edu_year" placeholder="2024" />
        </Field>
      </section>

      <!-- ⭐ PROJECTS -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Projects</h2>
        <Field>
          <FieldLabel>Title</FieldLabel><Input v-model="form.proj_title" />
        </Field>
        <Field>
          <FieldLabel>Tech Used</FieldLabel><Input v-model="form.proj_tech" />
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel><Textarea v-model="form.proj_description" rows="3" />
        </Field>
        <Field>
          <FieldLabel>Link</FieldLabel><Input v-model="form.proj_link" placeholder="https://..." />
        </Field>
      </section>

      <!-- ⭐ CERTIFICATIONS -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Certifications</h2>
        <Field>
          <FieldLabel>Title</FieldLabel><Input v-model="form.cert_title" />
        </Field>
        <Field>
          <FieldLabel>Organization</FieldLabel><Input v-model="form.cert_org" />
        </Field>
        <Field>
          <FieldLabel>Date</FieldLabel><Input type="date" v-model="form.cert_date" />
        </Field>
      </section>

      <!-- SUBMIT -->
      <Button class="mt-4 w-full py-6 text-lg" @click="submitForm"> Save Resume </Button>
    </div>

    <!-- 📄 RIGHT : FIXED PREVIEW -->
    <div class="hidden w-1/2 items-start justify-center bg-gray-200 p-4 lg:flex">
      <!-- A4 SHEET (NO SCROLL) -->
      <div ref="previewRef" class="sticky top-4 h-[297mm] w-[210mm] overflow-hidden bg-white p-10 shadow-lg"
        :class="{ 'overflow-warning': isOverflowing }">
        <h1 class="text-3xl font-bold">{{ form.name }}</h1>
        <p class="mb-1 text-sm text-gray-600">
          {{ form.location }} • {{ form.email }} • {{ form.phone }}
        </p>
        <hr class="my-4" />

        <h2 class="text-lg font-semibold">Summary</h2>
        <p class="text-sm">{{ form.summary }}</p>

        <h2 class="mt-4 text-lg font-semibold">Skills</h2>
        <p class="text-sm">{{ form.hard_skills }} • {{ form.tools_tech }}</p>

        <h2 class="mt-4 text-lg font-semibold">Experience</h2>
        <p class="text-sm font-medium">{{ form.exp_job_title }} — {{ form.exp_company }}</p>
        <p class="text-xs">{{ form.exp_dates }} • {{ form.exp_location }}</p>
        <pre class="mt-2 text-xs whitespace-pre-line">{{ form.exp_responsibilities }}</pre>

        <h2 class="mt-4 text-lg font-semibold">Education</h2>
        <p class="text-sm">
          {{ form.edu_degree }} - {{ form.edu_institute }} ({{ form.edu_year }})
        </p>

        <h2 class="mt-4 text-lg font-semibold">Projects</h2>
        <p class="text-sm font-medium">{{ form.proj_title }}</p>
        <p class="text-xs">{{ form.proj_tech }}</p>
        <pre class="text-xs">{{ form.proj_description }}</pre>

        <h2 class="mt-4 text-lg font-semibold">Certifications</h2>
        <p class="text-sm">{{ form.cert_title }} — {{ form.cert_org }} ({{ form.cert_date }})</p>
      </div>
    </div>
  </div>
</template>

<style>
.overflow-warning {
  outline: 2px solid red;
}
</style>
