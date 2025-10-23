import { Module } from "@accounts/types";

export const stringToModule = (module: string) => {
  return module === 'visits' ? Module.VISIT : Module.DISPATCH;
}
