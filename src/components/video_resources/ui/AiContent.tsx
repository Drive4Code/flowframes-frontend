import { useEffect, useState } from "react";
import { pb } from "../../../helpers/pockebase";
import { Card, Divider, Kbd, Snippet } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { LoadButton } from "./videos_ui";
import { $loadAiContent } from "../video_helpers";
import { $aiData } from "../video_helpers";

export type AiVideoData = {
  title: string;
  description: string;
  tags: [string];
  timestamps: [{ timestamp: string; title: string }];
};

export default function AiContentSection({
  extra_data_id,
}: {
  extra_data_id: string;
}) {
  const { title, description, tags, timestamps } = useStore($aiData);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!extra_data_id) {
      return;
    }
    pb.collection("extravideodata")
      .getOne(extra_data_id)
      .then((resData) => {
        // console.warn(resData.aiData);
        $aiData.set({
          title: resData.ai_title,
          description: resData.ai_description,
          tags: resData.ai_tags,
          timestamps: resData.ai_timestamps,
        });
      })
      .catch(() => {
        return;
      })
      .finally(() => {
        setLoaded(true);
      });

    return () => {
      $aiData.set({
        title: "",
        description: "",
        tags: [""],
        timestamps: [{ timestamp: "", title: "" }],
      });
    };
  }, []);

  return (
    <div>
      {(title !== "" || description !== "") && loaded && (
        <div className="flex flex-col space-y-2">
          <br />
          <Divider />
          <br />
          <h2 className="text-5xl opacity-80">Ai Generated Content</h2>
          <br />
          <h2 className="text-4xl">Title:</h2>
          <Snippet
            symbol=""
            size="lg"
            className="text-xl mt-5 opacity-70"
            onClick={() => {
              navigator.clipboard.writeText(title);
            }}
            tooltipProps={{
              color: "foreground",
              content: "Copy this title",
              disableAnimation: true,
              placement: "right",
              closeDelay: 0,
            }}
          >
            {title}
          </Snippet>
          <h2 className="text-4xl mt-5">
            Description:{" "}
            <Kbd
              className="h-10 w-10 cursor-pointer sticky bottom-[70%]"
              keys={["command"]}
              onClick={() => {
                navigator.clipboard.writeText(description);
              }}
            >
              C
            </Kbd>
          </h2>
          <Card shadow="md" className="mt-2 opacity-70 p-2">
            {description}
          </Card>
          <h2 className="text-4xl mt-5">
            Tags:{" "}
            <Kbd
              className="h-10 w-10 cursor-pointer sticky bottom-[50%]"
              keys={["command"]}
              onClick={() => {
                navigator.clipboard.writeText(tags.join());
              }}
            >
              C
            </Kbd>
          </h2>
          <Card
            shadow="md"
            className="opacity-70 p-2"
            onClick={() => {
              navigator.clipboard.writeText(tags.join());
            }}
          >
            {tags}
          </Card>
          <h2 className="text-4xl mt-4">Timestamps:</h2>
          <div className="flex flex-col justify-center">
            <Snippet
              symbol=""
              size="lg"
              className="text-xl w-fit mt-5 opacity-70"
              codeString={timestamps
                .map((stamp) => {
                  return `${stamp.timestamp} ${stamp.title}`;
                })
                .join("\n")}
              tooltipProps={{
                color: "foreground",
                content: "Copy these timestamps",
                disableAnimation: true,
                placement: "right",
                closeDelay: 0,
              }}
            >
              {timestamps.map((timestamp) => {
                return (
                  <span key={timestamp.timestamp}>
                    {timestamp.timestamp} {timestamp.title}
                  </span>
                );
              })}
            </Snippet>
          </div>
          <LoadButton
            className="self-center z-10 bottom-1 opacity-70"
            innerText="Hide Ai Content"
            arrowDirection="up"
            onClick={() => {
              $loadAiContent.set(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
