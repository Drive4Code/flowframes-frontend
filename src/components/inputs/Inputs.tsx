// Library Imports
import { Suspense, lazy, useRef, useState } from "react";
import { useStore } from "@nanostores/react";

// Component imports
import { VideoPlatform, QueueOpts } from "../../types/global.ts";
import { enqueue } from "../../helpers/queue.ts";
import { $queueNum } from "../video_resources/video_helpers.ts";
import DragAndDropFileUpload from "./ui/dragNDrop.tsx";
const Videos = lazy(() => import("../video_resources/Videos.tsx"));
const Preview = lazy(async () => {
  return import("./ui/inputs_ui.tsx").then((module) => {
    return { default: module.Preview };
  });
});
import { $input, resetInputs } from "./inputs_helpers.ts";

// Styling
import { Button, Input } from "@heroui/react";
import { BiLink } from "react-icons/bi";
import { toast } from "react-toastify";
import { MdCancel } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { clearPartialUploads } from "../../helpers/general_helpers.ts";

export default function Inputs() {
  // Use states
  const input = useStore($input);
  const { platform } = input.basic;
  const { loading, invalidInput } = input.states;
  const [url, setUrl] = useState("");

  function resetAllInputs() {
    URL.revokeObjectURL($input.get().basic.url);
    setUrl("");
    resetInputs();
  }

  async function attemptToEnqueue() {
    if (platform === VideoPlatform.None) {
      return;
    }
    if (numQueues >= 3) {
      toast.error("Too Many Queued Items!", {
        toastId: "queue-err",
      });
      resetAllInputs();
      return;
    }

    // Queue The Video
    const inputData = $input.get();
    const queueOptions: QueueOpts = {
      video_platform: inputData.basic.platform,
      video_start_time: inputData.basic.sectionLength.start,
      video_end_time: inputData.basic.sectionLength.end,
      auto_edit: inputData.options.autoEdit,
      mute_profanity: inputData.options.muteProfanity,
      generate_ai_content: inputData.options.aiContent,
      thumbnail_url: inputData.basic.thumbnailUrl,
      video_resolution: inputData.basic.resolution,
      platform_video_id: inputData.basic.platform_video_id,
      original_file_name: inputData.basic.fileName,
      upload_filename: inputData.basic.upload_filename,
    };
    const queuePromise = enqueue(queueOptions).finally(() => {
      resetAllInputs();
    });
    toast.promise(queuePromise, {
      pending: `Enqueueing ${queueOptions.original_file_name}...`,
      success: "Video queued succesfully",
      error: `Error enqueueing your video. Please, contact our support`,
    });
  }

  // const handleInputChange = (possibleUrl: string) => {
  //   $input.setKey("states.loading", true);
  //   $input.setKey("basic.url", possibleUrl);
  //   setUrl(possibleUrl); // Handles the change in the user pov. Completely due to NextUI not integrating well with nanostores.
  //   const { videoId, platform } = inputChecked(possibleUrl);
  //   if (platform === Platform.None) {
  //     // The inputted URL wasn't valid
  //     console.log("Invalid Input: " + possibleUrl);
  //     $input.setKey("basic.videoId", "");
  //     $input.setKey("states", {
  //       ...input.states,
  //       invalidInput: true,
  //       loading: false,
  //     });
  //     return;
  //   }

  //   $input.setKey("basic", { ...input.basic, videoId, platform });
  //   $input.setKey("states.invalidInput", false);
  // };

  const numQueues = useStore($queueNum);
  const video_ref = useRef(null);
  return (
    <div>
      <div
        className={`flex justify-center transition-all ease-in-out duration-700  ${
          input.basic.platform !== VideoPlatform.None ? "mt-0" : "mt-[13vh]"
        } flex-col`}
        onKeyDown={(e) => {
          // console.log(e.key);
          if (e.key === "Escape") {
            resetAllInputs();
          }
        }}
      >
        {input.basic.platform !== VideoPlatform.None && (
          <IoMdCloseCircle
            className="cursor-pointer mx-auto mb-2 self-center text-gray-400 opacity-85 w-20 h-20"
            onClick={() => {
              resetAllInputs();
              if (input.basic.platform == VideoPlatform.Upload) {
                clearPartialUploads();
              }
            }}
          />
        )}
        <Input
          isDisabled={input.basic.platform === VideoPlatform.None}
          type="url"
          placeholder={
            input.basic.platform === VideoPlatform.None
              ? "Url support is coming soon!"
              : ""
          }
          name="link"
          id="input-link"
          value={url}
          onValueChange={() => {
            // handleInputChange(newStr);
          }}
          onFocusChange={() => {
            if (invalidInput !== undefined) {
              $input.setKey("states.invalidInput", false);
            }
          }}
          // Styling
          isInvalid={invalidInput}
          radius="sm"
          size="lg"
          className={`input max-w-[64rem] mx-auto h-[2rem]`}
          classNames={{
            label: ["h-[2rem]"],
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              "mt-10",
              "mb-10",
              "p-10",
            ],
            innerWrapper: ["bg-transparent"],
            inputWrapper: [
              "shadow-xl",
              "bg-default-200/50",
              "dark:bg-default/60",
              "backdrop-blur-xl",
              "backdrop-saturate-200",
              "hover:bg-default-200/70",
              "dark:hover:bg-default/70",
              "group-data-[focused=true]:bg-default-200/50",
              "dark:group-data-[focused=true]:bg-default/60",
              "!cursor-text",
              "center",
              // "mb-10",
              "b-10",
              "pt-10",
              "pb-10",
            ],
          }}
          // ********
          startContent={
            <BiLink className="w-11 h-11 text-gray-500 opacity-90" />
          }
          endContent={
            <div className="flex flex-row space-x-1">
              {url && (
                <MdCancel
                  className="cursor-pointer w-10 h-10 mt-1 text-white opacity-45"
                  onClick={resetAllInputs}
                />
              )}

              <Button
                variant="faded"
                className="border-0 bg-[--tertiary] text-white text-[1.4rem] font-bold px-4"
                size="lg"
                radius="sm"
                isLoading={loading}
                onPress={attemptToEnqueue}
              >
                Process Video
              </Button>
            </div>
          }
        />
      </div>
      {platform !== VideoPlatform.None ? (
        <Suspense>
          <Preview className="mt-3" video_ref={video_ref} />
        </Suspense>
      ) : (
        <div className="flex flex-col justify-center">
          <DragAndDropFileUpload className="mt-10 mb-10" />
          <Suspense>
            <Videos />
          </Suspense>
        </div>
      )}
    </div>
  );
}
