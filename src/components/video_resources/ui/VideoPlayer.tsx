import React, { useRef, useEffect, useState } from "react";
import { $playTime } from "../video_helpers";
import { $keyPressed } from "../../../helpers/global_states";
import { useStore } from "@nanostores/react";

export default function VideoPlayer({
  vidLink,
  videoData,
}: {
  vidLink: string;
  videoData: { id: string; thumbnail_url?: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playTime = useStore($playTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLength, setVideoLength] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Load the video when component renders
    videoRef.current?.load();
  }, []);

  useEffect(() => {
    const unbindListener = $keyPressed.subscribe((key) => {
      switch (key) {
        case "ArrowLeft":
          skipTime($playTime.get() - 10);
          break;
        case "ArrowRight":
          skipTime($playTime.get() + 10);
          break;
        case "k":
        case " ":
          toggle_video_playing();
          break;
      }
      // console.log(key);
      $keyPressed.set("");
    });
    return () => {
      unbindListener();
    };
  }, []);

  function toggle_video_playing() {
    if (!videoRef.current) {
      console.error("ERROR: Videoref is null");
      return;
    }
    const current_video_ref = videoRef.current as HTMLVideoElement;

    if (current_video_ref.paused) {
      current_video_ref.play();
    } else {
      current_video_ref.pause();
    }
  }

  function updateTime(current_time: number, video_length: number) {
    // console.warn(
    //   `Current Time: ${current_time}; Video Length: ${video_length}`
    // );
    if (isNaN(current_time) || !isFinite(current_time) || current_time === 0) {
      return;
    }
    $playTime.set(current_time);
    const percentagePlayed = 100 - (current_time / video_length) * 100;
    // console.warn(percentagePlayed);
    console.assert(document.querySelector(".ProgressBarInner") !== null);
    const progress_bar_inner = document.querySelector(
      ".ProgressBarInner",
    )! as HTMLElement;
    progress_bar_inner.style.setProperty(
      "--playedTime",
      `${percentagePlayed}%`,
    );
    // console.warn(document.documentElement.style)
  }

  function skipTime(point: number) {
    // console.log(point);
    if (!videoRef.current) {
      console.error("ERROR: Videoref is null");
      return;
    }
    (videoRef.current as HTMLVideoElement).currentTime = point;
  }

  /**
   * Calculates the point in the timeline the user cliked at, & seeks to that point
   * @param event React.MouseEvent<HTMLDivElement, MouseEvent>
   */
  function timelineClickHandler(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    video_length: number,
  ) {
    const target = event.target as HTMLElement;

    const timeline_rectangle = target.getBoundingClientRect();
    const mouse_x_pos = event.clientX;
    const rectWidth = timeline_rectangle.width;
    const rectLeft = timeline_rectangle.left;

    const pct_timeline_progress =
      1 - (rectWidth - (mouse_x_pos - rectLeft)) / rectWidth;
    if (isNaN(pct_timeline_progress) || !isFinite(pct_timeline_progress)) {
      console.error("Skip Time: Invalid Value");
      return;
    }
    skipTime(video_length * pct_timeline_progress);
  }

  return (
    <div
      className="VideoContainer"
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
    >
      <video
        poster={videoData.thumbnail_url}
        autoPlay
        ref={videoRef}
        id={videoData.id}
        className="aspect-video h-[60vh] cursor-pointer mx-auto"
        onLoadedData={() => {
          // Handle video loaded data
          // ...
        }}
        onDurationChange={() => {
          setVideoLength(videoRef.current!.duration);
        }}
        onPlaying={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onTimeUpdate={() => {
          if (Math.abs(playTime - videoRef.current!.currentTime) > 0.1) {
            updateTime(videoRef.current!.currentTime, videoLength);
          }
        }}
        onClick={toggle_video_playing}
        onEnded={() => skipTime(0)}
      >
        <source src={vidLink} type="video/mp4" />
      </video>

      {/* Video Overlay */}
      <div
        className="vidOverlay"
        onMouseEnter={() => {
          setHovering(true);
        }}
      >
        {/* Progress Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[10px] bg-gray-700 cursor-pointer rounded-b-2xl ${
            hovering
              ? "transition-all hover:h-[20px] ease-linear duration-100"
              : ""
          }`}
          onDoubleClick={(event) => timelineClickHandler(event, videoLength)}
          onClick={(event) => timelineClickHandler(event, videoLength)}
          onMouseEnter={() => {
            setHovering(true);
          }}
          onMouseLeave={() => {
            setHovering(false);
          }}
        >
          <div
            className="ProgressBarInner"
            style={
              {
                // animationPlayState: isPlaying ? "running" : "paused",
              }
            }
          ></div>
        </div>
      </div>
      {/* Video Controls */}
      <div
        className={`videoControls ${
          hovering ? "opacity-100" : "opacity-0"
        } ease-linear duration-100`}
      >
        <div
          className="controls"
          onMouseEnter={() => {
            setHovering(true);
          }}
        >
          {isPlaying ? (
            <img
              className="playIcon"
              alt="Video Playing Pause Icon"
              onClick={toggle_video_playing}
              src="/videos/pause.webp"
            ></img>
          ) : (
            <img
              className="playIcon"
              onClick={toggle_video_playing}
              alt="Video Playing Icon"
              src="/videos/play.webp"
            ></img>
          )}
        </div>
      </div>
    </div>
  );
}
