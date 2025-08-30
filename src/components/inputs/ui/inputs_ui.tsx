import { useStore } from "@nanostores/react";
import { VideoPlatform } from "../../../types/global";
import { Button, ButtonGroup, Card, Slider, Switch, cn } from "@heroui/react";
import { Suspense } from "react";
import { $input, getThumb } from "../inputs_helpers";
import { formatTime } from "../../video_resources/video_helpers";

type OptionsType = {
  title: string;
  body: string;
  callback: (isSelected: boolean) => void;
  followed: boolean;
};

export const OptionSlider = (opts: OptionsType) => {
  return (
    <Switch
      isSelected={opts.followed}
      onValueChange={opts.callback}
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary",
        ),
        wrapper: "p-0 h-4 overflow-visible",
        thumb: cn(
          "w-6 h-6 border-2 shadow-lg",
          "group-data-[hover=true]:border-primary",
          //selected
          "group-data-[selected=true]:ml-6",
          // pressed
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ml-4",
        ),
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-[1.5rem]">{opts.title}</p>
        <p className="text-default-400">{opts.body}</p>
      </div>
    </Switch>
  );
};

function SectionSlider({ className }: { className?: string }) {
  const input = useStore($input);
  const { intrinsicLength } = input.basic;

  return (
    <Slider
      step={3}
      minValue={0}
      maxValue={intrinsicLength}
      defaultValue={[0, intrinsicLength]}
      // showOutline={true}
      showTooltip={false}
      disableThumbScale={true}
      className={className}
      classNames={{
        base: "",
        filler: "bg-gradient-to-r from-primary-500 to-secondary-400",
        labelWrapper: "mb-2",
        label: "font-medium text-default-700 text-medium",
        value: "font-medium text-default-500 text-small",
        thumb: [
          "transition-size",
          "bg-gradient-to-r from-secondary-400 to-primary-500",
          "data-[dragging=true]:shadow-lg data-[dragging=true]:shadow-black/20",
          "data-[dragging=true]:w-7 data-[dragging=true]:h-7 data-[dragging=true]:after:h-6 data-[dragging=true]:after:w-6",
        ],
        step: "data-[in-range=true]:bg-black/30 dark:data-[in-range=true]:bg-white/50",
      }}
      tooltipProps={{
        offset: 10,
        placement: "top",
        // content: [formatTime(sectionLength.end - sectionLength.start, true)],
        classNames: {
          base: [
            // arrow color
            "before:bg-gradient-to-r before:from-secondary-400 before:to-primary-500",
          ],
          content: [
            "py-2 shadow-xl",
            "text-white bg-gradient-to-r from-secondary-400 to-primary-500",
          ],
        },
      }}
      getValue={(change: number | number[]) => {
        return formatTime((change as number[])[1] - (change as number[])[0]);
      }}
      onChange={(change: number | number[]) => {
        const minimum: number = (change as number[])[0];
        const max: number = (change as number[])[1];
        console.info(`New Section lengths min: ${minimum} max: ${max}`);
        let end = max;
        if (max - minimum < 60) {
          end = Math.floor(minimum + 61);
        }
        $input.setKey("basic.sectionLength", { start: minimum, end: end });
      }}
    />
  );
}

export function Preview({
  className,
  video_ref,
}: {
  video_ref: any;
  className?: string;
}) {
  const input = useStore($input);
  const {
    sectionLength,
    platform_video_id,
    platform,
    intrinsicLength,
    url,
    resolution,
  } = input.basic;
  const { autoEdit, muteProfanity, aiContent } = input.options;
  const loading = input.states.loading;

  function setMetadata() {
    const curr_element = video_ref.current;
    if (curr_element === null) {
      return;
    }
    const duration = Math.round(curr_element.duration);
    if (platform !== VideoPlatform.Upload) {
      $input.setKey(
        "basic.thumbnailUrl",
        getThumb(platform, platform_video_id),
      );
      $input.setKey("states.loading", false);
    }
    console.assert(duration > 0);
    console.warn(`Duration: ${duration}`);
    $input.setKey("basic.intrinsicLength", duration);
    $input.setKey("basic.sectionLength.end", duration);
  }

  return (
    <div
      className={`flex justify-center overflow-hidden ${className} ${
        platform !== VideoPlatform.Upload && loading ? "hidden" : ""
      }`}
    >
      <Card
        className="flex  bg-[var(--primary)] max-w-[90rem] mt-10 opacity-95"
        // Styles
        isFooterBlurred
      >
        <Suspense>
          <div className="flex justify-center">
            <video
              src={
                platform === "youtube"
                  ? `https://www.youtube.com/watch?v=${platform_video_id}`
                  : platform === "twitch"
                    ? `https://www.twitch.tv/videos/${platform_video_id}`
                    : url // platform === "upload"
              }
              ref={video_ref}
              controls
              preload="metadata"
              onLoadedMetadata={setMetadata}
              className="rounded-md"
            />
          </div>
          <div className="flex flex-col self-center mt-2 ml-4">
            <ButtonGroup className="self-center my-3" radius="sm">
              <Button
                className={`text-4xl font-bold text-gray-300 "bg-[var(--tertiary)]" ${
                  resolution !== 480 && "bg-[var(--tertiary)]"
                }`}
                onClick={() => {
                  $input.setKey("basic.resolution", 480);
                }}
              >
                480p
              </Button>
              <Button
                className={`text-4xl font-bold text-gray-300 "bg-[var(--tertiary)]" ${
                  resolution !== 720 && "bg-[var(--tertiary)]"
                }`}
                onClick={() => {
                  $input.setKey("basic.resolution", 720);
                }}
              >
                720p
              </Button>
              <Button
                className={`text-4xl font-bold text-gray-300 "bg-[var(--tertiary)]" ${
                  resolution !== 1080 && "bg-[var(--tertiary)]"
                }`}
                onClick={() => {
                  $input.setKey("basic.resolution", 1080);
                }}
              >
                1080p
              </Button>
            </ButtonGroup>
            {intrinsicLength > 60 && (
              <Card
                className="mb-2 p-4 self-center left-[-0.5rem] w-[90vw] max-w-[60rem]"
                radius="sm"
              >
                <h2 className="float-left text-2xl p-1 flex justify-between">
                  <span className="mx-auto">
                    Section selected:{" "}
                    {formatTime(sectionLength.start, true) +
                      " to " +
                      formatTime(sectionLength.end, true)}{" "}
                    ({formatTime(sectionLength.end - sectionLength.start, true)}
                    )
                  </span>
                </h2>
                <SectionSlider />
              </Card>
            )}
            <div className="grid grid-cols-1 self-center sm:grid-cols-2 space-y-2 space-x-2 content-center justify-center justify-self-center mb-2">
              <OptionSlider
                followed={muteProfanity}
                title={"Mute Profanity"}
                body={
                  "Removes Profanity from a video. Useful for Making Sure Youtube will Monetize Your Video"
                }
                callback={(isSelected: boolean) => {
                  $input.setKey("options.muteProfanity", isSelected);
                  console.info("MuteProfanity New Value:", isSelected);
                }}
              />
              <OptionSlider
                followed={autoEdit}
                title={"AI Video Editor"}
                body={"Removes Awkward Pauses & Silences Automatically"}
                callback={(isSelected) => {
                  $input.setKey("options.autoEdit", isSelected);
                  console.info("AutoEdit New Value:", isSelected);
                }}
              />
              <OptionSlider
                followed={aiContent}
                title={"AI Extra Content (Beta)"}
                body={
                  "Generate Title, Description, & Youtube Timestamps with AI"
                }
                callback={(isSelected) => {
                  $input.setKey("options.aiContent", isSelected);
                  console.info("AiContent New Value:", isSelected);
                }}
              />
            </div>
          </div>
        </Suspense>
      </Card>
    </div>
  );
}
