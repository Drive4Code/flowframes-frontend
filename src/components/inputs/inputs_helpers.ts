import { deepMap } from "nanostores";
import { InputData, VideoPlatform } from "../../types/global";

// Nanostore state management

export const $input = deepMap<InputData>({
  basic: {
    sectionLength: {
      start: 0,
      end: -1,
    },
    intrinsicLength: 0,
    platform_video_id: "",
    url: "",
    platform: VideoPlatform.None,
    thumbnailUrl: "",
    resolution: 480,
  },
  options: {
    autoEdit: false,
    muteProfanity: true,
    aiContent: false,
  },
  states: {
    invalidInput: undefined,
    loading: false,
  },
});
// **************************

/**
 *
 * @param platform The platform of the video
 * @param vidId The ID of the video
 * @returns The thumbnail URL
 */
export function getThumb(platform: VideoPlatform, vidId: string) {
  const image = document.createElement("img");
  let thumbnailUrl = "";
  if (platform === VideoPlatform.Youtube) {
    thumbnailUrl = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
    image.setAttribute("src", thumbnailUrl);
    image.setAttribute("style", "width: 0px; height: 0px");
    console.log(image.naturalWidth);
    if (image.naturalWidth < 400) {
      // Fallback to 0th thumbnail by checking dimensions of image https://stackoverflow.com/questions/18681788/how-to-get-a-youtube-thumbnail-from-a-youtube-iframe
      thumbnailUrl = `https://img.youtube.com/vi/${vidId}/0.jpg`;
    }
  } else if (platform === VideoPlatform.Twitch) {
    thumbnailUrl = "NOT_FOUND";
  }
  return thumbnailUrl;
}

export function inputChecked(input: string) {
  const regExYT =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/; // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
  const ytMatch = input.match(regExYT);
  const regExTW = /(?:https:\/\/)?www\.twitch\.tv\/videos\/(\d{10})/;
  const twMatch = input.match(regExTW);
  if (ytMatch && ytMatch[1].length === 11) {
    return { videoId: ytMatch[1], platform: VideoPlatform.Youtube };
  } else if (twMatch && twMatch[1].length === 10) {
    return { videoId: twMatch[1], platform: VideoPlatform.Twitch };
  }
  return { videoId: "", platform: VideoPlatform.None };
}

export function resetInputs() {
  const input = $input.get();
  $input.set({
    ...input,
    basic: {
      sectionLength: {
        start: 0,
        end: 0,
      },
      intrinsicLength: 0,
      url: "",
      platform_video_id: "",
      thumbnailUrl: "",
      platform: VideoPlatform.None,
      resolution: 720,
    },
    states: {
      loading: false,
      invalidInput: undefined,
    },
  });
}
