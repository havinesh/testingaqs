// src/lib/realtime.js
import io from "socket.io-client";
import { getAuthKey } from "./utils/cookie/user";

export const chatSocket = io("https://support.foop.com", {
  // const socket = io("https://support.foop.com", {
  query: {
    // token: "5ac82801e292a2635bd1b20eba089353ca3e0bd671e7a1ac0203b87cb00af6bf",
    token: getAuthKey(),
  },
});

console.log("socket called");

// export const chatSocket = socket;
