<template>
  <div class="calendar-archive">
    <h3 class="sidebar-title">
      <span class="title-icon">📅</span>
      日历归档
    </h3>
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">◀</button>
      <span class="month-label">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
      <button class="nav-btn" @click="nextMonth">▶</button>
    </div>
    <div class="calendar-weekdays">
      <span v-for="day in weekdays" :key="day" class="weekday-cell">{{ day }}</span>
    </div>
    <div class="calendar-grid">
      <div
        v-for="(cell, index) in calendarCells"
        :key="index"
        class="date-cell"
        :class="{
          'empty': !cell.day,
          'has-data': cell.hasData,
          'is-today': cell.isToday,
        }"
      >
        <span v-if="cell.day" class="date-number">{{ cell.day }}</span>
        <span v-if="cell.hasData" class="data-badge">{{ cell.dataCount }}</span>
      </div>
    </div>
    <div class="calendar-footer">
      <span class="legend-item">
        <span class="legend-dot legend-dot--empty"></span>
        无数据
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--has-data"></span>
        有数据
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  articleDates: Record<string, number>;
}

const props = defineProps<Props>();

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());

interface CalendarCell {
  day: number | null;
  dateStr: string;
  hasData: boolean;
  dataCount: number;
  isToday: boolean;
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: null, dateStr: '', hasData: false, dataCount: 0, isToday: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const dataCount = props.articleDates[dateStr] || 0;
    cells.push({
      day,
      dateStr,
      hasData: dataCount > 0,
      dataCount,
      isToday: dateStr === todayStr,
    });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ day: null, dateStr: '', hasData: false, dataCount: 0, isToday: false });
    }
  }

  return cells;
});

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}
</script>

<style scoped>
.calendar-archive {
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 18px 20px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  font-size: 15px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.nav-btn {
  width: 26px;
  height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.month-label {
  font-size: 14px;
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
  font-size: 11px;
  color: var(--text-secondary);
  padding: 3px 0;
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
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-color);
  transition: background 0.2s;
}

.date-cell.has-data {
  background: rgba(201, 169, 110, 0.12);
  cursor: pointer;
}

:root[data-theme="dark"] .date-cell.has-data {
  background: rgba(201, 169, 110, 0.18);
}

.date-cell.has-data .date-number {
  font-weight: 600;
}

.date-cell.is-today {
  border: 1px solid var(--primary-color);
}

:root[data-theme="dark"] .date-cell.is-today {
  border-color: var(--color-signal);
  background: rgba(228, 155, 82, 0.12);
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
  min-width: 12px;
  height: 12px;
  padding: 0 2px;
  border-radius: 6px;
  background: var(--primary-color);
  color: #fff;
  font-size: 8px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
}

:root[data-theme="dark"] .data-badge {
  background: var(--color-signal);
}

.calendar-footer {
  margin-top: 10px;
  display: flex;
  gap: 12px;
  font-size: 11px;
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
}

.legend-dot--empty {
  border: 1px solid var(--border-color);
  background: var(--card-bg);
}

:root[data-theme="dark"] .legend-dot--empty {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.legend-dot--has-data {
  background: rgba(201, 169, 110, 0.3);
}

:root[data-theme="dark"] .legend-dot--has-data {
  background: rgba(201, 169, 110, 0.4);
}
</style>
