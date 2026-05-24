<template>
  <div class="icon-picker" ref="containerRef">
    <div class="icon-input" @click="visible = !visible">
      <el-icon v-if="modelValue" class="icon-preview">
        <component :is="iconMap[modelValue]"/>
      </el-icon>
      <span v-else class="icon-placeholder">点击选择图标</span>
      <el-icon class="arrow"><ArrowDown /></el-icon>
    </div>
    <div v-if="visible" class="icon-popup">
      <div class="icon-grid">
        <div
          v-for="item in icons"
          :key="item.name"
          class="icon-item"
          :class="{ active: modelValue === item.name }"
          :title="item.label"
          @click="select(item.name)"
        >
          <el-icon :size="20">
            <component :is="iconMap[item.name]"/>
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {ArrowDown} from '@element-plus/icons-vue'
import * as Icons from '@element-plus/icons-vue'

const iconMap: Record<string, any> = Icons

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>()

const visible = ref(false)
const containerRef = ref<HTMLElement>()

const icons = [
  {name: 'Folder', label: '文件夹'},
  {name: 'FolderOpened', label: '打开文件夹'},
  {name: 'Document', label: '文档'},
  {name: 'Files', label: '多文件'},
  {name: 'Notebook', label: '笔记本'},
  {name: 'Reading', label: '阅读'},
  {name: 'Collection', label: '收藏夹'},
  {name: 'PriceTag', label: '标签'},
  {name: 'Star', label: '星标'},
  {name: 'Medal', label: '奖牌'},
  {name: 'Trophy', label: '奖杯'},
  {name: 'House', label: '首页'},
  {name: 'Monitor', label: '显示器'},
  {name: 'Platform', label: '平台'},
  {name: 'Grid', label: '网格'},
  {name: 'PieChart', label: '饼图'},
  {name: 'Message', label: '消息'},
  {name: 'User', label: '用户'},
  {name: 'VideoCamera', label: '摄像机'},
  {name: 'Picture', label: '图片'},
  {name: 'Headset', label: '耳机'},
  {name: 'Coffee', label: '咖啡'},
  {name: 'HotWater', label: '热水'},
  {name: 'IceCreamRound', label: '冰淇淋'},
  {name: 'WineGlass', label: '酒杯'},
  {name: 'Location', label: '定位'},
  {name: 'Position', label: '位置'},
  {name: 'Shop', label: '商店'},
  {name: 'School', label: '学校'},
  {name: 'Clock', label: '时钟'},
]

function select(name: string) {
  emit('update:modelValue', name === props.modelValue ? '' : name)
  visible.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    visible.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style lang="scss" scoped>
.icon-picker {
  position: relative;
  width: 100%;
}

.icon-input {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: var(--el-fill-color-blank);

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  .icon-preview {
    font-size: 18px;
    color: var(--el-text-color-primary);
  }

  .icon-placeholder {
    flex: 1;
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }

  .arrow {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.icon-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 2000;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  padding: 8px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: all 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}
</style>
