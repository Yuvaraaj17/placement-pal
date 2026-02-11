<script setup>
import { BookOpen, Calendar, Flame, Target, Trophy } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'page',
  middleware: 'auth',
})
</script>

<template>
  <div class="home-page w-full p-5">
    <section class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
      <div class="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl"></div>
      <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-3">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Student Dashboard</p>
          <h1 class="text-3xl font-semibold text-slate-900 md:text-4xl">
            Welcome back to Placement Pal.
          </h1>
          <p class="max-w-xl text-sm text-slate-600 md:text-base">
            Stay on top of your placement prep with curated skills, live drives, and guided practice.
          </p>
          <div class="flex flex-wrap gap-3">
            <Button class="px-5">
              <BookOpen class="h-4 w-4" />
              Practice Questions
            </Button>
            <Button variant="outline" class="px-5">
              <Calendar class="h-4 w-4" />
              View Drives
            </Button>
          </div>
        </div>
        <div class="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm shadow-sm">
          <div class="flex items-center justify-between gap-6">
            <span class="text-slate-500">Preparation streak</span>
            <span class="font-semibold text-slate-900">7 days</span>
          </div>
          <div class="flex items-center justify-between gap-6">
            <span class="text-slate-500">Upcoming drives</span>
            <span class="font-semibold text-slate-900">3 active</span>
          </div>
          <div class="flex items-center justify-between gap-6">
            <span class="text-slate-500">Skill coverage</span>
            <span class="font-semibold text-emerald-600">68%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-8 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Target class="h-4 w-4 text-amber-500" />
          Focus today
        </div>
        <p class="mt-2 text-sm text-slate-600">Arrays, recursion, and two-pointer patterns.</p>
        <div class="mt-4 h-2 w-full rounded-full bg-slate-100">
          <div class="h-2 w-2/3 rounded-full bg-amber-400"></div>
        </div>
        <p class="mt-2 text-xs text-slate-400">2 of 3 topics covered</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Flame class="h-4 w-4 text-rose-500" />
          Weekly momentum
        </div>
        <p class="mt-2 text-sm text-slate-600">Keep your streak alive with 15 mins practice.</p>
        <div class="mt-4 flex gap-2">
          <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
          <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
          <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
          <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
          <span class="h-3 w-3 rounded-full bg-amber-300"></span>
          <span class="h-3 w-3 rounded-full bg-slate-200"></span>
          <span class="h-3 w-3 rounded-full bg-slate-200"></span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Trophy class="h-4 w-4 text-emerald-500" />
          Next milestone
        </div>
        <p class="mt-2 text-sm text-slate-600">Complete 10 medium questions this week.</p>
        <Button variant="outline" class="mt-4 w-full">Open Plan</Button>
      </div>
    </section>

    <section class="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Upcoming drives</h2>
          <Button variant="ghost" class="text-sm">View all</Button>
        </div>
        <div class="mt-4 grid gap-3">
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-slate-900">TechNova</span>
              <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Live</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">Software Engineer · Feb 18</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-slate-900">Orion Systems</span>
              <span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Upcoming</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">Analyst · Feb 22</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-slate-900">Pulse Labs</span>
              <span class="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Scheduled</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">Full Stack · Mar 02</p>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Practice checklist</h2>
        <div class="mt-4 space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <span>Mock interview round</span>
            <span class="text-emerald-600">Done</span>
          </div>
          <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <span>Resume review</span>
            <span class="text-amber-600">Pending</span>
          </div>
          <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <span>Behavioral questions</span>
            <span class="text-amber-600">Pending</span>
          </div>
          <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <span>Company research</span>
            <span class="text-amber-600">Pending</span>
          </div>
        </div>
        <Button class="mt-5 w-full">Update checklist</Button>
      </div>
    </section>
  </div>
</template>
