<script setup>
import { ref } from 'vue'
import { navigateTo } from '#imports'

// shadcn components
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'page',
})

import { onMounted, watch } from 'vue'

const previewRef = ref(null)
const isOverflowing = ref(false)

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

const checkOverflow = () => {
  if (!previewRef.value) return
  const el = previewRef.value
  isOverflowing.value = el.scrollHeight > el.clientHeight
}

const modelValue = ref({
  1: {
    'skill_name': 'Python'
  }, 2: {
    'skill_name': 'C++'
  }
})

watch(form, checkOverflow, { deep: true })
onMounted(checkOverflow)
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

          <Field> <FieldLabel>Email</FieldLabel><Input type="email" v-model="form.email" /> </Field>
          <Field>
            <FieldLabel>Location</FieldLabel
            ><Input v-model="form.location" placeholder="City, State" />
          </Field>

          <Field> <FieldLabel>LinkedIn</FieldLabel><Input v-model="form.linkedin" /> </Field>
          <Field> <FieldLabel>GitHub</FieldLabel><Input v-model="form.github" /> </Field>
        </div>
      </section>

      <!-- ⭐ SUMMARY -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Summary / Objective</h2>
        <Field>
          <FieldLabel>Preferred Role</FieldLabel
          ><Input v-model="form.preferred_role" placeholder="Frontend Developer" />
        </Field>
        <Field>
          <FieldLabel>Short Summary</FieldLabel
          ><Textarea v-model="form.summary" rows="3" placeholder="2–3 line pitch..." />
        </Field>
      </section>

      <!-- ⭐ SKILLS -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Skills</h2>
        <Field>
          <FieldLabel>Hard Skills</FieldLabel
          ><Input v-model="form.hard_skills" placeholder="JavaScript, SQL..." />
        </Field>
        <Field>
          <FieldLabel>Soft Skills</FieldLabel
          ><Input v-model="form.soft_skills" placeholder="Leadership, Problem Solving" />
        </Field>
        <Field>
          <FieldLabel>Your skills</FieldLabel>
          <FieldContent>
            <Card class="flex min-h-36 overflow-y-scroll">
              <CardContent class="flex -ml-2 -mt-2 gap-2">
                <span v-for="skill in modelValue" :key="skill.id"
                  class="text-xs text-muted-foreground bg-gray-200 w-fit px-2 py-1 rounded-full flex flex-row gap-1 items-end justify-center">
                  <p>
                    {{ skill.skill_name }}
                  </p>
                  <X size="12" />
                </span>
              </CardContent>
            </Card>
          </FieldContent>
        </Field>
      </section>

      <!-- ⭐ EXPERIENCE -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Experience</h2>

        <Field> <FieldLabel>Job Title</FieldLabel><Input v-model="form.exp_job_title" /> </Field>
        <Field> <FieldLabel>Company</FieldLabel><Input v-model="form.exp_company" /> </Field>

        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Dates</FieldLabel><Input v-model="form.exp_dates" placeholder="2022-2024" />
          </Field>
          <Field>
            <FieldLabel>Location</FieldLabel
            ><Input v-model="form.exp_location" placeholder="Remote / On-site" />
          </Field>
        </div>

        <Field>
          <FieldLabel>Responsibilities</FieldLabel>
          <Textarea
            v-model="form.exp_responsibilities"
            rows="3"
            placeholder="• Built UI components...\n• Improved load time by 30%"
          />
        </Field>

        <Field>
          <FieldLabel>Achievements</FieldLabel>
          <Textarea
            v-model="form.exp_achievements"
            rows="3"
            placeholder="• Reduced API latency by 25%..."
          />
        </Field>
      </section>

      <!-- ⭐ EDUCATION -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Education</h2>
        <Field> <FieldLabel>Degree</FieldLabel><Input v-model="form.edu_degree" /> </Field>
        <Field> <FieldLabel>Institute</FieldLabel><Input v-model="form.edu_institute" /> </Field>
        <Field>
          <FieldLabel>Graduation Year</FieldLabel
          ><Input v-model="form.edu_year" placeholder="2024" />
        </Field>
      </section>

      <!-- ⭐ PROJECTS -->
      <section class="space-y-6">
        <h2 class="border-b pb-2 text-xl font-semibold">Projects</h2>
        <Field> <FieldLabel>Title</FieldLabel><Input v-model="form.proj_title" /> </Field>
        <Field> <FieldLabel>Tech Used</FieldLabel><Input v-model="form.proj_tech" /> </Field>
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
        <Field> <FieldLabel>Title</FieldLabel><Input v-model="form.cert_title" /> </Field>
        <Field> <FieldLabel>Organization</FieldLabel><Input v-model="form.cert_org" /> </Field>
        <Field> <FieldLabel>Date</FieldLabel><Input type="date" v-model="form.cert_date" /> </Field>
      </section>

      <!-- SUBMIT -->
      <Button class="mt-4 w-full py-6 text-lg" @click="submitForm"> Save Resume </Button>
    </div>

    <!-- 📄 RIGHT : FIXED PREVIEW -->
    <div class="hidden w-1/2 items-start justify-center bg-gray-200 p-4 lg:flex">
      <!-- A4 SHEET (NO SCROLL) -->
      <div
        ref="previewRef"
        class="sticky top-4 h-[297mm] w-[210mm] overflow-hidden bg-white p-10 shadow-lg"
        :class="{ 'overflow-warning': isOverflowing }"
      >
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
