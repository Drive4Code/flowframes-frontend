import { createRouter } from "@nanostores/router";
import { BaseDeepMap } from "nanostores";

if (import.meta.env.VITE_POCKETBASE_URL === undefined) {
  throw new Error("Missing VITE_POCKETBASE_URL enviroment variable");
}

if (import.meta.env.VITE_API_URL === undefined) {
  throw new Error("Missing VITE_API_URL enviroment variable");
}

if (import.meta.env.VITE_FRONTPAGE_URL === undefined) {
  throw new Error("Missing VITE_FRONTPAGE_URL enviroment variable");
}

function omitLastCharIfMatch(str: string, char: string) {
  if (str.endsWith(char)) {
    return str.slice(0, -1);
  }
  return str;
}

export const $router = createRouter({
  index: "/:modal_type/:modal_parameter?/:billing_period?/:subscription_plan?",
});
export const POCKETBASE_URL: string = import.meta.env.VITE_POCKETBASE_URL;
export const API_URL: string = omitLastCharIfMatch(
  import.meta.env.VITE_API_URL,
  "/",
);
export const FRONTPAGE_URL: string = omitLastCharIfMatch(
  import.meta.env.VITE_FRONTPAGE_URL,
  "/",
);

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  credits: number;
  tier: Tier;
  stripe_customer_id: string;
  subscription_id: string;
  plan_active: boolean;
  plan_expires: number;
};

export type Tier = "free" | "premium";

export enum WorkerOperations {
  DeleteVideo = "delete",
  DownloadVideo = "download",
}

export enum VideoWorkerOperations {
  DeleteVideo = "delete",
  DownloadVideo = "download",
}

export enum Status {
  Success = "success",
  Failure = "failure",
  Pending = "pending",
}

export type UserVideo = {
  id: string;
  preview_url?: string;
  video_duration: number;
  storage_filename?: string;
  processing_start_time?: number;
  processing_progress: number;
  queue_id: string;
  queued_time: number;
  thumbnail_url?: string;
  user_tier: Tier;
  video_title?: string;
  processing_error?: string;
  extra_data?: string;
  video_resolution: number;
  user_id: string;
};

export enum VideoPlatform {
  Youtube = "youtube",
  Twitch = "twitch",
  Upload = "upload",
  None = "",
}

export interface InputData extends BaseDeepMap {
  basic: {
    sectionLength: {
      start: number;
      end: number;
    };
    intrinsicLength: number;
    platform_video_id: string;
    url: string;
    platform: VideoPlatform;
    thumbnailUrl: string;
    resolution: 480 | 720 | 1080;
    fileName?: string;
    upload_filename?: string;
  };
  options: {
    autoEdit: boolean;
    muteProfanity: boolean;
    aiContent: boolean;
  };
  states: {
    invalidInput?: boolean | undefined;
    loading: boolean;
  };
}

export type QueueOpts = {
  video_platform: VideoPlatform;
  video_start_time: number;
  auto_edit: boolean;
  mute_profanity: boolean;
  generate_ai_content: boolean;
  video_end_time: number;
  video_resolution: 480 | 720 | 1080;
  // From Upload
  original_file_name?: string;
  upload_filename?: string;
  // From url
  thumbnail_url?: string;
  platform_video_id?: string;
};
