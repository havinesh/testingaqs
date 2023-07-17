import Cookies from "js-cookie";

export const TOKEN_KEY = "cleandesk-userToken";
export const PERSON_ID = "cleandesk-personId";
export const PERSON_ORG_OFFICE_ID = "cleandesk-personOrgOfficeId";

// export function getCookie(name) {
//   if (navigator.cookieEnabled) {
//     let matches = document.cookie.match(
//       new RegExp(
//         "(?:^|; )" +
//           // cookieNameGenerator(name).replace(
//           name.replace(
//             // eslint-disable-next-line no-useless-escape
//             /([\.$?*|{}\(\)\[\]\\\/\+^])/g,
//             "\\$1"
//           ) +
//           "=([^;]*)"
//       )
//     );
//     console.log(matches);
//     // return matches ? decodeURIComponent(matches[1]) : getLocalStorage(name);
//   }
//   // return getLocalStorage(name);
// }

export const setAuthKey = (token) => setCookie(TOKEN_KEY, token);
export const getAuthKey = () => getCookie(TOKEN_KEY);

export const setPersonId = (personId) => setCookie(PERSON_ID, personId);
export const getPersonId = () => getCookie(PERSON_ID);

export const getPersonOrgOfficeId = () => getCookie(PERSON_ORG_OFFICE_ID);
export const setPersonOrgOfficeId = (personOrgOfficeId) =>
  setCookie(PERSON_ORG_OFFICE_ID, personOrgOfficeId);

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const setCookie = (name, value) => {
  Cookies.set(name, value);
};
// export default function getAuthKey(name) {
//   // getCookie("beta_userToken");
//   const gettest = Cookies.get(name);
//   console.log(gettest);
//   return gettest;
//   // let cookieValue = "";
//   // const cookies = document.cookie.split(";");
//   // for (let i = 0; i < cookies.length; i++) {
//   //   const cookie = cookies[i].trim();
//   //   console.log(cookie, "cookie");
//   //   if (cookie.startsWith("beta_userToken=")) {
//   //     cookieValue = cookie.substring("beta_userToken=".length, cookie.length);
//   //     console.log(cookieValue, " cookieValue");
//   //     break;
//   //   }
//   // }
// }
