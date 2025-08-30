import { API_URL } from "../types/global";
import { $currUserToken } from "./pockebase";

type Options = {
  method?: string;
  body?: object;
};

/**
 * Fetches a specified endpoint from the backend
 * @param endpointURL the endpoint to request, without the /
 * @param opts {} with the optional options to specify
 * @returns {} the response, from json
 */
export async function requestFromApi(
  reqMethod: "POST" | "GET" | "PUT" | "PATCH" | "DELETE",
  endpointURL: string,
  opts?: Options,
): Promise<{ body: any; status_code: number }> {
  const { method, body } = { method: reqMethod, body: null, ...opts };

  const res: Response = await fetch(`${API_URL}${endpointURL}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      "Content-Type": "application/json",
      Authorization: $currUserToken.get(),
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
  if (res.status !== 200) {
    const error = new Error(
      `Request to ${API_URL}${endpointURL} resulted in an error with status code ${res.status} `,
    );
    throw error;
  }
  const res_body = await res.json();
  return { body: res_body, status_code: res.status };
}

/**
 * Deletes all partial uploads
 */
export function clearPartialUploads() {
  requestFromApi("DELETE", "/videos/v2/upload");
}
