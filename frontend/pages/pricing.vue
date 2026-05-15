<template>
  <div class="relative min-h-screen pt-32 sm:pt-28 pb-12 px-4 sm:px-6">
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-float"></div>
      <div class="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] animate-float-delayed"></div>
    </div>

    <div class="max-w-5xl mx-auto space-y-10">
      <div class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safe/10 border border-safe/40">
          <Gift class="w-4 h-4 text-safe animate-pulse" />
          <span class="text-sm text-safe font-medium">BETA · всё бесплатно</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold">
          Pro <span class="text-gradient-primary">включён</span> на всё время беты
        </h1>
        <p class="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
          Пока MineMind в публичной бете — <strong class="text-foreground">все Pro-фичи бесплатно</strong>.
          AI Coach без лимита, расширенная статистика, все режимы MoodMode — без оплаты.
          Платная подписка появится позже, когда продукт стабилизируется.
        </p>
      </div>

      <!-- Big beta card -->
      <div class="gradient-border p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-secondary/15 rounded-full blur-3xl"></div>

        <div class="relative space-y-6">
          <div class="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent text-background grid place-items-center mx-auto glow-primary animate-float">
            <Sparkles class="w-10 h-10" />
          </div>

          <div class="space-y-2">
            <div class="text-6xl font-bold font-mono">
              <span class="text-gradient-primary">$0</span>
              <span class="text-xl text-muted-foreground line-through ml-3">$4.99</span>
            </div>
            <p class="text-muted-foreground text-sm">пока бета — потом будет $4.99/мес</p>
          </div>

          <ul class="grid sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-4">
            <li v-for="f in betaFeatures" :key="f" class="flex items-start gap-2 text-sm">
              <span class="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center mt-0.5 shrink-0">
                <Check class="w-3 h-3" />
              </span>
              <span>{{ f }}</span>
            </li>
          </ul>

          <div class="pt-2">
            <NuxtLink v-if="auth.isAuthed" to="/play" class="pixel-btn !px-8 !py-3 inline-flex">
              <Play class="w-4 h-4" />
              Играть с Pro-фичами
            </NuxtLink>
            <NuxtLink v-else to="/register" class="pixel-btn !px-8 !py-3 inline-flex">
              <Sparkles class="w-4 h-4" />
              Зарегаться и получить Pro
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="text-center text-xs text-muted-foreground pt-4">
        Спасибо что тестируешь MineMind на ранней стадии 💛
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Gift, Play, Sparkles } from 'lucide-vue-next'

useHead({ title: 'Pro · Beta — MineMind' })

const auth = useAuthStore()

const betaFeatures = [
  'Безлимитный AI Coach с локальным CSP-решателем + GPT-4o',
  'Все 3 режима MoodMode: Focus, Chill, Chaos',
  'Daily Challenge + глобальный рейтинг по городам',
  'Brain Score с прогресс-графиком',
  'Все 15 достижений и streak-серии',
  '4 уровня сложности + кастомное поле',
]
</script>
