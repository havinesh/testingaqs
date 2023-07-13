import { writable } from "svelte/store";

export const isAuthenticated = writable(false);

export const userDetails = writable(null);

export const officeDetails = writable(null);
