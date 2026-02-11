<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  layout: false,
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
const resume = ref<ResumeContent | null>(null)
const isLoading = ref(true)

const fetchResume = async () => {
  const resumeId = typeof route.query.resumeId === 'string' ? route.query.resumeId : ''
  if (!resumeId) {
    toast.error('Missing resume id')
    isLoading.value = false
    return
  }

  try {
    const response = await $fetch(`/api/student/resume/${resumeId}`, {
      method: 'get',
    })
    if (response.statusCode !== 200) {
      toast.error(response.message || 'Failed to load resume')
      return
    }
    resume.value = response.data?.content || null
    if (process.client) {
      setTimeout(() => window.print(), 300)
    }
  } catch (error) {
    toast.error('Failed to load resume')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchResume)
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
    <div v-if="isLoading" class="text-center text-sm text-slate-500">Loading resume...</div>

    <div
      v-else-if="resume"
      class="mx-auto w-full max-w-[210mm] bg-white p-10 shadow print:max-w-none print:shadow-none"
    >
      <h1 class="text-3xl font-bold">{{ resume.personalInfo.name }}</h1>
      <p class="mb-1 text-sm text-gray-600">
        {{ resume.personalInfo.location }} | {{ resume.personalInfo.email }} |
        {{ resume.personalInfo.phone_number }}
      </p>
      <p class="mb-1 text-sm text-gray-600">
        {{ resume.personalInfo.linkedin }} | {{ resume.personalInfo.github }}
      </p>
      <hr class="my-4" />

      <h2 class="text-lg font-semibold">Summary</h2>
      <p class="text-sm">{{ resume.summary.summary }}</p>

      <h2 class="mt-4 text-lg font-semibold">Skills</h2>
      <div class="flex flex-wrap">
        <p v-for="skill in resume.skills" :key="skill.id" class="text-sm whitespace-nowrap">
          {{ skill.skill }} ,
        </p>
      </div>

      <h2 class="mt-4 text-lg font-semibold">Experience</h2>
      <div v-for="(exp, ind) in resume.experienceList" :key="ind">
        <p class="text-sm font-medium">{{ exp.job_title }} — {{ exp.company }}</p>
        <p class="text-xs">
          {{ exp.from_year }} - {{ exp.to_year }} • {{ exp.job_location }}
        </p>
        <pre class="mt-2 text-xs whitespace-pre-line">{{ exp.responsibilities }}</pre>
      </div>

      <h2 class="mt-4 text-lg font-semibold">Education</h2>
      <p v-for="(edu, ind) in resume.educationList" :key="ind" class="text-sm">
        {{ edu.degree }} - {{ edu.institution_name }} ({{ edu.year }})
      </p>

      <h2 class="mt-4 text-lg font-semibold">Projects</h2>
      <div v-for="(proj, ind) in resume.projectsList" :key="ind">
        <p class="text-sm font-medium">{{ proj.project_title }}</p>
        <p class="text-xs">{{ proj.tech_stack }}</p>
        <pre class="text-xs whitespace-pre-line">{{ proj.project_description }}</pre>
      </div>
    </div>

    <div v-else class="text-center text-sm text-slate-500">Resume not found.</div>
  </div>
</template>
