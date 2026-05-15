<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6">
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-warning/8 rounded-full blur-[150px] animate-float"></div>
    </div>

    <div class="max-w-6xl mx-auto space-y-6">
      <div class="space-y-2">
        <div class="chip bg-warning/10 text-warning border-warning/40 inline-flex">
          <Trophy class="w-3 h-3" /> Глобальный рейтинг
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold">
          <span class="text-gradient-primary">Лидерборд</span>
        </h1>
        <p class="text-muted-foreground">Соревнуйся с игроками со всего мира — или фильтруй по городу.</p>
      </div>

      <div class="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <select v-model="boardType" class="input w-auto">
          <option value="time">Лучшее время</option>
          <option value="brain">Brain Score</option>
        </select>
        <select v-if="boardType === 'time'" v-model="difficulty" class="input w-auto">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select v-if="boardType === 'time'" v-model="period" class="input w-auto">
          <option value="all_time">Всё время</option>
          <option value="today">Сегодня</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
        <input v-model="city" type="text" placeholder="Город (опционально)" class="input flex-1 min-w-48" />
        <button class="btn-secondary rounded-xl" @click="load">
          <RefreshCw class="w-4 h-4" /> Обновить
        </button>
      </div>

      <div class="glass-card rounded-2xl overflow-x-auto">
        <table v-if="rows.length" class="w-full text-sm">
          <thead class="text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th class="text-left py-3 px-4 w-12">#</th>
              <th class="text-left">Игрок</th>
              <th class="text-left hidden sm:table-cell">Город</th>
              <th class="text-right pr-4">{{ boardType === 'brain' ? 'Brain Score' : 'Время' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.user_id"
              class="border-b border-border/30 transition-colors"
              :class="row.is_me ? 'bg-primary/10' : 'hover:bg-muted/30'"
            >
              <td class="py-3 px-4 font-mono">
                <span v-if="row.rank === 1" class="text-2xl">🥇</span>
                <span v-else-if="row.rank === 2" class="text-2xl">🥈</span>
                <span v-else-if="row.rank === 3" class="text-2xl">🥉</span>
                <span v-else class="text-muted-foreground">{{ row.rank }}</span>
              </td>
              <td class="font-medium">
                {{ row.username }}
                <span v-if="row.is_pro" class="chip bg-warning/15 text-warning border-warning/30 ml-1">Pro</span>
                <span v-if="row.is_me" class="chip bg-primary/15 text-primary border-primary/30 ml-1">Ты</span>
              </td>
              <td class="text-muted-foreground hidden sm:table-cell">{{ row.city || '—' }}</td>
              <td class="text-right pr-4 font-mono font-bold">
                <span v-if="boardType === 'brain'" class="text-glow-primary">{{ row.brain_score }}</span>
                <span v-else class="text-primary">{{ row.best_time }}s</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-8 text-center text-sm text-muted-foreground">
          Пока никто не сыграл. <NuxtLink to="/play" class="text-primary hover:underline">Стань первым</NuxtLink>.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw, Trophy } from 'lucide-vue-next'

useHead({ title: 'Лидерборд — MineMind' })

const api = useApi()

const boardType = ref<'time' | 'brain'>('time')
const difficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const period = ref<'all_time' | 'today' | 'week' | 'month'>('all_time')
const city = ref('')
const rows = ref<any[]>([])

async function load() {
  try {
    const data = await api.get('/api/leaderboard/', {
      type: boardType.value,
      difficulty: difficulty.value,
      period: period.value,
      city: city.value,
    })
    rows.value = data.results || []
  } catch {
    rows.value = []
  }
}

watch([boardType, difficulty, period], load, { immediate: true })
</script>
