import { type RouteRecordRaw } from "vue-router";
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/accounts",
    component: () => import("@/Home.vue"),
    children: [
      {
        path: '/Contacts',
        name: 'contacts',
        component: () => import('@contacts/pages/ContactPage.vue'),
      },
      {
        path: "/Accounts",
        name: "accounts",
        component: () => import("@accounts/pages/AccountPage.vue"),
      },
      {
        path: "/HANE_Entregas",
        name: "hane_entregas",
        component: () => import("@accounts/pages/DeliveryPage.vue"),
      },
      {
        path: "/HANRT_Planificador",
        name: "hanrt_planificador",
        redirect: { name: "list" },
        component: () => import("@/modules/Planning/pages/PlanningPage.vue"),
        children: [
          {
            path: "list",
            name: "list",
            component: () =>
              import("@/modules/Planning/pages/ListPlanningPage.vue"),
            beforeEnter: (to, from, next) => {
              if (
                from.name === "create" &&
                to.redirectedFrom?.name !== "hanrt_planificador"
              ) {
                const value = confirm("¿Estás seguro de que deseas salir?");
                if (value) {
                  next();
                  return;
                }
                next(false);
                return;
              }

              next();
            },
          },
          {
            path: "create/:type",
            name: "create",
            component: () =>
              import("@/modules/Planning/pages/CreatePlanningPage.vue"),
          },
        ],
      },
      {
        path: '/HANA_Visitas',
        name: 'myVisits',
        component: () => import('@/modules/HANA_Visitas/pages/VisitsPage.vue'),
      },
      {
        path: "/routes",
        name: "routes",
        component: () => import("@/modules/Planning/pages/PlanningPage.vue"),
      },
      {
        path: "/HANRT_ciclos",
        name: "cycles",
        component: () => import("@cycle/pages/CyclesPage.vue"),
      },
      {
        path: '/HANA_Visitas',
        name: 'myVisits',
        component: () => import('@/modules/HANA_Visitas/pages/VisitsPage.vue'),
      },
      {
        path: "/locations",
        name: "locations",
        component: () => import("@/modules/Planning/pages/PlanningPage.vue"),
      },
      {
        path: "/indicators",
        name: "indicators",
        component: () => import("@/modules/Planning/pages/PlanningPage.vue"),
      },
      {
        path: "/settings",
        name: "settings",
        component: () => import("@/modules/Planning/pages/PlanningPage.vue"),
      },
      {
        path: "/404",
        name: "404",
        component: () => import("@/pages/NotFoundPage.vue"),
      },
    ],
  },
];
