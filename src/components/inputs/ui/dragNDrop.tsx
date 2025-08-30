import {
  useCallback,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  DragEvent,
} from "react";
import { requestFromApi } from "../../../helpers/general_helpers";
import { toast } from "react-toastify";
import { $input, resetInputs } from "../inputs_helpers";
import { RiDragDropLine } from "react-icons/ri";
import { VideoPlatform } from "../../../types/global";
import getBlobDuration from "get-blob-duration";

const DragAndDropFileUpload = ({
  setLoading,
  className,
}: {
  setLoading?: Dispatch<SetStateAction<boolean>>;
  className?: string;
}) => {
  async function generateSha1(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
          return resolve(hashHex);
        } catch (error) {
          console.error(`[ generateSha1 ] Error generating SHA1: \n${error}`);
          return reject("do_not_verify");
        }
      };

      fileReader.onerror = (error) => {
        console.error(`[ generateSha1 ] Error generating SHA1: \n${error}`);
        return reject("do_not_verify");
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  async function uploadFile(file: File) {
    const fileName = file.name;
    console.info("File Type:", file.type);
    if (file.type !== "video/mp4") {
      toast.error("Invalid File Type: We only accept .mp4");
      resetInputs();
      return;
    }
    $input.setKey("states.loading", true);
    console.info("File Name:", fileName);
    try {
      // Generate SHA-1 of file
      const fileSha1 = await generateSha1(file);

      // Get pre-signed URL from backend
      const {
        upload_url,
        upload_filename,
      }: { upload_url: string; upload_filename: string } = await requestFromApi(
        "POST",
        "/videos/v2/upload",
        {
          body: {
            file_sha1: fileSha1,
          },
        },
      ).then((res) => res.body);
      console.log(
        `Upload url: ${upload_url}, upload_filename: ${upload_filename}`,
      );

      // if (
      //   typeof upload_url === "undefined" ||
      //   typeof storage_filename === "undefined"
      // ) {
      //   toast.error(
      //     "Internal error uploading file. Please try again later or contact out support",
      //   );
      //   resetInputs();
      //   return;
      // }

      // Upload file to S3 using the pre-signed URL
      // const formData = new FormData();
      // formData.append("File", file);

      const uploadPromise = fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-type": file.type,
          "X-Bz-Content-Sha1": fileSha1,
        },
        body: file,
      });
      // const uploadPromise = axios
      //   .put(upload_url, file, {
      //     headers: {
      //       "Content-Type": file.type,
      //       "X-Bz-Content-Sha1": fileSha1,
      //     },
      //   })
      const blob_url = URL.createObjectURL(file);
      const oldInput = $input.get();
      $input.setKey("basic", {
        ...oldInput.basic,
        url: blob_url,
        fileName: fileName,
        upload_filename: upload_filename,
        platform: VideoPlatform.Upload,
      });
      getBlobDuration(blob_url).then((duration: number) => {
        $input.setKey("basic.sectionLength.end", Math.round(duration));
      });
      toast
        .promise(
          uploadPromise,
          {
            pending: `Uploading your video...`,
            // success: `${fileName} Uploaded!`,
            error: `Error uploading ${fileName}`,
          },
          {
            position: "top-left",
          },
        )
        .catch(() => {
          resetInputs();
          return;
        })
        .then((response: Response | void) => {
          if (typeof response !== "object") {
            toast.error(`Error uploading ${fileName}`);
            resetInputs();
            return;
          }
          console.assert(typeof response === "object");

          if (response.status !== 200) {
            console.error(
              `Error uploading ${fileName}. Status code: ${response.status}`,
            );
            toast.error(`Error uploading ${fileName}`);
            resetInputs();
            return;
          }
          toast.success(`Uploaded ${fileName}`, {
            position: "top-left",
          });
        })
        .finally(() => {
          // File Uploaded
          if (setLoading) {
            setLoading(false);
          } else {
            $input.setKey("states.loading", false);
          }
        });
      // File uploaded
    } catch (error) {
      console.error(`Error uploading file: \n ${error}`);
      toast.error("Error uploading file");
      resetInputs();
      return;
    }
  }

  const handleDrag = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    resetInputs();
    $input.setKey("states.loading", true);
    if (event.dataTransfer === null) {
      return;
    }

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      uploadFile(file);
    }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  return (
    <div
      id="drag-and-drop-zone"
      className={`${className} flex flex-col justify-center`}
      onDragEnter={(dragEvent) => handleDrag(dragEvent)}
      onDragOver={(dragEvent) => handleDrag(dragEvent)}
      onDragLeave={(dragEvent) => handleDrag(dragEvent)}
      onDrop={(dragEvent) => handleDrop(dragEvent)}
      onClick={() => {
        document.getElementById("uploadFile")?.click();
      }}
    >
      <input
        type="file"
        className="opacity-0"
        id="uploadFile"
        onChange={handleUpload}
      />
      <div
        id="drag-ui"
        className="mx-auto border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition duration-200"
      >
        <RiDragDropLine className="w-[3rem] h-[3rem] mt-1 text-white opacity-65" />
        <p className="text-white px-4 opacity-65 font-bold">
          Click or Drag & drop your video
        </p>
      </div>
    </div>
  );
};

export default DragAndDropFileUpload;
