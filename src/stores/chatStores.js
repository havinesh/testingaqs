import { writable } from "svelte/store";

export const messages = writable([]);

export const selectedMessage = writable(null);
