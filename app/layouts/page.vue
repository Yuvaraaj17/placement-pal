<script setup>
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { BookOpen, Calendar, FileText, FlaskConical, House } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const token = useCookie('access_token').value
const user = decodeJWT(token)
const userRole = user?.role || 'student'

const adminItems = [
  {
    title: 'Home',
    url: '/admin/home',
    icon: House,
  },
  {
    title: 'Lab',
    url: '/admin/lab',
    icon: FlaskConical,
  },
  {
    title: 'Drives',
    url: '/admin/drives',
    icon: Calendar,
  },
]

const studentItems = [
  {
    title: 'Home',
    url: '/home',
    icon: House,
  },
  {
    title: 'Practice',
    url: '/lab',
    icon: BookOpen,
  },
  {
    title: 'Resume Vault',
    url: '/resumevault',
    icon: FileText,
  },
  {
    title: 'Drives',
    url: '/drives',
    icon: Calendar,
  },
]

const items = computed(() => (userRole === 'admin' ? adminItems : studentItems))

const logout = async () => {
  const response = await $fetch('/api/auth/logout', {
    method: 'post',
    body: {},
  })

  setTimeout(() => {
    if (response.statusCode !== 200) {
      toast.error('Error logging in: ' + response.message) // Show error toast
    } else {
      toast.success('Logged out!') // Show success toast
      setTimeout(() => {
        navigateTo({
          path: '/redirect',
          query: {
            redirect: '/login',
          },
        })
      }, 1000) // Redirect after a short delay, so user can see the success toast
    }
  }, 1000)
}
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <span class="rounded-md bg-slate-50 p-3 shadow">Welcome Yuvaraaj</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem v-for="item in items" :key="item.title">
                  <SidebarMenuButton as-child>
                  <NuxtLink :to="item.url" class="flex items-center gap-2">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter
        ><span class="rounded-md bg-slate-50 p-3 shadow" @click="logout"
          >Logout</span
        ></SidebarFooter
      >
    </Sidebar>
    <slot />
  </SidebarProvider>
</template>
