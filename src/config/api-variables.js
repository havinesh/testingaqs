// APIs
// export const DOMAIN = process.env.REACT_APP_API_DOMAIN;
export const DOMAIN = "https://test.cleandesk.co.in";

export const CHAT_DOMAIN = "https://support.foop.com";

// Versioned APIs
export const BASIC_URL = `${DOMAIN}/api/v1`;
export const BASIC_URL_V2 = `${DOMAIN}/api/v2`;
export const BASIC_URL_V3 = `${DOMAIN}/api/v3`;

export const CHAT_MODULE_URL = `${CHAT_DOMAIN}/api/v1`;
// export const CHAT_MODULE =
//   process.env.REACT_APP_ENV === 'test'
//     ? 'https://testsupport.cleandesk.co.in'
//     : process.env.REACT_APP_SUPPORT_PATH;

// export const MAIL_DOMAIN =
//   process.env.REACT_APP_MAIL_DOMAIN || "https://test.mail.oho.works/api/v1";

// export const SUPPORT_MODULE_SOCKET = process.env.REACT_APP_SUPPORT_SOCKET;

// v1
export const POST_MANAGEMENT_MODULE = `${BASIC_URL}/post`;
export const REGISTRATION_MODULE = `${BASIC_URL}/rl`;
export const PROFILE_MANAGEMENT_MODULE = `${BASIC_URL}/user`;
export const LEGISLATOR_MANAGEMENT_MODULE = `${BASIC_URL}/organisation`;
export const NETWORK_MODULE = `${BASIC_URL}/network`;
export const RATING_REVIEW_MODULE = `${BASIC_URL}/rr`;
export const STANDARD_DICTIONARIES_MODULE = `${BASIC_URL}/standard`;
export const UTILITY_MODULE = `${BASIC_URL}/utility`;
export const BI_MODULE = `${BASIC_URL}/bi`;
export const HELPDESK_MODULE = `${BASIC_URL}/hd`;
export const CONTENT_MODULE = `${BASIC_URL}/content`;
export const AAA_MODULE = `${BASIC_URL}/aaa`;

export const TEAM_MODULE = `${LEGISLATOR_MANAGEMENT_MODULE}/team`;
export const CAMPAIGN_MODULE = `${LEGISLATOR_MANAGEMENT_MODULE}/campaign`;

export const CHAT_MODULE = `${CHAT_DOMAIN}/messenger`;

// v2
export const LEGISLATOR_MANAGEMENT_MODULE_V2 = `${BASIC_URL_V2}/organisation`;
export const UTILITY_MODULE_V2 = `${BASIC_URL_V2}/utility`;
export const HELPDESK_MODULE_V2 = `${BASIC_URL_V2}/hd`;

// v3
export const UTILITY_MODULE_V3 = `${BASIC_URL_V3}/utility`;

// common apis
export const INVITATIONS_LISTING = BASIC_URL + "/invitation/list";
