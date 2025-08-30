import { deleteVideo, downloadVideo } from "./functionality";
import { Status, WorkerOperations } from "../../types/global";

self.onmessage = async (event) => {
  console.log("[ Worker ] ", event.data);
  const { operation, ...eventData } = event.data;
  if (operation === WorkerOperations.DownloadVideo) {
    const { fileName, userToken } = eventData.taskBody;
    const downloadPromise = await downloadVideo(fileName, userToken).catch(
      (err) => err
    );
    let status;
    if (downloadPromise !== "error") {
      status = Status.Success;
    } else {
      status = Status.Failure;
    }
    postMessage({
      status,
      blobUrl: downloadPromise,
    });
  } else if (operation === WorkerOperations.DeleteVideo) {
    console.assert(typeof eventData.taskBody.video_id === "string")
    const { video_id, userToken } = eventData.taskBody;
    const deletePromise = await deleteVideo(video_id, userToken).catch(
      (err) => err
    );
    let status;
    if (deletePromise !== "error") {
      status = Status.Success;
    } else {
      status = Status.Failure;
    }
    postMessage({
      status,
    });
  }
};
