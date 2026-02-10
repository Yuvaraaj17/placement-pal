<template>
    <div
        class="min-h-screen w-full text-slate-900"
        :style="pageStyle"
    >
        <div class="mx-auto w-full max-w-6xl px-5 py-8">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-slate-600">Dashboard</p>
                    <h1 class="mt-2 text-2xl font-semibold text-slate-900">Skills & Subskills</h1>
                    <p class="mt-1 text-sm text-slate-600">Manage skills, subskills, and question coverage in one view.</p>
                </div>
                <div class="flex items-center gap-3">
                    <Button variant="outline" size="sm" class="gap-2" @click="refreshData">
                        <RefreshCcw :size="14" />
                        Refresh
                    </Button>
                    <Sheet v-model:open="isSheetOpen">
                        <SheetTrigger>
                            <Button size="sm" class="gap-2">
                                <PlusCircle :size="14" />
                                Add
                            </Button>
                        </SheetTrigger>
                        <SheetContent class="p-4">
                            <SheetDescription>Details of new skill</SheetDescription>
                            <Tabs default-value="skills">
                                <TabsList class="w-full">
                                    <TabsTrigger value="skills">Skill</TabsTrigger>
                                    <TabsTrigger value="subskills">Sub Skill</TabsTrigger>
                                </TabsList>
                                <TabsContent value="skills" class="flex flex-col gap-4">
                                    <Input placeholder="Skill Name" v-model="skill.skill_name"/>
                                    <Textarea placeholder="Skill Description" class="resize-none" v-model="skill.skill_description" />
                                    <Button :disabled="isSubmitting" @click="addSkill">
                                        <Spinner v-if="isLoading" />
                                        Add Skill
                                    </Button>
                                    <Button variant="outline" @click="resetSkillForm">Reset</Button>
                                </TabsContent>
                                <TabsContent value="subskills" class="flex flex-col gap-4">
                                    <Select v-model="sub_skill.skill_id">
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a Skill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem :value="null">No Skill</SelectItem>
                                            <SelectItem v-for="skill in skills" :value="skill._id">{{ skill.skill_name }}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Sub Skill Name" v-model="sub_skill.sub_skill_name" />
                                    <Textarea placeholder="Sub Skill Description" class="resize-none" v-model="sub_skill.sub_skill_description" />
                                    <Button :disabled="isSubmitting" @click="addSubSkill">
                                        <Spinner v-if="isLoading" />
                                        Add Sub Skill
                                    </Button>
                                    <Button variant="outline" @click="resetSubSkillForm">Reset</Button>
                                </TabsContent>
                            </Tabs>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border border-slate-900 bg-white px-4 py-3 shadow-[4px_4px_0_#0f172a]">
                    <p class="text-xs uppercase tracking-[0.18em] text-slate-600">Total Skills</p>
                    <p class="mt-1.5 text-[22px] font-semibold">{{ totalSkills }}</p>
                </div>
                <div class="rounded-xl border border-slate-900 bg-white px-4 py-3 shadow-[4px_4px_0_#0f172a]">
                    <p class="text-xs uppercase tracking-[0.18em] text-slate-600">Total Subskills</p>
                    <p class="mt-1.5 text-[22px] font-semibold">{{ totalSubskills }}</p>
                </div>
                <div class="rounded-xl border border-slate-900 bg-white px-4 py-3 shadow-[4px_4px_0_#0f172a]">
                    <p class="text-xs uppercase tracking-[0.18em] text-slate-600">Total Questions</p>
                    <p class="mt-1.5 text-[22px] font-semibold">{{ totalQuestions }}</p>
                </div>
                <div class="rounded-xl border border-slate-900 bg-white px-4 py-3 shadow-[4px_4px_0_#0f172a]">
                    <p class="text-xs uppercase tracking-[0.18em] text-slate-600">Unassigned Subskills</p>
                    <p class="mt-1.5 text-[22px] font-semibold">{{ unassignedSubskills }}</p>
                </div>
            </div>

            <div class="mt-8">
                <div class="flex items-center gap-4 justify-between">
                    <p class="text-sm font-semibold text-slate-800">Skill Data Table</p>
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                        <span class="inline-block h-2 w-2 rounded-full border border-slate-900 bg-emerald-200"></span> Active
                        <span class="inline-block h-2 w-2 rounded-full border border-slate-900 bg-amber-200"></span> Pending
                    </div>
                </div>
                <div class="mt-3 overflow-x-auto rounded-lg border border-black bg-white">
                    <table class="w-full border-collapse text-sm">
                        <thead class="bg-slate-900 text-left text-white">
                            <tr>
                                <th class="border border-black px-3 py-2">S No</th>
                                <th class="border border-black px-3 py-2">Skill</th>
                                <th class="border border-black px-3 py-2">Sub Skill</th>
                                <th class="border border-black px-3 py-2">Questions</th>
                                <th class="border border-black px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(skillRow, index) in skillData" :key="skillRow.skill_id ?? skillRow.skill_name ?? index">
                                <tr>
                                    <td class="border border-black px-3 py-2 align-middle" :rowspan="Math.max(skillRow.rows?.length || 0, 1)">
                                        {{ index + 1 }}
                                    </td>
                                    <td class="border border-black px-3 py-2 align-middle" :rowspan="Math.max(skillRow.rows?.length || 0, 1)">
                                        {{ skillRow.skill_name }}
                                    </td>
                                    <td class="border border-black px-3 py-2">
                                        {{ skillRow.rows?.length ? skillRow.rows[0].sub_skill_name : '-' }}
                                    </td>
                                    <td class="border border-black px-3 py-2">
                                        {{ skillRow.rows?.length ? skillRow.rows[0].question_count : 0 }}
                                    </td>
                                    <td class="border border-black px-3 py-2">
                                        <span :class="statusClass(skillRow.rows?.length ? skillRow.rows[0].sub_skill_status : '')">
                                            {{ skillRow.rows?.length ? skillRow.rows[0].sub_skill_status : '-' }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-for="(row, rowIndex) in (skillRow.rows || []).slice(1)" :key="row.sub_skill_id ?? rowIndex">
                                    <td class="border border-black px-3 py-2">{{ row.sub_skill_name }}</td>
                                    <td class="border border-black px-3 py-2">{{ row.question_count }}</td>
                                    <td class="border border-black px-3 py-2">
                                        <span :class="statusClass(row.sub_skill_status)">{{ row.sub_skill_status }}</span>
                                    </td>
                                </tr>
                            </template>
                            <tr v-if="!skillData.length">
                                <td class="border border-black px-3 py-3 text-center" colspan="5">No data</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { PlusCircle, RefreshCcw } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import TabsContent from '~/components/ui/tabs/TabsContent.vue';
import TabsList from '~/components/ui/tabs/TabsList.vue';


definePageMeta({
    'layout': 'page',
    'middleware': 'auth'
})

const skill = ref({
    skill_name: '',
    skill_description: ''
})

const sub_skill = ref({
    skill_id: null,
    sub_skill_name: '',
    sub_skill_description: ''
})

const isSubmitting = ref(false)
const isLoading = ref(false)
const isSheetOpen = ref(false)
const skills = ref([])
const skillData = ref([])
const totalSkills = computed(() => skillData.value.filter((s) => s.skill_id).length)
const totalSubskills = computed(() =>
    skillData.value.reduce((acc, s) => acc + (s.rows?.length || 0), 0),
)
const totalQuestions = computed(() =>
    skillData.value.reduce(
        (acc, s) => acc + (s.rows || []).reduce((a, r) => a + (r.question_count || 0), 0),
        0,
    ),
)
const unassignedSubskills = computed(() => {
    const unassigned = skillData.value.find((s) => s.skill_id == null)
    return unassigned?.rows?.length || 0
})

const pageStyle = {
    background:
        'radial-gradient(800px 300px at 10% -10%, rgba(245, 158, 11, 0.25), transparent 60%),' +
        'radial-gradient(700px 260px at 90% -20%, rgba(14, 116, 144, 0.2), transparent 60%),' +
        '#f6f4ef',
    fontFamily: '"Space Grotesk","Segoe UI",system-ui,sans-serif',
}



const resetSkillForm = () => {
    skill.value = { skill_name: '', skill_description: '' }
}

const resetSubSkillForm = () => {
    sub_skill.value = { skill_id: null, sub_skill_name: '', sub_skill_description: '' }
}

const addSkill = async () => {
    isLoading.value = true
    isSubmitting.value = true

    try {
        const response = await $fetch('/api/admin/addSkill', {
            method: 'post',
            body: skill.value
        })

        isLoading.value = false
        isSubmitting.value = false

        if (response.statusCode === 200) {
            resetSubSkillForm()
            isSheetOpen.value = false
            toast.success(response.message)
            await getSkillData()
        } else {
            toast.error(response.message)
        }
    } catch (err) {
        if (err) {
            toast.error(err.message)
        }
    }
}

const addSubSkill = async ()=>{
    isLoading.value = true
    isSubmitting.value = true

    try {
        const response = await $fetch('/api/admin/addSubSkill', {
            method: 'post',
            body: sub_skill.value
        })

        isLoading.value = false
        isSubmitting.value = false

        if (response.statusCode === 200) {
            resetSkillForm()
            isSheetOpen.value = false
            toast.success(response.message)
            await getSkillData()
        } else {
            toast.error(response.message)
        }
    } catch (err) {
        if (err) {
            toast.error(err.message)
        }
    }
}

const getSkills = async () => {
    try {
        const response = await $fetch('/api/admin/skills')

        if(response) {
            skills.value = response.data
        }
    } catch (err) {
        if(err) {
            toast.error('Failed to fetch skills')
        }
    }
}

const getSkillData = async () => {
    try {
        const response = await $fetch('/api/admin/skillData')
        if (response) {
            skillData.value = response.data || []
        }
    } catch (err) {
        if (err) {
            toast.error('Failed to fetch skill data')
        }
    }
}

const refreshData = async () => {
    await getSkillData()
}

watch(isSheetOpen, async (open) => {
    if (!open) {
        resetSkillForm()
        resetSubSkillForm()
    } else {
        await getSkills()
    }
})

onMounted(async () => {
    await getSkillData()
})

const statusClass = (status) => {
    const base = 'inline-flex items-center justify-center rounded-full border border-slate-900 px-2.5 py-0.5 text-xs capitalize'
    if (!status) return `${base} bg-slate-200 text-slate-700`
    const normalized = String(status).toLowerCase()
    if (normalized === 'active') return `${base} bg-emerald-200 text-emerald-800`
    if (normalized === 'pending') return `${base} bg-amber-200 text-amber-900`
    return `${base} bg-slate-200 text-slate-700`
}


</script>
