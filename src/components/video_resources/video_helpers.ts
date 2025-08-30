import saveAs from "file-saver";
import { toast } from "react-toastify";
import filenamify from "filenamify";
import { atom, map } from "nanostores";
import { AiVideoData } from "./ui/AiContent";
import {
  deleteVideo,
  downloadVideo,
} from "../../helpers/videosWorker/functionality";
import { openPage } from "@nanostores/router";
import { $router } from "../../types/global";

export const $downloadingVideo = atom(false);
export const $aiData = map<AiVideoData>({
  title: "",
  description: "",
  tags: [""],
  timestamps: [{ timestamp: "", title: "" }],
});

export const $fileToken = atom<[string, number]>(["", 0]); // TODO Check if this gets regenerated per refresh
// ******

export const $queueNum = atom<number>(0);
export const $loadAiContent = atom(false);

// Video global states
export const $playTime = atom<number>(0);
export const $oldVidID = atom<string>("");
export const $videoPlaying = atom<string>("");

export function setUrl(url: string) {
  openPage($router, "index", { modal_type: "video", modal_parameter: url });
  $videoPlaying.set(url);
  console.info("SetUrl URL:", url);
  return;
}

export function stopAllPlaying() {
  openPage($router, "index", { modal_type: "" });
}

export type userTier = "free" | "premium";

export function formatTime(
  time: number | undefined,
  displayHms?: boolean,
  showLeadingZero?: boolean,
): string {
  let result = "";
  if (!time) {
    return "0";
  }
  /* Time display logic */
  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor((time % 3600) / 60);
  const actualSeconds = Math.floor(time % 60);
  if (hours >= 1) {
    result += `${hours}`;
    if (displayHms) {
      result += "h";
    }
    result += ":";
  }
  if (minutes >= 1) {
    result += `${minutes}`;
    if (displayHms) {
      result += "m";
    }
    result += ":";
  }
  if (actualSeconds < 10) {
    if (showLeadingZero) {
      result += "0";
    }
    result += `${actualSeconds}`;
    if (displayHms) {
      result += "s";
    }
  } else {
    result += `${actualSeconds}`;
    if (displayHms) {
      result += "s";
    }
  }
  return result;
}

/**
 * Function to calculate the time it will take for something to complete
 * @param startTime [UNIX : number] The time the process has started
 * @param vidLength [UNIX : number] The length of the section selected
 * @returns [UNIX : number] The estimated time for the action to complete
 */
export function getEstimatedTime(startTime: number, vidLength: number): number {
  const timeDiff = (Date.now() - startTime) / 60 / 60;
  // console.log(timeDiff);
  const video_processing_constant = 0.244; // Each Second takes 0.75 seconds to process
  let result = Math.floor(
    (vidLength * video_processing_constant - timeDiff) / 60,
  );
  if (result < 0) {
    result = 1;
  }
  return result;
}

export async function delegateVideoDownload(fileName: string, title?: string) {
  $downloadingVideo.set(true);
  const downloadPromise = downloadVideo(fileName)
    .then((blobUrl) => {
      if (blobUrl === null) {
        throw new Error("Error downloading video");
      }
      if (typeof title !== "string") {
        title = fileName;
      } else {
        title += ".mp4";
      }
      const outFilename = filenamify(title, { replacement: "_" });
      saveAs(blobUrl, outFilename);
    })
    .finally(() => {
      $downloadingVideo.set(false);
    });
  toast.promise(downloadPromise, {
    pending: `Downloading ${title}...`,
    success: `Downloaded ${title} Successfully!`,
    error: "Error Downloading",
  });
}

/**
 * Deletes a Video from db and storage if it's a video, only from db if queued
 * @param videoId The queue ID of the video to delete
 * @param [title=""] Optional title of the video being deleted
 */
export async function delegateVideoDeletion(video_id: string, title = "") {
  toast.promise(deleteVideo(video_id), {
    pending: `Deleting ${title}...`,
    error: `Error Deleting ${title}`,
    success: `Successfully deleted ${title}`,
  });
}
