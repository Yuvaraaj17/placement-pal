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
import { Calendar, FlaskConical, House, LayoutDashboard } from 'lucide-vue-next'

const items = [
  {
    title: 'Home',
    url: '/home',
    icon: House,
  },
  {
    title: 'Lab',
    url: '/lab',
    icon: FlaskConical,
  },
  {
    title: 'Drives',
    url: '/drive',
    icon: Calendar,
  },
]
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
    </Sidebar>
    <slot />
  </SidebarProvider>
</template>
