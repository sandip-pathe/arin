import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./claimbrief-today-targets.mjs";

export const identityEnvNames = [
  "CLAIMBRIEF_OPERATOR_FIRST_NAME",
  "CLAIMBRIEF_OPERATOR_LAST_NAME",
  "CLAIMBRIEF_OPERATOR_COMPANY",
  "CLAIMBRIEF_REPLY_EMAIL",
  "NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL",
  "CLAIMBRIEF_REPLY_PHONE",
  "CLAIMBRIEF_PUBLIC_BASE_URL",
  "CLAIMBRIEF_OKLAHOMA_OFFER_URL",
];

export const readClaimBriefEnv = () => {
  const env = {};

  for (const fileName of [".env.local", ".env", ".env.production.local"]) {
    const path = join(root, fileName);
    if (!existsSync(path)) {
      continue;
    }

    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }
      const [key, ...rest] = trimmed.split("=");
      const cleanKey = key.trim();
      if (!identityEnvNames.includes(cleanKey) || env[cleanKey] != null) {
        continue;
      }
      env[cleanKey] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }

  for (const name of identityEnvNames) {
    if (process.env[name]) {
      env[name] = process.env[name];
    }
  }

  return env;
};

const hasValue = (value) => Boolean(String(value || "").trim());

export const getClaimBriefIdentityStatus = (env = readClaimBriefEnv()) => {
  const replyEmail = env.CLAIMBRIEF_REPLY_EMAIL || env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL || "";
  const checks = [
    {
      name: "operator first name",
      key: "CLAIMBRIEF_OPERATOR_FIRST_NAME",
      ok: hasValue(env.CLAIMBRIEF_OPERATOR_FIRST_NAME),
      why: "Needed for most contact forms and for a credible phone opener.",
    },
    {
      name: "operator last name",
      key: "CLAIMBRIEF_OPERATOR_LAST_NAME",
      ok: hasValue(env.CLAIMBRIEF_OPERATOR_LAST_NAME),
      why: "Needed for forms that split name into first and last.",
    },
    {
      name: "operator/company label",
      key: "CLAIMBRIEF_OPERATOR_COMPANY",
      ok: hasValue(env.CLAIMBRIEF_OPERATOR_COMPANY),
      why: "Useful when a form asks company or when a receptionist asks who is calling.",
    },
    {
      name: "reply email",
      key: "CLAIMBRIEF_REPLY_EMAIL or NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL",
      ok: hasValue(replyEmail),
      why: "Needed so prospects can send packets or ask for pricing.",
    },
    {
      name: "reply phone",
      key: "CLAIMBRIEF_REPLY_PHONE",
      ok: hasValue(env.CLAIMBRIEF_REPLY_PHONE),
      why: "Needed for the Gavnat form and useful for callbacks.",
    },
  ];
  const blockers = checks.filter((check) => !check.ok);

  return {
    checks,
    blockers,
    ready: blockers.length === 0,
    status: blockers.length ? "BLOCKED_IDENTITY" : "READY_FOR_ACTION_CONFIRMATION",
  };
};
