/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bonuses from "../bonuses.js";
import type * as invitations from "../invitations.js";
import type * as organizations from "../organizations.js";
import type * as productionLogs from "../productionLogs.js";
import type * as sections from "../sections.js";
import type * as styles from "../styles.js";
import type * as users from "../users.js";
import type * as workers from "../workers.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bonuses: typeof bonuses;
  invitations: typeof invitations;
  organizations: typeof organizations;
  productionLogs: typeof productionLogs;
  sections: typeof sections;
  styles: typeof styles;
  users: typeof users;
  workers: typeof workers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
