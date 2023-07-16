// src/lib/realtime.js
import io from "socket.io-client";
import { getAuthKey } from "../cookie/user.js";

export const chatSocket = io("https://support.foop.com", {
  query: {
    token: getAuthKey(),
  },
});
