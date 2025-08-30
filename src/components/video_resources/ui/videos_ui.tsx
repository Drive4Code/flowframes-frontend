import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  Skeleton,
  Image,
  PressEvent,
} from "@heroui/react";
import { AiOutlineClockCircle } from "react-icons/ai";
import {
  delegateVideoDownload,
  formatTime,
  delegateVideoDeletion,
  getEstimatedTime,
  $downloadingVideo,
  userTier,
  setUrl,
  $videoPlaying,
  stopAllPlaying,
} from "../video_helpers";
import { ReactNode, Suspense, lazy } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { useStore } from "@nanostores/react";
import { $playTime, $loadAiContent } from "../video_helpers";
import { RiDeleteBinFill } from "react-icons/ri";
import { UserVideo } from "../../../types/global";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import AiContentSection from "./AiContent";
const VideoPlayer = lazy(() => import("./VideoPlayer"));

export function LoadButton({
  innerText,
  className,
  onClick,
  arrowDirection,
}: {
  innerText: string;
  className?: string;
  onClick?: (e: PressEvent) => void;
  arrowDirection?: "up" | "down";
}) {
  return (
    <Button
      onPress={onClick ? onClick : undefined}
      variant="shadow"
      className={`text-[1.25rem] font-[500] opacity-75 ${className} `}
    >
      {arrowDirection === "up" ? (
        <FaArrowUp className="h-6 w-6" />
      ) : (
        <FaArrowDown className="h-6 w-6" />
      )}

      {innerText}
    </Button>
  );
}

function VideoDetailCard({
  userVideo,
  className,
}: {
  userVideo: UserVideo;
  className?: string;
}) {
  const playTime = useStore($playTime);
  const loadAiContent = useStore($loadAiContent);
  return (
    <Card className={`${className}`}>
      <CardBody className="overflow-y-scroll md:scrollbar-hide">
        <div className="flex justify-between">
          <h1 className="self-start font-semibold line-clamp-1">
            {userVideo.video_title}
          </h1>
          <p className="font-semibold">
            {formatTime(userVideo.video_duration - playTime, true, true)}
          </p>
        </div>
        {loadAiContent && userVideo.extra_data ? (
          <AiContentSection extra_data_id={userVideo.extra_data} />
        ) : (
          userVideo.extra_data && (
            <LoadButton
              innerText="Load Ai Content"
              className="mx-auto opacity-65"
              onClick={() => {
                $loadAiContent.set(true);
              }}
            />
          )
        )}
      </CardBody>
    </Card>
  );
}

export function FullVideoCard({ videoData }: { videoData: UserVideo }) {
  const videoPlaying = useStore($videoPlaying);
  const loadAiContent = useStore($loadAiContent);

  // Processed video
  return (
    <Card
      className={
        "vidCard bg-stone-600 min-h-[50vw] lg:min-h-0 h-[28.5vw] lg:aspect-[14.5/9]"
      }
      // Styles
      isFooterBlurred
    >
      {/* Show the Video if it's the one clicked, else show the thumbnail */}
      <Image
        loading="lazy"
        onClick={() => {
          console.assert(typeof videoData.preview_url === "string");
          setUrl(videoData.preview_url!);
        }}
        id={videoData.id}
        src={
          videoData.thumbnail_url === "NOT_FOUND" ||
          videoData.thumbnail_url === ""
            ? "/videos/no_thumbnail.png"
            : videoData.thumbnail_url
        }
        // Styling
        className="vidCover cursor-pointer scale-[125%]"
        width={800}
      />
      {videoData.processing_progress == 100 ? (
        <>
          {videoPlaying === videoData.preview_url && (
            <Modal
              isOpen={true}
              onClose={() => {
                stopAllPlaying();
              }}
              size={window.innerWidth < 640 && loadAiContent ? "full" : "md"}
              radius="lg"
              className="vidModal dark max-w-[120rem] text-[1.8rem]"
              classNames={{
                body: "mt-[10px]",
              }}
            >
              <ModalContent>
                <ModalBody className="overflow-y-scroll md:scrollbar-hide">
                  <Suspense>
                    <Card className="mt-2 mx-2">
                      <VideoPlayer
                        vidLink={videoPlaying}
                        videoData={videoData}
                      />
                    </Card>
                    <VideoDetailCard userVideo={videoData} className="mx-2" />
                  </Suspense>
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
          <VideoCardsContainer>
            <VideoCards type="duration" duration={videoData.video_duration} />
            <VideoCards
              type="resolution"
              resolution={videoData.video_resolution}
            />
          </VideoCardsContainer>
          <VideoCardFooter
            type="static"
            title={videoData.video_title!}
            videoId={videoData.id}
          />
        </>
      ) : videoData.processing_progress == 0 ? (
        <div className="flex justify-center self-center">
          <VideoCards
            type="err"
            cardClassName="z-10 absolute top-[40%] md:top-[46%] text-[1.5rem] ]"
          >
            <CardBody
              className="pl-11 ml-2 text-red-600 cursor-pointer"
              onClick={() => delegateVideoDeletion(videoData.id)}
            >
              <RiDeleteBinFill className="absolute bottom-[20%] left-0 m-auto cursor-pointer w-10 h-10" />
              <span className="pl-1 text-[1.5rem]">Delete From Queue</span>
            </CardBody>
          </VideoCards>
          <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10 flex">
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-4 w-3/5 rounded-lg" />
              <Skeleton className="h-4 w-4/5 rounded-lg" />
            </div>
          </CardFooter>
        </div>
      ) : videoData.processing_progress == -1 ? (
        // Error Card
        <VideoCards
          type="err"
          cardClassName="z-10 absolute self-center top-[45%] text-[1.6rem]"
        >
          <CardBody
            className="pl-11 ml-2 text-red-600 cursor-pointer"
            onClick={() => delegateVideoDeletion(videoData.id)}
          >
            <p>Error: {videoData.processing_error}</p>
            <RiDeleteBinFill className=" absolute bottom-[25%] left-0 m-auto cursor-pointer w-10 h-10" />
          </CardBody>
        </VideoCards>
      ) : (
        // Processing
        <div>
          <VideoCards
            type="processing"
            processingStartTime={videoData.processing_start_time}
            duration={videoData.video_duration}
            cardClassName="z-10 absolute top-[45%] left-[40%] text-[1.5rem] "
          />
          <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10 flex">
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-4 w-3/5 rounded-lg" />
              <Skeleton className="h-4 w-4/5 rounded-lg" />
            </div>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}

type VideoCardProps = {
  type: "info" | "err" | "tier" | "duration" | "processing" | "resolution";
  children?: React.ReactNode | undefined;
  cardClassName?: string;
  bodyClassName?: string;
  // Specific Optional Components
  resolution?: number;
  tier?: userTier;
  duration?: number;
  processingStartTime?: number;
};

export function VideoCardsContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row gap-2 grid-rows-1 absolute z-10 m-auto left-[2%] top-[2%] opacity-70 text-[1.2rem]">
      {children}
    </div>
  );
}

export function VideoCards({
  type,
  children,
  cardClassName,
  bodyClassName,
  tier,
  resolution,
  duration,
  processingStartTime,
}: VideoCardProps) {
  {
    /* Video Info Cards */
  }

  switch (type) {
    case "info":
      return (
        <Card
          className={`infoCard   bg-[rgba(60,60,60,0.8)] text-[white] ${cardClassName}`}
        >
          <CardBody className={`${bodyClassName}`}>{children}</CardBody>
        </Card>
      );
    case "err":
      return (
        <Card
          className={`errCard bg-[rgba(60,60,60,0.8)] text-red-600 ${cardClassName}`}
        >
          {children}
        </Card>
      );
    // Premade components
    case "tier":
      return (
        <Card className={`infoCard text-[white] ${cardClassName} p-[0.33rem]`}>
          <CardBody className={`${bodyClassName}`}>
            <span className="text-[1.2rem] font-semibold">
              {tier === "premium" ? (
                // PREMIUM
                <span className="font-bold glowing text-[1.25rem]">
                  Premium
                </span>
              ) : (
                // FREE
                <span className="">Free Plan</span>
              )}
            </span>
          </CardBody>
        </Card>
      );
    case "duration":
      return (
        <Card
          className={`infoCard bg-[--tertiary] text-[white] ${cardClassName} p-[0.33rem]`}
        >
          <CardBody className={`pl-11 ml-2 ${bodyClassName}`}>
            <AiOutlineClockCircle className=" absolute top-[15%] left-0 m-auto cursor-pointer w-9 h-9" />
            <span className="pl-1 text-[1.2rem] font-semibold">
              {formatTime(duration, true)}
              {duration! < 60 ? "s" : ""}
            </span>
          </CardBody>
        </Card>
      );
    case "resolution":
      return (
        <Card
          className={`infoCard bg-[--tertiary] text-[white] ${cardClassName} p-[0.33rem]`}
        >
          <CardBody className={`${bodyClassName}`}>
            <span className="pl-1 text-[1.2rem] font-semibold">
              {resolution}p
            </span>
          </CardBody>
        </Card>
      );
    case "processing":
      return (
        <Card
          className={`infoCard  bg-[rgba(60,60,60,0.8)] text-[white] ${cardClassName} p-[0.33rem]`}
        >
          <CardBody className={`pl-11 ml-2 text-green-600 ${bodyClassName}`}>
            <AiOutlineClockCircle className="w-10 h-10 absolute left-0 mr-10 " />
            <p>
              Processing ~{getEstimatedTime(processingStartTime!, duration!)}m
            </p>
          </CardBody>
        </Card>
      );
  }
  {
    /* End Video Info Cards */
  }
}

export const VideoCardFooter = ({
  title,
  videoId,
}: {
  type: "static" | "hovering" | "queued";
  title: string;
  videoId: string;
}) => {
  const downloading = useStore($downloadingVideo);
  return (
    <div className="flex flex-row justify-center">
      <CardFooter
        className={` bottom-1 w-[98%] justify-between before:bg-white/10 border-white/20 border-[0.009px] overflow-hidden py-2 absolute before:rounded-xl rounded-large shadow-small z-10`}
      >
        <h2 className=" text-white/80 text-[1.5rem] line-clamp-1">{title}</h2>
        {/* User Interaction */}
        <div className="flex flex-row">
          {/* Download Button */}
          <Button
            onPress={() => {
              delegateVideoDownload(videoId, title);
            }}
            // Styling
            isDisabled={downloading}
            className="text-[1.2rem] font-semibold px-5 text-white bg-[--tertiary] opacity-95 h-11"
            variant="shadow"
            radius="lg"
            size="sm"
          >
            <h1>Download</h1>
          </Button>
          {/* End Download Button */}
          {/* Delete Dropdown */}
          <Dropdown className="dark">
            <DropdownTrigger>
              <Button
                variant="light"
                isIconOnly
                aria-label="Video dropdown with extra options"
              >
                <HiOutlineDotsVertical
                  className="h-[1.6rem] w-[1.8rem] text-blue-50 opacity-[88%]"
                  aria-label="Video Settings"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="faded" aria-label="Dropdown menu with icons">
              <DropdownItem
                key="delete"
                className="text-danger text-[1.6rem]"
                color="danger"
                onClick={() => delegateVideoDeletion(videoId, title)}
                startContent={<MdDeleteForever className="text-danger" />}
              >
                <span className="text-[1.5rem]">Delete Video</span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {/* End Delete Dropdown */}
        </div>
        {/* End User Interaction */}
      </CardFooter>
    </div>
  );
};
