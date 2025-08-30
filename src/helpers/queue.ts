// App Imports
import { requestFromApi } from "./general_helpers";
import { QueueOpts } from "../types/global";

export async function enqueue({
  video_platform,
  video_start_time,
  auto_edit,
  mute_profanity,
  generate_ai_content,
  video_end_time,
  video_resolution,
  original_file_name,
  upload_filename,
  thumbnail_url,
  platform_video_id,
}: QueueOpts) {
  return requestFromApi("POST", "/videos/v2/enqueue", {
    body: {
      video_platform,
      video_start_time,
      video_end_time,
      generate_ai_content,
      auto_edit,
      mute_profanity,
      video_title: original_file_name,
      upload_filename,
      thumbnail_url,
      video_resolution,
      platform_video_id,
      // Additional metadata that are now purposely hard-coded
      profanity_filter_strength: "mid",
      timestamp_accuracy: "low",
    },
  });
}
