<script setup lang="ts">
import HeaderPage from '@/components/HeaderPage.vue';
import { ref } from 'vue';

const easyFilter = ref<string>("");
</script>

<template>
 <div class="column no-wrap" style="height: 100vh; max-height: 100vh">
    <HeaderPage title="Contactos" />
    <div class="q-pa-sm">
      <div class="row items-center q-gutter-x-sm no-wrap">
        <q-input
          rounded
          outlined
          dense
          label="Buscar contacto"
          debounce="2000"
          style="flex-grow: 1"
          v-model="easyFilter"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template #after>
            <q-btn
              round
              flat
              padding="xs"
              icon="o_switch_account"
            >
              <q-tooltip
                anchor="bottom right"
                self="center end"
                :offset="[10, 10]"
              >
                Vista de cuentas
              </q-tooltip>
            </q-btn>
            <q-btn
              round
              flat
              padding="xs"
              icon="o_group"
            >
              <q-tooltip
                anchor="bottom right"
                self="center end"
                :offset="[10, 10]"
              >
                Vista de contactos
              </q-tooltip>
            </q-btn>
            <q-btn
              round
              flat
              padding="xs"
              icon="o_filter_list"
            >
              <q-badge
                color="orange"
                floating
                rounded
              ></q-badge>
            </q-btn>
          </template>
        </q-input>
      </div>
    </div>
    <!-- <q-tabs
      inline-label
      active-color="black"
      v-model="withLocation"
      dense
      align="justify"
      no-caps
      class="bg-grey-2 text-grey-6 q-mb-xs"
    >
      <q-tab v-for="tab in panels" :key="tab.name" v-bind="tab" />
    </q-tabs> -->
   
    <!-- <Pager
      v-if="accounts.length > 0"
      :page="page"
      :limit="totalAccounts"
      :length="accounts.length"
      :perPage="rowsPerPage"
      @changePage="onChangePage"
      @changePerPage="onAccountPerPageChange"
    /> -->
  </div>
</template>

<style scoped>

</style>