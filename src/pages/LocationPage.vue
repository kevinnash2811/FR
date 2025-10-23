<script setup lang="ts">
const enablePolygonControl = () => {
  const button: Element | undefined = document.getElementsByClassName(
    "leaflet-draw-draw-polygon",
  )[0];

  button?.dispatchEvent(new Event("click"));
};

const enableCircleControl = () => {
  const button: Element | undefined = document.getElementsByClassName(
    "leaflet-draw-draw-circle",
  )[0];

  button?.dispatchEvent(new Event("click"));
};

const search = (e: Event) => {
  const input: HTMLInputElement | null = document.querySelector(
    ".leaflet-control-geocoder-form > input",
  );

  if (input && e.target) {
    input.value = (e.target as HTMLInputElement).value;
  }
};

// const executeSearch = () => {
//   const input: HTMLInputElement | null = document.querySelector('.leaflet-control-geocoder-form > input');
//   const event = new KeyboardEvent('keydown', {
//     key: 'Enter',
//     keyCode: 13,
//   });
//   console.log(input?.dispatchEvent(event));
// }
</script>

<template>
  <div class="q-mb-sm q-pa-sm">
    <div class="row justify-between items-center q-py-sm">
      <div class="text-h5 text-grey-7 text-bold">Localizaciones</div>
    </div>
  </div>
  <div active-color="blue-8" class="text-blue-6 shadow-2 q-mb-sm row">
    <q-btn flat style="flex: 1" noCaps @click="enablePolygonControl">
      <div class="column items-center">
        <q-icon name="o_pentagon"> </q-icon>
        Poligono
      </div>
    </q-btn>
    <q-btn flat style="flex: 1" noCaps @click="enableCircleControl">
      <div class="column items-center">
        <q-icon name="o_circle"> </q-icon>
        Radio
      </div>
    </q-btn>
    <q-btn flat style="flex: 1" noCaps>
      <div class="column items-center">
        <q-icon name="o_earbuds"> </q-icon>
        Lazo
      </div>
    </q-btn>
  </div>
  <div></div>
</template>

<style scoped></style>
