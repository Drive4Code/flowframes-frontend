import { requestFromApi } from "../general_helpers";

/**
 * Gets a blob from the downloadURL and downloads it to local storage
 * @param fileName The id of the video (record) to download
 */
export async function downloadVideo(video_id: string): Promise<string | null> {
  // 1. Go to https://console.cloud.google.com/welcome?project=entiguiswears&cloudshell=true
  // 2. Run your cloud shell
  // 3. Click on editor
  // 4. Make/ edit cors.json like this: https://firebase.google.com/docs/storage/web/download-files
  // 5. Run: gsutil cors set cors.json gs://entiguiswears.appspot.com
  // 6. Run gcloud storage buckets update gs://entiguiswears.appspot.com  --cors-file=cors.json
  //

  return requestFromApi("PATCH", "/videos/v2/download", {
    body: {
      video_id: video_id,
    },
  })
    .then((response) => {
      const downloadUrl = response.body.download_url;
      if (downloadUrl === undefined) {
        console.error("[ downloadVideo ] No download url in response");
        return null;
      }
      return fetch(downloadUrl, {
        method: "GET",
      })
        .then((downloadUrl) =>
          downloadUrl.blob().then((createdBlob) => {
            if (createdBlob.type === "application/xml") {
              throw new Error(
                `Mime type of blob was ${createdBlob.type}, which isn't a video or binary stream`,
              );
            }
            return URL.createObjectURL(createdBlob);
          }),
        )
        .catch((err) => {
          console.error(
            "[ downloadVideo ] Error downloading video from generated url:",
            err,
          );
          return null;
        });
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
}

/**
 * Deletes a Video from db and storage if it's a video, only from db if queued
 * @param videoId The queue Id (also known as video id) of the video to delete
 * @param title - optional - The title of the video for better toast display
 */
export async function deleteVideo(video_id: string): Promise<boolean> {
  return requestFromApi("DELETE", "/videos/v2/delete", {
    body: {
      video_id,
    },
  })
    .then(() => true)
    .catch((err) => {
      console.error(`[ deleteVideo ] Error deleting: \n${err}`);
      return false;
    });
}
