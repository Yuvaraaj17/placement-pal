<script setup>
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const user = useCookie('access_token')

if (user.value) {
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/home',
    },
  })
}

const goToLogin = () => {
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/login',
    },
  })
}

const goToSignup = () => {
  navigateTo({
    path: '/redirect',
    query: {
      redirect: '/signup',
    },
  })
}
</script>

<template>
  <div class="landing relative min-h-screen overflow-hidden text-slate-900">
    <div class="ambient absolute inset-0 -z-10">
      <div class="orb orb-amber"></div>
      <div class="orb orb-teal"></div>
      <div class="grid-lines"></div>
    </div>

    <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
      <div class="flex items-center gap-3">
        <div class="logo-grid">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Placement Pal</p>
          <p class="text-lg font-semibold text-slate-900">AURCC Career Hub</p>
        </div>
      </div>
      <div class="hidden items-center gap-3 md:flex">
        <Button variant="outline" size="sm" class="px-4" @click="goToLogin">Log in</Button>
        <Button size="sm" class="px-4" @click="goToSignup">
          Get Started
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 md:pt-16">
      <section class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div class="space-y-6">
          <div class="badge inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs uppercase tracking-[0.2em] text-amber-900">
            <Sparkles class="h-4 w-4" />
            Built for placement readiness
          </div>
          <h1 class="hero-title text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Turn placement chaos into a
            <span class="hero-emphasis">calm, confident plan</span>.
          </h1>
          <p class="text-base text-slate-600 md:text-lg">
            Placement Pal keeps students, trainers, and coordinators aligned with curated skills,
            live drives, and a structured question bank. Everything you need to track readiness,
            spot gaps, and move faster together.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <Button class="px-6" @click="goToSignup">
              Start Preparing
              <ArrowRight class="h-4 w-4" />
            </Button>
            <Button variant="outline" class="px-6" @click="goToLogin">View Drives</Button>
          </div>
          <div class="flex flex-wrap gap-6 pt-3 text-sm text-slate-500">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Coverage</p>
              <p class="text-lg font-semibold text-slate-900">Skills + Subskills</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Drives</p>
              <p class="text-lg font-semibold text-slate-900">Live & Upcoming</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Question Bank</p>
              <p class="text-lg font-semibold text-slate-900">Structured Practice</p>
            </div>
          </div>
        </div>

        <div class="hero-card rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <div class="flex items-center justify-between">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Placement Pulse</p>
            <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              Active
            </span>
          </div>
          <div class="mt-6 space-y-4">
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">Readiness Snapshot</p>
              <p class="mt-2 text-sm text-slate-500">
                Track coverage, active skills, and question bank growth in one place.
              </p>
              <div class="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span class="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                Skills mapped
                <span class="inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
                Pending assessments
              </div>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
              <p class="text-sm font-semibold text-slate-900">Upcoming Focus</p>
              <div class="mt-3 grid gap-3 text-sm text-slate-600">
                <div class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-500" />
                  Aptitude: Arrays, DP, and Patterns
                </div>
                <div class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-500" />
                  Company-specific mock rounds
                </div>
                <div class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-500" />
                  Resume & HR checkpoints
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-16 grid gap-6 md:grid-cols-3">
        <div class="feature-card">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Skill Map</p>
          <p class="mt-3 text-lg font-semibold text-slate-900">Every topic accounted for</p>
          <p class="mt-2 text-sm text-slate-600">
            Build a structured map of skills, subskills, and questions with real-time status tracking.
          </p>
        </div>
        <div class="feature-card">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Drive Calendar</p>
          <p class="mt-3 text-lg font-semibold text-slate-900">Never miss a deadline</p>
          <p class="mt-2 text-sm text-slate-600">
            Push drives to eligible students, capture responses, and share updates instantly.
          </p>
        </div>
        <div class="feature-card">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Question Bank</p>
          <p class="mt-3 text-lg font-semibold text-slate-900">Practice that scales</p>
          <p class="mt-2 text-sm text-slate-600">
            Import question sets by skill and difficulty. Spot gaps fast and train with purpose.
          </p>
        </div>
      </section>

      <section class="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">How it works</p>
          <p class="mt-3 text-xl font-semibold text-slate-900">A clear flow from planning to placement</p>
          <div class="mt-5 grid gap-4 text-sm text-slate-600">
            <div class="flex items-start gap-3">
              <span class="step">1</span>
              Map skills, subskills, and question banks together.
            </div>
            <div class="flex items-start gap-3">
              <span class="step">2</span>
              Track readiness while drives and challenges roll in.
            </div>
            <div class="flex items-start gap-3">
              <span class="step">3</span>
              Share insights with students and coordinators quickly.
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)]">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Teams love</p>
          <p class="mt-3 text-xl font-semibold">Visibility without the noise</p>
          <p class="mt-3 text-sm text-slate-300">
            “Placement Pal keeps everything in one place. Students know what to practice, and admins
            instantly see where support is needed.”
          </p>
          <div class="mt-6 flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-white/10"></div>
            <div>
              <p class="text-sm font-semibold">Placement Office</p>
              <p class="text-xs text-slate-400">AURCC</p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta mt-16 rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Ready to launch</p>
        <h2 class="mt-3 text-3xl font-semibold text-slate-900">Start building your placement edge</h2>
        <p class="mt-2 text-sm text-slate-600">
          Sign in to manage skills, unlock drives, and grow the question bank together.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <Button class="px-6" @click="goToSignup">Create account</Button>
          <Button variant="outline" class="px-6" @click="goToLogin">Log in</Button>
        </div>
      </section>
    </main>

    <footer class="mx-auto w-full max-w-6xl px-6 pb-10 pt-6 text-xs text-slate-500">
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p>Placement Pal · AURCC</p>
        <p>Built for structured preparation and confident outcomes.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');

:global(:root) {
  --landing-ink: #0f172a;
  --landing-muted: #5b677c;
  --landing-amber: #f59e0b;
  --landing-teal: #0f766e;
  --landing-cream: #f8f5ef;
}

.landing {
  font-family: 'Space Grotesk', 'Sora', system-ui, sans-serif;
  background: var(--landing-cream);
}

.hero-title {
  font-family: 'Sora', 'Space Grotesk', system-ui, sans-serif;
}

.hero-emphasis {
  background: linear-gradient(120deg, rgba(245, 158, 11, 0.22), rgba(15, 118, 110, 0.2));
  box-decoration-break: clone;
  padding: 0 0.35rem;
  border-radius: 0.4rem;
}

.feature-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.badge {
  font-family: 'Space Grotesk', system-ui, sans-serif;
}

.step {
  height: 1.7rem;
  width: 1.7rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 118, 110, 0.12);
  color: var(--landing-teal);
  font-weight: 600;
  font-size: 0.85rem;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(2, 10px);
  gap: 4px;
}

.logo-grid span {
  height: 10px;
  width: 10px;
  border-radius: 3px;
  background: linear-gradient(135deg, var(--landing-amber), var(--landing-teal));
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.16);
}

.ambient {
  background: radial-gradient(900px 360px at 15% -5%, rgba(245, 158, 11, 0.18), transparent 60%),
    radial-gradient(800px 340px at 85% -10%, rgba(15, 118, 110, 0.18), transparent 60%);
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.6;
  animation: float 10s ease-in-out infinite;
}

.orb-amber {
  height: 200px;
  width: 200px;
  top: 18%;
  left: -60px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent 70%);
}

.orb-teal {
  height: 240px;
  width: 240px;
  bottom: 10%;
  right: -80px;
  background: radial-gradient(circle, rgba(15, 118, 110, 0.55), transparent 70%);
  animation-delay: 2s;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(circle at top, black 30%, transparent 70%);
  opacity: 0.6;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
</style>
