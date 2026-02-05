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
import { Calendar, FlaskConical, House } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const token = useCookie('access_token').value
const user = decodeJWT(token)
const userRole = user?.role || 'user'

const items = [
  {
    title: 'Home',
    url: {
      admin: '/admin/home',
      user: '/home',
    },
    icon: House,
  },
  {
    title: 'Lab',
    url: {
      admin: '/admin/lab',
      user: '/lab',
    },
    icon: FlaskConical,
    role: ['admin', 'user'],
  },
  {
    title: 'Drives',
    url: {
      admin: '/admin/drives',
      user: '/drives',
    },
    icon: Calendar,
    role: ['admin', 'user'],
  },
]

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
                  <NuxtLink
                    :to="userRole === 'admin' ? item.url.admin : item.url.user"
                    class="flex items-center gap-2"
                  >
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
