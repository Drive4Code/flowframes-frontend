import { useStore } from "@nanostores/react";
// Styling
import "../../style/videos.css";
import { CircularProgress } from "@heroui/react";
// *******

// Data Stores
import { $loadedVideos, $videoData } from "../../helpers/pockebase.ts";
import { FullVideoCard, LoadButton } from "./ui/videos_ui.tsx";
import { $router, UserVideo } from "../../types/global";
import { useEffect } from "react";
import { $videoPlaying, stopAllPlaying } from "./video_helpers.ts";

export default function Videos() {
  // UseStores
  const videoData = useStore($videoData);
  const loadedVideos = useStore($loadedVideos);
  // **************

  useEffect(() => {
    const unbind_listener = $router.subscribe((route) => {
      if (
        route &&
        route.params.modal_type === "video" &&
        route.params.modal_parameter
      ) {
        $videoPlaying.set(route.params.modal_parameter);
      } else {
        $videoPlaying.set("");
      }
    });

    return () => {
      unbind_listener();
    };
  }, []);

  return videoData ? (
    <div
      className="Videos grid grid-cols-1 lg:grid-cols-2 gap-7 justify-center mx-auto self-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          stopAllPlaying();
        }
      }}
    >
      {videoData.slice(0, loadedVideos).map(
        (
          videoData: UserVideo, // , index is also available
        ) => (
          <div id={videoData.queue_id} key={videoData.queue_id}>
            <FullVideoCard videoData={videoData} />
          </div>
        ),
      )}
      {loadedVideos <= 4 && Object.keys($videoData.get()).length > 2 && (
        <LoadButton
          innerText="Load More"
          className="absolute left-[45%] bottom-[-3rem] text-[1.25rem] opacity-75"
          onClick={() => {
            $loadedVideos.set($loadedVideos.get() + 4);
          }}
        />
      )}
    </div>
  ) : (
    // Loading videos
    <div className="Videos flex absolute left-1/2 top-[100%]">
      <CircularProgress
        aria-label="Loading..."
        size="lg"
        classNames={{
          svg: "w-36 h-36 drop-shadow-md",
          indicator: "stroke-white",
          track: "stroke-white/10",
          value: "text-3xl font-semibold text-white",
        }}
        strokeWidth={4}
      />
    </div>
  );
}
