<template>
  <div class="calendar-panel">
    <!-- Header with month navigation -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth" title="上一月">◀</button>
      <span class="month-label">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
      <button class="nav-btn" @click="nextMonth" title="下一月">▶</button>
    </div>

    <!-- Weekday headers -->
    <div class="calendar-weekdays">
      <span v-for="day in weekdays" :key="day" class="weekday-cell">{{ day }}</span>
    </div>

    <!-- Date grid -->
    <div class="calendar-grid">
      <div
        v-for="(cell, index) in calendarCells"
        :key="index"
        class="date-cell"
        :class="{
          'empty': !cell.day,
          'has-data': cell.hasData,
          'is-today': cell.isToday,
          'is-selected': cell.isSelected,
        }"
        @click="cell.day && handleDateClick(cell.dateStr)"
      >
        <span v-if="cell.day" class="date-number">{{ cell.day }}</span>
        <span v-if="cell.hasData" class="data-badge">{{ cell.dataCount }}</span>
      </div>
    </div>

    <!-- Legend + Clear -->
    <div class="calendar-footer">
      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot legend-dot--empty"></span>
          无数据
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-dot--has-data"></span>
          有数据
        </span>
      </div>
      <button
        v-if="selectedDate"
        class="clear-btn"
        @click="handleClear"
      >
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  articleDates: Record<string, number>
  selectedDate?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedDate: null,
})

const emit = defineEmits<{
  select: [date: string | null]
}>()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

interface CalendarCell {
  day: number | null
  dateStr: string
  hasData: boolean
  dataCount: number
  isToday: boolean
  isSelected: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  const cells: CalendarCell[] = []

  // Fill leading empty cells
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({
      day: null,
      dateStr: '',
      hasData: false,
      dataCount: 0,
      isToday: false,
      isSelected: false,
    })
  }

  // Fill day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day)
    const dataCount = props.articleDates[dateStr] || 0
    cells.push({
      day,
      dateStr,
      hasData: dataCount > 0,
      dataCount,
      isToday: dateStr === todayStr,
      isSelected: dateStr === props.selectedDate,
    })
  }

  // Fill trailing empty cells to complete the grid (rows of 7)
  const remainder = cells.length % 7
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({
        day: null,
        dateStr: '',
        hasData: false,
        dataCount: 0,
        isToday: false,
        isSelected: false,
      })
    }
  }

  return cells
})

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function handleDateClick(dateStr: string) {
  if (props.selectedDate === dateStr) {
    emit('select', null)
  } else {
    emit('select', dateStr)
  }
}

function handleClear() {
  emit('select', null)
}
</script>

<style lang="scss" scoped>
.calendar-panel {
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
}

.month-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.weekday-cell {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 0;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.date-cell {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: default;
  font-size: 13px;
  color: var(--text-color);
  transition: all 0.15s;

  &.empty {
    cursor: default;
  }

  &.has-data:not(.is-selected) {
    cursor: pointer;
    background: rgba(201, 169, 110, 0.12);

    .date-number {
      font-weight: 600;
    }

    &:hover {
      background: rgba(201, 169, 110, 0.22);
    }
  }

  &.is-today:not(.is-selected) {
    border: 1px solid var(--primary-color);
  }

  &.is-selected {
    background: var(--primary-color);
    color: #fff;
    cursor: pointer;

    .date-number {
      color: #fff;
      font-weight: 700;
    }

    .data-badge {
      background: #fff;
      color: var(--primary-color);
    }

    &:hover {
      opacity: 0.9;
    }
  }
}

.date-number {
  position: relative;
  z-index: 1;
  line-height: 1;
}

.data-badge {
  position: absolute;
  top: 1px;
  right: 1px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  background: var(--primary-color);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 14px;
  text-align: center;
}

.calendar-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;

  &--empty {
    border: 1px solid var(--border-color);
    background: var(--card-bg);
  }

  &--has-data {
    background: rgba(201, 169, 110, 0.3);
  }
}

.clear-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
}

@media (max-width: 768px) {
  .date-cell {
    font-size: 12px;
  }

  .data-badge {
    min-width: 12px;
    height: 12px;
    font-size: 8px;
    line-height: 12px;
  }
}
</style>
