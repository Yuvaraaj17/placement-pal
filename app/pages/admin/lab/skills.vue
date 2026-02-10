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
                    <Sheet :open="isEditSheetOpen" @update:open="handleEditSheetOpenChange">
                        <SheetTrigger>
                            <Button variant="outline" size="sm" class="gap-2">
                                <Pencil :size="14" />
                                Edit
                            </Button>
                        </SheetTrigger>
                        <SheetContent class="p-4">
                            <SheetDescription>Edit skill details and linked sub skills</SheetDescription>
                            <Tabs default-value="skills">
                                <TabsList class="w-full">
                                    <TabsTrigger value="skills">Skill</TabsTrigger>
                                    <TabsTrigger value="subskills">Sub Skill</TabsTrigger>
                                </TabsList>
                                <TabsContent value="skills" class="flex flex-col gap-4">
                                    <Select v-model="editSkillId">
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a Skill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="skill in skills" :key="skill._id" :value="skill._id">
                                                {{ skill.skill_name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Skill Code" v-model="editSkillForm.skill_code" disabled />
                                    <Input
                                        placeholder="Skill Name"
                                        v-model="editSkillForm.skill_name"
                                        :disabled="!editSkillId"
                                    />
                                    <Textarea
                                        placeholder="Skill Description"
                                        class="resize-none"
                                        v-model="editSkillForm.skill_description"
                                        :disabled="!editSkillId"
                                    />
                                    <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                        <div>
                                            <p class="text-sm font-medium text-slate-800">Skill Status</p>
                                            <p class="text-xs text-slate-500">Toggle to activate or deactivate {{ editSkillForm.skill_status }}</p>
                                        </div>
                                        <Switch v-model="editSkillForm.skill_status" :disabled="!editSkillId" />
                                    </div>
                                    <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Linked Sub Skills</p>
                                        <div v-if="!editSkillId" class="mt-2 text-sm text-slate-500">
                                            Select a skill to view linked sub skills.
                                        </div>
                                        <div v-else-if="!linkedSubSkills.length" class="mt-2 text-sm text-slate-500">
                                            No sub skills linked.
                                        </div>
                                        <div v-else class="mt-2 flex flex-wrap gap-2">
                                            <div
                                                v-for="sub in linkedSubSkills"
                                                :key="sub._id"
                                                class="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs"
                                            >
                                                <span class="max-w-[160px] truncate">{{ sub.sub_skill_name }}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon-sm"
                                                    class="h-6 w-6"
                                                    :disabled="!editSkillId"
                                                    @click="unlinkSubSkill(sub._id)"
                                                >
                                                    <X :size="12" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Select
                                            v-model="editLinkSubSkillId"
                                            :disabled="!editSkillId || !availableUnassignedSubSkills.length"
                                        >
                                            <SelectTrigger class="w-full">
                                                <SelectValue placeholder="Link a sub skill" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    v-for="sub in availableUnassignedSubSkills"
                                                    :key="sub._id"
                                                    :value="sub._id"
                                                >
                                                    {{ sub.sub_skill_name }}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            :disabled="!editSkillId || !editLinkSubSkillId"
                                            @click="linkSelectedSubSkill"
                                        >
                                            Link
                                        </Button>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Button
                                            :disabled="!editSkillId || isEditSaving || !isSkillDirty"
                                            @click="saveSkillEdits"
                                        >
                                            <Spinner v-if="isEditSaving" />
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            :disabled="!editSkillId || !isSkillDirty"
                                            @click="resetEditSelection"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="subskills" class="flex flex-col gap-4">
                                    <Select v-model="editSubSkillId">
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a Sub Skill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="sub in allSubSkills" :key="sub._id" :value="sub._id">
                                                {{ sub.sub_skill_name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Sub Skill Code" v-model="editSubSkillForm.sub_skill_code" disabled />
                                    <Input
                                        placeholder="Sub Skill Name"
                                        v-model="editSubSkillForm.sub_skill_name"
                                        :disabled="!editSubSkillId"
                                    />
                                    <Textarea
                                        placeholder="Sub Skill Description"
                                        class="resize-none"
                                        v-model="editSubSkillForm.sub_skill_description"
                                        :disabled="!editSubSkillId"
                                    />
                                    <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                        <div>
                                            <p class="text-sm font-medium text-slate-800">Sub Skill Status</p>
                                            <p class="text-xs text-slate-500">Toggle to activate or deactivate</p>
                                        </div>
                                        <Switch v-model="editSubSkillForm.sub_skill_status" :disabled="!editSubSkillId" />
                                    </div>
                                    <Select v-model="editSubSkillForm.skill_id" :disabled="!editSubSkillId">
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Linked Skill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem :value="null">No Skill</SelectItem>
                                            <SelectItem v-for="skill in skills" :key="skill._id" :value="skill._id">
                                                {{ skill.skill_name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div class="flex items-center gap-2">
                                        <Button
                                            :disabled="!editSubSkillId || isSubSkillSaving || !isSubSkillDirty"
                                            @click="saveSubSkillEdits"
                                        >
                                            <Spinner v-if="isSubSkillSaving" />
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            :disabled="!editSubSkillId || !isSubSkillDirty"
                                            @click="resetSubSkillSelection"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </SheetContent>
                    </Sheet>
                    <Sheet :open="isImportSheetOpen" @update:open="handleImportSheetOpenChange">
                        <SheetTrigger>
                            <Button variant="outline" size="sm" class="gap-2">
                                <Upload :size="14" />
                                Import
                            </Button>
                        </SheetTrigger>
                        <SheetContent class="p-4">
                            <SheetDescription>Import questions from JSON</SheetDescription>
                            <div class="flex flex-col gap-4">
                                <Select v-model="importSkillId">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="Select a Skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="skill in skills" :key="skill._id" :value="skill._id">
                                            {{ skill.skill_name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select v-model="importSubSkillId" :disabled="!importSkillId || !importSubSkills.length">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="Select a Sub Skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="sub in importSubSkills" :key="sub._id" :value="sub._id">
                                            {{ sub.sub_skill_name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <div class="rounded-lg border border-slate-200 bg-white px-3 py-3">
                                    <p class="text-sm font-medium text-slate-800">Upload JSON File</p>
                                    <p class="mt-1 text-xs text-slate-500">
                                        JSON array or JSON lines with required fields.
                                    </p>
                                    <input
                                        ref="importFileInput"
                                        type="file"
                                        accept=".json,application/json"
                                        class="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.2em] file:text-white hover:file:bg-slate-800"
                                        @change="handleImportFileChange"
                                    />
                                    <p v-if="importFileName" class="mt-2 text-xs text-slate-600">
                                        Selected: {{ importFileName }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Button :disabled="!canImportQuestions" @click="importQuestions">
                                        <Spinner v-if="isImporting" />
                                        Import Questions
                                    </Button>
                                    <Button variant="outline" :disabled="isImporting" @click="resetImportForm">
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
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
                        <span class="inline-block h-2 w-2 rounded-full border border-slate-900 bg-amber-200"></span> Inactive
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
import { Pencil, PlusCircle, RefreshCcw, Upload, X } from 'lucide-vue-next';
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
const isEditSheetOpen = ref(false)
const isEditSaving = ref(false)
const isSubSkillSaving = ref(false)
const isImportSheetOpen = ref(false)
const isImporting = ref(false)
const skills = ref([])
const allSubSkills = ref([])
const skillData = ref([])
const editSkillId = ref(null)
const editSkillForm = ref({
    skill_code: '',
    skill_name: '',
    skill_description: '',
    skill_status: false
})
const editOriginalForm = ref({
    skill_code: '',
    skill_name: '',
    skill_description: '',
    skill_status: false
})
const editLinkedSubSkillIds = ref([])
const editOriginalLinkedSubSkillIds = ref([])
const editLinkSubSkillId = ref(null)
const editSubSkillId = ref(null)
const editSubSkillForm = ref({
    sub_skill_code: '',
    sub_skill_name: '',
    sub_skill_description: '',
    skill_id: null,
    sub_skill_status: false
})
const editSubSkillOriginalForm = ref({
    sub_skill_code: '',
    sub_skill_name: '',
    sub_skill_description: '',
    skill_id: null,
    sub_skill_status: false
})
const importSkillId = ref(null)
const importSubSkillId = ref(null)
const importFile = ref(null)
const importFileName = ref('')
const importFileInput = ref(null)
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
const subSkillById = computed(() => {
    return new Map(allSubSkills.value.map((sub) => [sub._id, sub]))
})
const linkedSubSkills = computed(() =>
    editLinkedSubSkillIds.value
        .map((id) => subSkillById.value.get(id))
        .filter((item) => item),
)
const availableUnassignedSubSkills = computed(() =>
    allSubSkills.value.filter(
        (sub) =>
            (!sub.skill_id || sub.skill_id === 'null') &&
            !editLinkedSubSkillIds.value.includes(sub._id),
    ),
)
const isSkillDirty = computed(() => {
    if (!editSkillId.value) return false
    if (editSkillForm.value.skill_name !== editOriginalForm.value.skill_name) return true
    if (editSkillForm.value.skill_description !== editOriginalForm.value.skill_description) return true
    if (editSkillForm.value.skill_status !== editOriginalForm.value.skill_status) return true
    const currentIds = new Set(editLinkedSubSkillIds.value)
    if (editOriginalLinkedSubSkillIds.value.length !== currentIds.size) return true
    return editOriginalLinkedSubSkillIds.value.some((id) => !currentIds.has(id))
})

const isSubSkillDirty = computed(() => {
    if (!editSubSkillId.value) return false
    if (editSubSkillForm.value.sub_skill_name !== editSubSkillOriginalForm.value.sub_skill_name) return true
    if (editSubSkillForm.value.sub_skill_description !== editSubSkillOriginalForm.value.sub_skill_description)
        return true
    if (String(editSubSkillForm.value.skill_id || '') !== String(editSubSkillOriginalForm.value.skill_id || ''))
        return true
    if (editSubSkillForm.value.sub_skill_status !== editSubSkillOriginalForm.value.sub_skill_status) return true
    return false
})

const isEditDirty = computed(() => isSkillDirty.value || isSubSkillDirty.value)
const importSubSkills = computed(() =>
    allSubSkills.value.filter(
        (sub) => String(sub.skill_id || '') === String(importSkillId.value || ''),
    ),
)
const canImportQuestions = computed(
    () =>
        Boolean(importFile.value) &&
        Boolean(importSkillId.value) &&
        Boolean(importSubSkillId.value) &&
        !isImporting.value,
)

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

const clearEditState = () => {
    editSkillId.value = null
    editSkillForm.value = { skill_code: '', skill_name: '', skill_description: '', skill_status: false }
    editOriginalForm.value = { skill_code: '', skill_name: '', skill_description: '', skill_status: false }
    editLinkedSubSkillIds.value = []
    editOriginalLinkedSubSkillIds.value = []
    editLinkSubSkillId.value = null
}

const clearSubSkillEditState = () => {
    editSubSkillId.value = null
    editSubSkillForm.value = {
        sub_skill_code: '',
        sub_skill_name: '',
        sub_skill_description: '',
        skill_id: null,
        sub_skill_status: false
    }
    editSubSkillOriginalForm.value = {
        sub_skill_code: '',
        sub_skill_name: '',
        sub_skill_description: '',
        skill_id: null,
        sub_skill_status: false
    }
}

const resetImportForm = () => {
    importSkillId.value = null
    importSubSkillId.value = null
    importFile.value = null
    importFileName.value = ''
    isImporting.value = false
    if (importFileInput.value) {
        importFileInput.value.value = ''
    }
}

const normalizeSkillStatus = (value) => {
    if (value === false || value === 0 || value === 'false') return false
    if (value === true || value === 1 || value === 'true') return true
    return true
}

const normalizeNullableId = (value) => {
    if (value === null || value === undefined || value === '' || value === 'null') return null
    return String(value)
}

const setEditSkill = (skillId) => {
    const selectedSkill = skills.value.find((item) => String(item._id) === String(skillId))
    console.log(skills)
    console.log(selectedSkill.skill_status)
    if (!selectedSkill) {
        clearEditState()
        return
    }

    const formState = {
        skill_code: selectedSkill.skill_code ?? '',
        skill_name: selectedSkill.skill_name ?? '',
        skill_description: selectedSkill.skill_description ?? '',
        skill_status: normalizeSkillStatus(selectedSkill.skill_status)
    }

    editSkillForm.value = { ...formState }
    console.log(editSkillForm.value, "edit skill form")
    editOriginalForm.value = { ...formState }

    const linkedIds = allSubSkills.value
        .filter((sub) => String(sub.skill_id || '') === String(skillId))
        .map((sub) => String(sub._id))

    editLinkedSubSkillIds.value = [...linkedIds]
    editOriginalLinkedSubSkillIds.value = [...linkedIds]
    editLinkSubSkillId.value = null
}

const resetEditSelection = () => {
    if (!editSkillId.value) return
    editSkillForm.value = { ...editOriginalForm.value }
    editLinkedSubSkillIds.value = [...editOriginalLinkedSubSkillIds.value]
    editLinkSubSkillId.value = null
}

const resetSubSkillSelection = () => {
    if (!editSubSkillId.value) return
    editSubSkillForm.value = { ...editSubSkillOriginalForm.value }
}

const linkSelectedSubSkill = () => {
    if (!editLinkSubSkillId.value) return
    const selectedId = String(editLinkSubSkillId.value)
    if (!editLinkedSubSkillIds.value.includes(selectedId)) {
        editLinkedSubSkillIds.value = [...editLinkedSubSkillIds.value, selectedId]
    }
    editLinkSubSkillId.value = null
}

const unlinkSubSkill = (subSkillId) => {
    const targetId = String(subSkillId)
    editLinkedSubSkillIds.value = editLinkedSubSkillIds.value.filter((id) => id !== targetId)
}

const setEditSubSkill = (subSkillId) => {
    const selectedSubSkill = allSubSkills.value.find((item) => String(item._id) === String(subSkillId))
    if (!selectedSubSkill) {
        clearSubSkillEditState()
        return
    }

    const formState = {
        sub_skill_code: selectedSubSkill.sub_skill_code ?? '',
        sub_skill_name: selectedSubSkill.sub_skill_name ?? '',
        sub_skill_description: selectedSubSkill.sub_skill_description ?? '',
        skill_id: normalizeNullableId(selectedSubSkill.skill_id),
        sub_skill_status: normalizeSkillStatus(selectedSubSkill.sub_skill_status)
    }

    editSubSkillForm.value = { ...formState }
    editSubSkillOriginalForm.value = { ...formState }
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

const saveSkillEdits = async () => {
    if (!editSkillId.value) return
    if (!editSkillForm.value.skill_name?.trim()) {
        toast.error('Skill name is required')
        return
    }

    if (editLinkSubSkillId.value) {
        const pendingId = String(editLinkSubSkillId.value)
        if (!editLinkedSubSkillIds.value.includes(pendingId)) {
            editLinkedSubSkillIds.value = [...editLinkedSubSkillIds.value, pendingId]
        }
        editLinkSubSkillId.value = null
    }

    isEditSaving.value = true

    const currentIds = new Set(editLinkedSubSkillIds.value)
    const originalIds = new Set(editOriginalLinkedSubSkillIds.value)
    const linkIds = Array.from(currentIds).filter((id) => !originalIds.has(id))
    const unlinkIds = editOriginalLinkedSubSkillIds.value.filter((id) => !currentIds.has(id))

    try {
                const response = await $fetch('/api/admin/updateSkill', {
            method: 'post',
            body: {
                skill_id: editSkillId.value,
                skill_name: editSkillForm.value.skill_name,
                skill_description: editSkillForm.value.skill_description,
                skill_status: editSkillForm.value.skill_status,
                linked_sub_skill_ids: editLinkedSubSkillIds.value,
                link_sub_skill_ids: linkIds,
                unlink_sub_skill_ids: unlinkIds
            }
        })

        if (response?.statusCode === 200) {
            toast.success(response.message)
            await Promise.all([getSkills(), getSubSkills(), getSkillData()])
            setEditSkill(editSkillId.value)
        } else {
            toast.error(response?.message || 'Failed to update skill')
        }
    } catch (err) {
        if (err) {
            toast.error(err.message)
        }
    } finally {
        isEditSaving.value = false
    }
}

const saveSubSkillEdits = async () => {
    if (!editSubSkillId.value) return
    if (!editSubSkillForm.value.sub_skill_name?.trim()) {
        toast.error('Sub skill name is required')
        return
    }

    isSubSkillSaving.value = true

    try {
        const response = await $fetch('/api/admin/updateSubSkill', {
            method: 'post',
            body: {
                sub_skill_id: editSubSkillId.value,
                sub_skill_name: editSubSkillForm.value.sub_skill_name,
                sub_skill_description: editSubSkillForm.value.sub_skill_description,
                skill_id: normalizeNullableId(editSubSkillForm.value.skill_id),
                sub_skill_status: editSubSkillForm.value.sub_skill_status
            }
        })

        if (response?.statusCode === 200) {
            toast.success(response.message)
            await Promise.all([getSkills(), getSubSkills(), getSkillData()])
            if (editSkillId.value) {
                setEditSkill(editSkillId.value)
            }
            setEditSubSkill(editSubSkillId.value)
        } else {
            toast.error(response?.message || 'Failed to update sub skill')
        }
    } catch (err) {
        if (err) {
            toast.error(err.message)
        }
    } finally {
        isSubSkillSaving.value = false
    }
}


const handleImportFileChange = (event) => {
    const file = event?.target?.files?.[0]
    if (!file) {
        importFile.value = null
        importFileName.value = ''
        return
    }
    importFile.value = file
    importFileName.value = file.name
}

const importQuestions = async () => {
    if (!canImportQuestions.value) return
    if (!importFile.value) return

    isImporting.value = true

    try {
        const fileContents = await importFile.value.text()
        const response = await $fetch('/api/admin/importQuestions', {
            method: 'post',
            body: {
                skill_id: importSkillId.value,
                sub_skill_id: importSubSkillId.value,
                file_contents: fileContents,
            },
        })

        if (response?.statusCode === 200) {
            toast.success(response.message)
            await getSkillData()
            resetImportForm()
            isImportSheetOpen.value = false
        } else {
            toast.error(response?.message || 'Failed to import questions')
        }
    } catch (err) {
        if (err) {
            toast.error(err.message)
        }
    } finally {
        isImporting.value = false
    }
}

const getSkills = async () => {
    try {
        const response = await $fetch('/api/admin/skills')

        if(response) {
            skills.value = (response.data || []).map((item) => ({
                ...item,
                skill_status: normalizeSkillStatus(item.skill_status),
            }))
        }
    } catch (err) {
        if(err) {
            toast.error('Failed to fetch skills')
        }
    }
}

const getSubSkills = async () => {
    try {
        const response = await $fetch('/api/admin/subskills')
        if (response) {
            allSubSkills.value = (response.data || []).map((item) => ({
                ...item,
                sub_skill_status: normalizeSkillStatus(item.sub_skill_status),
            }))
        }
    } catch (err) {
        if (err) {
            toast.error('Failed to fetch sub skills')
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

const handleEditSheetOpenChange = async (open) => {
    if (!open && isEditDirty.value) {
        const shouldClose =
            typeof window === 'undefined'
                ? true
                : window.confirm('You have unsaved changes. Discard them?')
        if (!shouldClose) {
            isEditSheetOpen.value = true
            return
        }
    }

    isEditSheetOpen.value = open

    if (!open) {
        clearEditState()
        clearSubSkillEditState()
        return
    }

    await Promise.all([getSkills(), getSubSkills()])
}

const handleImportSheetOpenChange = async (open) => {
    isImportSheetOpen.value = open
    if (!open) {
        resetImportForm()
        return
    }

    await Promise.all([getSkills(), getSubSkills()])
}

watch(isSheetOpen, async (open) => {
    if (!open) {
        resetSkillForm()
        resetSubSkillForm()
    } else {
        await getSkills()
    }
})

watch(editSkillId, (value) => {
    if (!value) {
        clearEditState()
        return
    }
    setEditSkill(value)
})

watch(editSubSkillId, (value) => {
    if (!value) {
        clearSubSkillEditState()
        return
    }
    setEditSubSkill(value)
})

watch(importSkillId, () => {
    importSubSkillId.value = null
})

onMounted(async () => {
    await getSkillData()
})

const statusClass = (status) => {
    const base = 'inline-flex items-center justify-center rounded-full border border-slate-900 px-2.5 py-0.5 text-xs capitalize'
    if (!status) return `${base} bg-slate-200 text-slate-700`
    if (typeof status === 'boolean') {
        return status ? `${base} bg-emerald-200 text-emerald-800` : `${base} bg-rose-200 text-rose-800`
    }
    const normalized = String(status).toLowerCase()
    if (normalized === 'active') return `${base} bg-emerald-200 text-emerald-800`
    if (normalized === 'inactive') return `${base} bg-rose-200 text-rose-800`
    return `${base} bg-slate-200 text-slate-700`
}


</script>
