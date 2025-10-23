import { defineStore } from "pinia";

type State = {
  dialogs: {
    id: string;
    component: any;
    show: boolean;
    props: any;
    events?: any;
  }[];
};

export const useDialogStore = defineStore("dialogStore", {
  state(): State {
    return {
      dialogs: [],
    };
  },
  actions: {
    openNewDrawer(component: any, props?: any, events?: any) {
      this.dialogs.push({
        id: crypto.randomUUID(),
        component,
        show: false,
        props,
        events,
      });

      setTimeout(() => {
        this.dialogs[this.dialogs.length - 1].show = true;
      }, 10);
    },
    closeCurrentDrawer() {
      this.dialogs.pop();
    },
  },
});
