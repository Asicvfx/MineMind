<template>
  <div class="relative overflow-x-hidden">
    <LandingParticles />

    <!-- Animated background blobs (sit BEHIND the global grid backdrop) -->
    <div class="fixed inset-0 pointer-events-none -z-[5]">
      <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-float"></div>
      <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] animate-float-delayed"></div>
      <div class="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[150px]"></div>
    </div>

    <!-- ============= HERO ============= -->
    <section class="relative min-h-screen flex items-center justify-center pt-32 sm:pt-28 px-4 sm:px-6">

      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
        <div class="text-center lg:text-left space-y-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Sparkles class="w-4 h-4 text-primary animate-spin-slow" />
            <span class="text-sm text-primary font-medium">AI-Powered Brain Training</span>
          </div>

          <h1 class="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            <span class="block">Тренируй</span>
            <span class="block text-gradient-primary">свой мозг</span>
            <span class="block">играя</span>
          </h1>

          <p class="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
            MineMind — это не просто Сапёр. Это AI-платформа для развития
            когнитивных способностей через решение логических задач.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <NuxtLink to="/play" class="pixel-btn text-base sm:text-lg !px-8 !py-4">
              <Zap class="w-5 h-5" />
              Начать бесплатно
              <ArrowRight class="w-5 h-5" />
            </NuxtLink>
            <NuxtLink to="/daily" class="btn-secondary text-base sm:text-lg !px-8 !py-4 rounded-xl">
              <CalendarDays class="w-5 h-5" />
              Daily Challenge
            </NuxtLink>
          </div>

          <!-- Mini stats -->
          <div class="flex items-center justify-center lg:justify-start gap-8 pt-4">
            <div v-for="(s, i) in heroStats" :key="i" class="text-center">
              <div class="text-2xl font-bold font-mono text-glow-primary">{{ s.value }}</div>
              <div class="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <component v-if="s.icon" :is="s.icon" class="w-3 h-3 text-warning fill-warning" />
                {{ s.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center lg:justify-end px-6 sm:px-0 animate-float">
          <LandingMiniBoard />
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2">
        <div class="w-7 h-12 rounded-full border-2 border-primary/40 flex items-start justify-center p-2">
          <div class="w-2 h-3 rounded-full bg-gradient-to-b from-primary to-secondary animate-bounce"></div>
        </div>
      </div>
    </section>

    <!-- ============= STATS ============= -->
    <section class="py-20 px-4 sm:px-6 relative">
      <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="(s, i) in mainStats"
          :key="i"
          class="glass-card hover-lift p-6 rounded-2xl group"
        >
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', s.color]">
            <component :is="s.icon" class="w-6 h-6" />
          </div>
          <div class="text-3xl sm:text-4xl font-bold font-mono mb-1">
            <span class="text-glow-primary">{{ s.value }}</span>
          </div>
          <div class="text-muted-foreground text-sm">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- ============= FEATURES ============= -->
    <section class="py-20 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-4xl md:text-6xl font-bold">
            Больше чем <span class="text-gradient-primary">просто игра</span>
          </h2>
          <p class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Продвинутые инструменты для тренировки мозга и отслеживания прогресса
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(f, i) in features"
            :key="i"
            class="group glass-card p-8 rounded-2xl relative overflow-hidden hover-lift"
          >
            <div :class="['w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110', f.color]">
              <component :is="f.icon" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
              {{ f.title }}
            </h3>
            <p class="text-muted-foreground leading-relaxed">{{ f.description }}</p>
            <div :class="['absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500', f.line]"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= AI COACH SHOWCASE ============= -->
    <section class="py-20 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
            <Cpu class="w-4 h-4 text-secondary animate-pulse" />
            <span class="text-sm text-secondary font-medium">Powered by AI</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold">
            Персональный <span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">AI-коуч</span>
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            Наш AI анализирует каждый твой ход, определяет паттерны принятия решений
            и даёт персонализированные рекомендации для улучшения когнитивных навыков.
          </p>
          <ul class="space-y-4">
            <li v-for="(item, i) in coachBullets" :key="i" class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary/30 to-accent/30 flex items-center justify-center">
                <Check class="w-4 h-4 text-secondary" />
              </span>
              <span class="text-base sm:text-lg">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5"></div>

          <div class="relative space-y-5">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-background">
                <Cpu class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold">AI-Коуч</div>
                <div class="text-xs text-muted-foreground flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-safe animate-pulse"></span>
                  Онлайн
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="(msg, i) in coachMessages"
                :key="i"
                class="p-4 rounded-xl border transition-transform hover:translate-x-1 cursor-default"
                :style="{
                  background: `linear-gradient(135deg, ${msg.bg} 0%, transparent 100%)`,
                  borderColor: msg.border,
                }"
              >
                <p class="text-sm leading-relaxed">
                  <span class="font-bold" :style="{ color: msg.color }">{{ msg.label }}:</span>
                  {{ msg.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= DAILY + PRO ============= -->
    <section class="py-20 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <div class="glass-card p-8 rounded-2xl relative overflow-hidden hover-lift">
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-warning/15 rounded-full blur-3xl"></div>
          <div class="relative space-y-3">
            <div class="chip bg-warning/10 text-warning border-warning/40">
              <CalendarDays class="w-3 h-3" /> Daily Challenge
            </div>
            <h3 class="text-2xl sm:text-3xl font-bold">Одно поле в день. Для всех.</h3>
            <p class="text-muted-foreground">
              Каждый день генерируется одинаковое поле для всех игроков мира. Глобальный
              рейтинг по времени и точности.
            </p>
            <NuxtLink to="/daily" class="pixel-btn pixel-btn-secondary mt-4 !px-6 !py-3">
              <CalendarDays class="w-4 h-4" />
              Сегодняшний челлендж
            </NuxtLink>
          </div>
        </div>

        <div class="gradient-border p-8 rounded-2xl relative overflow-hidden">
          <div class="space-y-3">
            <div class="chip bg-safe/15 text-safe border-safe/40">
              <Gift class="w-3 h-3" /> BETA · бесплатно
            </div>
            <h3 class="text-2xl sm:text-3xl font-bold">Pro включён для всех</h3>
            <p class="text-muted-foreground">
              Пока MineMind в публичной бете — безлимитный AI Coach, все режимы MoodMode,
              расширенная статистика. Без оплаты, без триалов.
            </p>
            <div class="text-3xl font-bold font-mono pt-2">
              <span class="text-glow-primary">$0</span>
              <span class="text-base font-normal text-muted-foreground line-through ml-2">$4.99/мес</span>
            </div>
            <NuxtLink to="/pricing" class="pixel-btn mt-4 !px-6 !py-3">
              <Sparkles class="w-4 h-4" />
              Подробнее
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= CTA ============= -->
    <section class="py-20 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div class="gradient-border p-12 sm:p-16 rounded-3xl relative overflow-hidden">
          <div class="flex justify-center mb-8 animate-float">
            <Logo :size="120" glow />
          </div>

          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Готов прокачать свой <span class="text-gradient-primary">мозг</span>?
          </h2>
          <p class="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Регистрация бесплатна. Первая партия — за 30 секунд.
          </p>
          <NuxtLink to="/register" class="pixel-btn text-base sm:text-lg !px-10 !py-4 inline-flex">
            <Zap class="w-5 h-5" />
            Начать играть бесплатно
            <ArrowRight class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight, Brain, CalendarDays, Check, Clock, Cpu, Gamepad2, Gift,
  Globe, Layers, Medal, Sparkles, Star, Target, TrendingUp, Trophy, Users, Zap,
} from 'lucide-vue-next'

useHead({
  title: 'MineMind — AI-powered Brain Training',
})

// Honest "stats" — facts about the product, not fake user numbers.
const heroStats = [
  { value: 'BETA', label: 'всё бесплатно' },
  { value: 'AI', label: 'coach внутри', icon: Sparkles },
  { value: '24/7', label: 'Daily Challenge' },
]

const mainStats = [
  { icon: Layers, value: '4', label: 'Уровня сложности', color: 'bg-primary/20 text-primary' },
  { icon: Medal, value: '15', label: 'Достижений и streak', color: 'bg-secondary/20 text-secondary' },
  { icon: Brain, value: '3', label: 'Режима настроения', color: 'bg-accent/20 text-accent' },
  { icon: CalendarDays, value: '1', label: 'Daily Challenge / день', color: 'bg-warning/20 text-warning' },
]

const features = [
  {
    icon: Cpu, title: 'AI-Коуч',
    description: 'Персональный тренер анализирует каждый ход и даёт подсказки в реальном времени.',
    color: 'bg-primary/20 text-primary', line: 'bg-gradient-to-r from-primary to-transparent',
  },
  {
    icon: Target, title: 'Daily Challenge',
    description: 'Новое поле каждый день. Соревнуйся с игроками со всего мира.',
    color: 'bg-secondary/20 text-secondary', line: 'bg-gradient-to-r from-secondary to-transparent',
  },
  {
    icon: Brain, title: 'Brain Score',
    description: 'Уникальный показатель когнитивных способностей на основе твоих решений.',
    color: 'bg-accent/20 text-accent', line: 'bg-gradient-to-r from-accent to-transparent',
  },
  {
    icon: Trophy, title: 'Лидерборд',
    description: 'Глобальный рейтинг + по городам. Попади в топ-100 лучших.',
    color: 'bg-warning/20 text-warning', line: 'bg-gradient-to-r from-warning to-transparent',
  },
  {
    icon: TrendingUp, title: 'Аналитика прогресса',
    description: 'Детальная статистика и графики твоего развития за всё время.',
    color: 'bg-safe/20 text-safe', line: 'bg-gradient-to-r from-safe to-transparent',
  },
  {
    icon: Gamepad2, title: '4 режима',
    description: 'От Easy до Hard плюс кастомные поля. Прогресс адаптивно усложняется.',
    color: 'bg-destructive/20 text-destructive', line: 'bg-gradient-to-r from-destructive to-transparent',
  },
]

const coachBullets = [
  'Анализ в реальном времени',
  'Constraint satisfaction для точных решений',
  'Объяснения на русском, 2-3 предложения',
  'Free: 3 подсказки в день · Pro: безлимит',
]

const coachMessages = [
  {
    label: 'Подсказка',
    text: 'Обрати внимание на клетку [4,5]. Рядом уже открыты две "двойки" — это безопасная зона!',
    color: '#00ffd5', bg: 'rgba(0, 255, 213, 0.1)', border: 'rgba(0, 255, 213, 0.25)',
  },
  {
    label: 'Анализ',
    text: 'Твоя скорость принятия решений выросла на 12% за последнюю неделю.',
    color: '#ff00aa', bg: 'rgba(255, 0, 170, 0.1)', border: 'rgba(255, 0, 170, 0.25)',
  },
  {
    label: 'Совет',
    text: 'Попробуй начинать с углов — статистически это даёт больше информации на старте.',
    color: '#ffee00', bg: 'rgba(255, 238, 0, 0.1)', border: 'rgba(255, 238, 0, 0.25)',
  },
]
</script>
