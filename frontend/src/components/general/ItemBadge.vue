<template>
  <div
    :class="badgeClasses"
    :title="copyable ? (copied ? 'Copied!' : 'Click to copy value') : undefined"
    :role="copyable ? 'button' : undefined"
    :tabindex="copyable ? 0 : -1"
    @click="handleCopy"
    @keydown.enter.prevent="handleCopy"
    @keydown.space.prevent="handleCopy"
  >
    <span v-if="label" class="font-semibold">
      {{ label }}
      <span v-if="value !== undefined" class="opacity-70">:</span>
    </span>
    <span :class="valueClasses">{{ displayValue }}</span>
    <span
      v-if="copyable && copied"
      class="text-[11px] font-semibold text-success ml-1"
    >
      Copied
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type Size = 'xs' | 'sm' | 'md' | 'lg';
type Variant =
  | 'outline'
  | 'ghost'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

const props = defineProps<{
  label?: string;
  value?: string | number;
  size?: Size;
  variant?: Variant;
  copyable?: boolean;
  /**
   * Truncate long values instead of letting them overflow the badge.
   */
  truncate?: boolean;
  /**
   * Optional max width for the badge (Tailwind size e.g. 'md', 'lg', or custom class).
   */
  maxWidthClass?: string;
}>();

const emit = defineEmits<{
  (e: 'copied', value: string | number | undefined): void;
  (e: 'copy-error', error: unknown): void;
}>();

const copied = ref(false);
let copyReset: number | undefined;

const badgeClasses = computed(() => {
  const size = props.size ?? 'sm';
  const variant = props.variant ?? 'outline';

  return [
    'badge inline-flex flex-wrap max-w-full whitespace-normal h-auto min-h-0',
    variant === 'outline' ? 'badge-outline' : `badge-${variant}`,
    props.maxWidthClass ?? 'max-w-[320px]',
    props.copyable && 'cursor-pointer select-none',
  ].filter(Boolean);
});

const valueClasses = computed(() => {
  return [
    'font-mono min-w-0 whitespace-normal break-words break-all',
    props.truncate && 'truncate whitespace-nowrap',
  ].filter(Boolean);
});

const displayValue = computed(() => {
  if (
    props.value === null ||
    props.value === undefined ||
    props.value === '' ||
    props.value === 'null' ||
    props.value === 'undefined' ||
    props.value === 'null' ||
    props.value === 'undefined'
  ) return '—';
  return String(props.value);
});

async function handleCopy() {
  if (!props.copyable) return;
  try {
    await navigator.clipboard?.writeText(String(props.value ?? ''));
    copied.value = true;
    emit('copied', props.value);
    if (copyReset) window.clearTimeout(copyReset);
    copyReset = window.setTimeout(() => { copied.value = false; }, 1500);
  } catch (err) {
    emit('copy-error', err);
  }
}
</script>

<style scoped>

</style>