<template>
  <n-layout has-sider class="app-layout">
    <n-layout-sider
      v-if="!isMobile"
      bordered
      :collapsed="collapsed"
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      :native-scrollbar="false"
      style="height: 100vh"
    >
      <div class="logo">
        <span v-if="!collapsed">📚 研途智管</span>
        <span v-else>📚</span>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>
    <n-layout class="main-panel">
      <n-layout-header
        bordered
        class="app-header"
      >
        <n-space align="center" :size="8">
          <n-button
            v-if="isMobile"
            quaternary
            circle
            aria-label="打开导航菜单"
            @click="drawerVisible = true"
          >
            <template #icon>
              <n-icon><MenuOutline /></n-icon>
            </template>
          </n-button>
          <n-breadcrumb>
            <n-breadcrumb-item class="brand-breadcrumb">研途智管</n-breadcrumb-item>
            <n-breadcrumb-item>{{ currentTitle }}</n-breadcrumb-item>
          </n-breadcrumb>
        </n-space>
        <n-space align="center">
          <n-button quaternary @click="handleLogout">
            <template #icon>
              <n-icon><LogOutOutline /></n-icon>
            </template>
            <span class="logout-text">退出登录</span>
          </n-button>
        </n-space>
      </n-layout-header>
      <n-layout-content
        :content-style="isMobile ? 'padding: 16px;' : 'padding: 24px;'"
        :native-scrollbar="false"
        class="app-content"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
    <n-drawer v-model:show="drawerVisible" placement="left" :width="260">
      <n-drawer-content title="研途智管" closable body-content-style="padding: 8px 0;">
        <n-menu
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMenuSelect"
        />
      </n-drawer-content>
    </n-drawer>
  </n-layout>
</template>

<script setup lang="ts">
import { h, computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NLayoutHeader,
  NMenu,
  NIcon,
  NButton,
  NSpace,
  NBreadcrumb,
  NBreadcrumbItem,
  NDrawer,
  NDrawerContent,
  useMessage,
} from 'naive-ui'
import {
  HomeOutline,
  BookOutline,
  ListOutline,
  AlertCircleOutline,
  CalendarOutline,
  BarChartOutline,
  PersonOutline,
  InformationCircleOutline,
  LogOutOutline,
  MenuOutline,
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'
import { useStudyStore } from '@/stores/study'
import { getApiErrorMessage } from '@/api/http'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const studyStore = useStudyStore()
const collapsed = ref(false)
const drawerVisible = ref(false)
const isMobile = ref(false)
let mobileMediaQuery: MediaQueryList | null = null

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed(() => [
  {
    label: '首页仪表盘',
    key: '/dashboard',
    icon: renderIcon(HomeOutline),
  },
  {
    label: '科目管理',
    key: '/subjects',
    icon: renderIcon(BookOutline),
  },
  {
    label: '学习任务',
    key: '/tasks',
    icon: renderIcon(ListOutline),
  },
  {
    label: '错题记录',
    key: '/mistakes',
    icon: renderIcon(AlertCircleOutline),
  },
  {
    label: '学习计划',
    key: '/plans',
    icon: renderIcon(CalendarOutline),
  },
  {
    label: '数据统计',
    key: '/statistics',
    icon: renderIcon(BarChartOutline),
  },
  {
    label: '个人中心',
    key: '/profile',
    icon: renderIcon(PersonOutline),
  },
  {
    label: '项目说明',
    key: '/about',
    icon: renderIcon(InformationCircleOutline),
  },
])

const activeKey = computed(() => {
  const path = route.path
  // Match the first segment for nested routes like /tasks/123
  const match = path.match(/^\/[^/]+/)
  return match ? match[0] : '/dashboard'
})

const currentTitle = computed(() => {
  return (route.meta.title as string) || '首页'
})

function handleMenuSelect(key: string) {
  drawerVisible.value = false
  router.push(key)
}

function handleLogout() {
  userStore.logout()
  studyStore.clearStudyData()
  router.push('/login')
}

function syncMobileLayout(event?: MediaQueryListEvent) {
  isMobile.value = event?.matches ?? mobileMediaQuery?.matches ?? false
  if (!isMobile.value) {
    drawerVisible.value = false
  }
}

onMounted(async () => {
  mobileMediaQuery = window.matchMedia('(max-width: 768px)')
  syncMobileLayout()
  mobileMediaQuery.addEventListener('change', syncMobileLayout)

  // 页面刷新后使用本地 JWT 恢复用户信息和全部学习数据。
  try {
    await Promise.all([
      userStore.fetchProfile(),
      studyStore.fetchAll(),
    ])
  } catch (error) {
    message.error(getApiErrorMessage(error, '数据加载失败，请重新登录'))
  }
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', syncMobileLayout)
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.main-panel {
  min-width: 0;
}

.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px;
}

.app-content {
  height: calc(100vh - 60px);
  min-width: 0;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #2080f0;
  border-bottom: 1px solid #efeff5;
  white-space: nowrap;
  overflow: hidden;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }

  .brand-breadcrumb,
  .logout-text {
    display: none;
  }
}
</style>
