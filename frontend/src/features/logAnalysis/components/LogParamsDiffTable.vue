<template>
  <section class="card bg-base-100 shadow">

    <div class="card-body">
      
      <div class="flex flex-col gap-1 ">
        <div>
          <h1 class="text-lg font-semibold">Log Params Diff</h1>
          <p class="text-sm text-base-content/70">
            Comparing logged parameter values; defaults shown in the last column.
          </p>
        </div>

        <ItemBadge label="Flight leg" :value="flightLegId" copyable size="lg" />
      </div>

      <div v-if="error" class="alert alert-error shadow-sm">
        <span>{{ error }}</span>
      </div>

      <div v-else-if="isLoading" class="flex items-center justify-center py-12">
        <span class="loading loading-spinner loading-lg text-primary" />
      </div>

      <div v-else>
        <div v-if="rows.length === 0" class="alert alert-info">
          <span>No parameters were returned for this flight leg.</span>
        </div>

        <div v-else class="overflow-x-auto rounded-box border border-base-200 bg-base-100 shadow-sm">
          <table class="table table-zebra table-xs md:table-sm">
            <thead>
              <tr>
                <th class="min-w-[160px]">Parameter</th>
                <th v-for="log in logs" :key="log.path" class="min-w-[140px] max-w-[160px]">
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-semibold truncate"
                      :title="log.name || log.path"
                    >
                      {{ shortLogName(log.name || 'log') }}
                    </span>
                  </div>
                </th>
                <th class="min-w-[120px]">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" :class="row.allEqual ? '' : 'bg-warning/5'">
                <td class="font-mono text-xs md:text-sm align-top">
                  {{ row.name }}
                </td>
                <td v-for="cell in row.cells" :key="`${row.name}-${cell.logId}`" :class="cellClasses(row, cell)">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs md:text-sm">
                      {{ formatNumber(cell.param?.value) }}
                    </span>
                    <span v-if="!cell.param" class="badge badge-outline badge-xs">
                      Missing
                    </span>
                    <span v-else-if="cell.differsFromDefault" class="badge badge-warning badge-xs text-warning-content">
                      Changed
                    </span>
                    <span v-else class="badge badge-ghost badge-xs">
                      Default
                    </span>
                  </div>
                </td>
                <td class="font-mono text-xs md:text-sm">
                  {{ formatNumber(defaultForRow(row)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  getLogParamsDiff,
  type FlightLogMeta,
  type ParamDiffCell,
  type ParamDiffRow,
} from '../logAnalysis.api';

import ItemBadge from '@/components/general/ItemBadge.vue';

const props = defineProps<{
  flightLegId: string;
}>();

const logs = ref<FlightLogMeta[]>([]);
const rows = ref<ParamDiffRow[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const hasFlightLeg = computed(() => Boolean(props.flightLegId));

async function fetchDiff() {
  if (!hasFlightLeg.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const data = await getLogParamsDiff(props.flightLegId);
    if (!data?.diff) throw new Error('No parameter diff was returned.');

    const diff = data.diff;
    logs.value = diff.logs ?? [];
    rows.value = diff.rows ?? [];
  } catch (err) {
    error.value = (err as Error).message ?? 'Failed to load log parameter diff.';
  } finally {
    isLoading.value = false;
  }
}

function defaultForRow(row: ParamDiffRow): number | undefined {
  return row.cells.find((c) => c.param?.default_value !== undefined)?.param?.default_value;
}

function formatNumber(value?: number): string {
  if (value === undefined || value === null) return '—';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function shortLogName(name: string, max: number = 15) {
  if (!name) return 'log';
  if (name.length <= max) return name;

  const suffix = name.slice(-8); // always keep last 4 chars
  const available = Math.max(1, max - suffix.length - 3); // space for prefix
  const prefix = name.slice(0, available);

  return `${prefix}...${suffix}`;
}

function cellClasses(row: ParamDiffRow, cell: ParamDiffCell) {
  const classes = ['align-top'];
  if (!cell.param) classes.push('bg-base-200/40');
  if (cell.differsFromDefault) classes.push('bg-warning/10');
  if (!row.allEqual) classes.push('border-l border-warning/30');
  return classes.join(' ');
}

watch(
  () => props.flightLegId,
  () => {
    fetchDiff();
  },
  { immediate: true },
);
</script>