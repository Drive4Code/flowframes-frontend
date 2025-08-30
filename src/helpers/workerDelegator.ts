import { Status, WorkerOperations, VideoWorkerOperations } from "../types/global";
import VideosWorker from "./videosWorker/videosWorker?worker";

function createWorker(operation: WorkerOperations) {
  if (operation in VideoWorkerOperations) {
    return new VideosWorker();
  }
  return new VideosWorker(); // TEMP
}

export async function delegateTask(
  operation: WorkerOperations,
  taskBody: object
) {
  const worker = createWorker(operation);
  worker.postMessage({
    operation,
    taskBody,
  });
  return new Promise<{ status: Status; blobUrl?: string }>(
    (resolve, reject) => {
      worker.onmessage = function (event: MessageEvent) {
        worker.terminate();
        console.log(`Worker Task Completed: ${event.data}`);
        if (event.data.status === Status.Failure) {
          return reject(event.data);
        }
        return resolve(event.data);
      };
    }
  );
}
