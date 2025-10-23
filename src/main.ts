import { AppFullscreen, Dialog, Notify, Quasar } from "quasar";
import { createApp } from "vue";

import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "quasar/src/css/index.sass";

import { VueQueryPlugin } from "@tanstack/vue-query";
import moment from "moment";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import langEs from 'quasar/lang/es';

const myApp = createApp(App);

moment.updateLocale("es", {
  months:
    "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
      "_",
    ),
  monthsShort: "Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sept._Oct._Nov._Dec.".split(
    "_",
  ),
  weekdays: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
  weekdaysShort: "Dom._Lun._Mar._Mié._Jue._Vie._Sáb.".split("_"),
  weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
});

myApp.use(VueQueryPlugin);
myApp.use(router);
myApp.use(createPinia());
myApp.use(Quasar, {
  plugins: {
    Notify,
    AppFullscreen,
    Dialog,
  },
  lang: langEs,
});

myApp.mount("#app");
