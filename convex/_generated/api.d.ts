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
import type * as adminQueries from "../adminQueries.js";
import type * as billing from "../billing.js";
import type * as booth_images from "../booth_images.js";
import type * as booths from "../booths.js";
import type * as businessProfiles from "../businessProfiles.js";
import type * as business_documents from "../business_documents.js";
import type * as event_images from "../event_images.js";
import type * as events from "../events.js";
import type * as functions_invites from "../functions/invites.js";
import type * as functions_updateClerkUser from "../functions/updateClerkUser.js";
import type * as getPreviewUrl from "../getPreviewUrl.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as reservations from "../reservations.js";
import type * as userQueries from "../userQueries.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminQueries: typeof adminQueries;
  billing: typeof billing;
  booth_images: typeof booth_images;
  booths: typeof booths;
  businessProfiles: typeof businessProfiles;
  business_documents: typeof business_documents;
  event_images: typeof event_images;
  events: typeof events;
  "functions/invites": typeof functions_invites;
  "functions/updateClerkUser": typeof functions_updateClerkUser;
  getPreviewUrl: typeof getPreviewUrl;
  http: typeof http;
  notifications: typeof notifications;
  reservations: typeof reservations;
  userQueries: typeof userQueries;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
