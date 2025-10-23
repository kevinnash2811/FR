import { defineStore } from "pinia";

type State = {
  isOpen: boolean;
  title: string;
  callback?: (value: boolean) => Promise<void>;
};

export const useConfirmDialogStore = defineStore('confirmDialog', {
  state: (): State => ({
    isOpen: false,
    title: '',
  }),
  actions: {
    openDialog(title: string) {
      this.isOpen = true;
      this.title = title;
    },
    closeDialog() {
      this.isOpen = false;
      this.title = '';
    },
    setCallback(callback: (value: boolean) => Promise<void>) {
      this.callback = callback;
    },
    async onResult(value: boolean) {
      await this.callback?.(value);
      this.closeDialog();
    }
  },
})