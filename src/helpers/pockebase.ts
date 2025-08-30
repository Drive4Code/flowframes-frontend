import PocketBase, { ClientResponseError, RecordModel } from "pocketbase";
import { atom } from "nanostores";
import { POCKETBASE_URL, UserRecord, UserVideo } from "../types/global";
import { timeoutTimer } from "./auth";

// Pocketabse states
export const pb = new PocketBase(POCKETBASE_URL);
export const $currUserId = atom<string | undefined>(pb.authStore.record?.id);
export const $currUserToken = atom<string>(pb.authStore.token);

//Video States
export const $loadedVideos = atom<number>(4);
export const $userData = atom<UserRecord | null>(null);
export const $videoData = atom<UserVideo[]>([]);

// Authentication Monitor
pb.authStore.onChange(() => {
  console.info("authStore Change ", pb.authStore);
  $currUserId.set(pb.authStore.record?.id);
  $currUserToken.set(pb.authStore.token);
});

// Methods
function parseUserRecord(userRecord: RecordModel) {
  console.log("[ parseUserRecord ] Full Record:", userRecord);
  console.log("[ parseUserRecord ] Videos:", userRecord.expand);
  $userData.set(userRecord as unknown as UserRecord);
  // Parse video data
  // console.warn(typeof userRecord.expand?.videos)
  if (
    userRecord.expand === undefined ||
    userRecord.expand.videos === undefined
  ) {
    $videoData.set([]);
    return;
  }
  const videoData: UserVideo[] = userRecord.expand.videos;
  $videoData.set(
    videoData.sort(
      (a: UserVideo, b: UserVideo) => b.queued_time - a.queued_time,
    ),
  );
  console.log("[ parseUserRecord ] New videoData: ", userRecord.expand.videos);
}

export function isRequestAutocancelled(error: unknown) {
  if (
    error instanceof ClientResponseError &&
    error.message.includes("autocancelled")
  ) {
    // Auto-cancelled request
    console.warn("Request was autocancelled");
    return true;
  }
  return false;
}

export function fetchAndSubscribeToUserData(
  user_id: string,
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
) {
  pb.collection("users").unsubscribe();
  pb.collection("users")
    .getOne(user_id, { expand: "videos" })
    .then((userRecord) => {
      parseUserRecord(userRecord);
      setLoaded(true);
    })
    .catch((err) => {
      if (isRequestAutocancelled(err)) {
        return;
      }
      console.error("Error fetching user record:", err);
      timeoutTimer(1);
    });
  pb.collection("users").subscribe(
    user_id,
    (event) => parseUserRecord(event.record),
    { expand: "videos" },
  );
  return true;
}
