import { Quasar } from "quasar";
import { beforeAll } from "vitest";
import { config } from "@vue/test-utils";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "quasar/dist/quasar.css";

beforeAll(() => {
  config.global.plugins = [Quasar];
});
