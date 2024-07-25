import type { InjectionKey, Ref } from "vue";

export const currentFieldDetailTabInjection: InjectionKey<Ref<string>> = Symbol('current-field-detail-tab');

export const pkgIdInjection: InjectionKey<Ref<string>> = Symbol('pkg-id');