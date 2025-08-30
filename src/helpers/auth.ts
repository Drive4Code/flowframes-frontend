// App Imports
import { toast } from "react-toastify";
import { clearPartialUploads, requestFromApi } from "./general_helpers";
import { $userData, $videoData, pb } from "./pockebase"; // Remeber to add 127.0.0.1 to the trusted domains!
import { map } from "nanostores";
import { ClientResponseError } from "pocketbase";

export enum AuthProviders {
  GOOGLE = "google",
  TWITCH = "twitch",
  EMAIL = "email",
}

/**
 * Function that calls the uri /user/does_email_exists/<email> and
 * parses the response
 * @param email The email to check the existence for
 * @returns {does_user_exist: boolean; oauth_enabled: boolean}
 */
async function checkUserExists(email: string): Promise<{
  does_user_exist: boolean;
  oauth_enabled: boolean;
  error: boolean;
}> {
  const response = await requestFromApi(
    "GET",
    `/public/account/v3/does_user_exist/${email}`,
  );
  if (response.status_code !== 200) {
    return { does_user_exist: false, oauth_enabled: false, error: true };
  }
  // console.warn(`Providers: ${response.providers} type: ${typeof response.providers}`)
  return {
    does_user_exist: response.body.does_user_exist,
    oauth_enabled: response.body.oauth_enabled,
    error: false,
  };
}

export function SignUp(
  provider: AuthProviders,
  email?: string,
  password?: string,
) {
  const defaultOpts = {
    provider: provider,
    createData: {
      tier: "free",
      credits: 0,
      video_data: {},
    },
  };
  switch (provider) {
    case AuthProviders.EMAIL:
      if (email === undefined || password === undefined) {
        return;
      }
      toast.promise(
        requestFromApi("POST", "/public/account/v2/create", {
          body: {
            user_email: email,
            user_password: password,
          },
        }),
        {
          success: "Account succesfully created! Verify your email to login",
          pending: "Creating account...",
          error:
            "Error creating your account. Contact support for more information",
        },
      );
      break;
    default:
      pb.collection("users")
        .authWithOAuth2(defaultOpts)
        .catch((error) => {
          console.error(`Error authenticating with oauth: \n${error}`);
        });
      break;
  }
}

export function SignIn(
  provider: AuthProviders | string,
  email?: string,
  password?: string,
) {
  switch (provider) {
    case AuthProviders.EMAIL:
      if (email === undefined || password === undefined) {
        return;
      }
      pb.collection("users")
        .authWithPassword(email, password)
        .then(() => {
          toast.success("Logged in!");
        })
        .catch((response_error: ClientResponseError) => {
          if (response_error.status == 403) {
            toast.error("Please verify your email before signing in");
          } else {
            toast.error("Wrong Password");
          }
        });
      break;
    default:
      pb.collection("users")
        .authWithOAuth2({
          provider: provider,
        })
        .catch((error) => {
          console.error(error);
        });
      break;
  }
}

export async function requestResetPasswordEmail(email: string) {
  requestFromApi("PATCH", `/public/account/password/v2/reset/${email}`)
    .then((response) => {
      if (response.status_code === 200) {
        toast.success("Succesfully sent password reset email!");
        return;
      }
      toast.error(
        "Error sending password reset email. Please, contact our support",
      );
      return;
    })
    .catch((err) => {
      console.error(`Error resetting password: \n ${err}`);
      toast.error(
        "Error sending password reset email. Please, contact our support",
      );
      return;
    });
}

export function logout() {
  console.warn("LOGGING OUT!");
  clearPartialUploads();
  pb.authStore.clear();
  $userData.set(null);
  $videoData.set([]);
  $videoData.set([]);
}

export function timeoutTimer(timer: number) {
  setTimeout(() => {
    toast.error("Timed Out");
    logout();
  }, timer);
}

// Custom sign in code
export const $credentials = map<Credentials>({
  email: "",
  isEmailValid: undefined,
  password: "",
  pswdError: undefined,
  emailSignIn: false,
  does_user_exist: false,
  ouath_enabled: false,
});
type Credentials = {
  email: string;
  isEmailValid?: boolean;
  password: string;
  pswdError?: string;
  emailSignIn: boolean;
  does_user_exist: boolean;
  ouath_enabled: boolean;
};

export function resetCredentials() {
  $credentials.set({
    email: "",
    isEmailValid: undefined,
    password: "",
    pswdError: undefined,
    emailSignIn: false,
    does_user_exist: false,
    ouath_enabled: false,
  });
}

export function verifyPassword(password: string): string | undefined {
  const minPasswordLength = 8;
  const maxPasswordLength = 16;
  const psswdCheck = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
  if (
    maxPasswordLength < password.length ||
    minPasswordLength > password.length
  ) {
    return `The password should be between ${minPasswordLength} and ${maxPasswordLength} characters`;
  } else if (psswdCheck.test(password) === false) {
    return "Please include at least a number and a special character in your password";
  }
}

export async function verifyUser(
  credentials: Credentials,
): Promise<Credentials> {
  console.info("Verifying user...");
  console.assert(credentials.email !== "");
  console.assert(credentials.isEmailValid === true);
  console.assert(credentials.ouath_enabled === false);
  console.assert(credentials.password === "");
  console.assert(credentials.emailSignIn === false);
  console.assert(credentials.pswdError === undefined);
  console.warn(credentials.email);
  const { does_user_exist, oauth_enabled, error } = await checkUserExists(
    credentials.email,
  );
  if (error) {
    // There was an error with the request. This likely indicates that the backend is down or the user's connection is bad
    toast.error(
      "There was an issue connecting with our servers. Please try again.",
    );
    console.error(`Error checking user.`);
    return {
      email: credentials.email,
      isEmailValid: true,
      password: "",
      pswdError: undefined,
      emailSignIn: false,
      does_user_exist: false,
      ouath_enabled: false,
    };
  }
  console.assert(typeof does_user_exist === "boolean");
  console.assert(typeof oauth_enabled === "boolean");
  console.warn(
    `User exists: ${does_user_exist}, Oauth enabled: ${oauth_enabled}`,
  );
  return {
    email: credentials.email,
    isEmailValid: true,
    password: "",
    pswdError: undefined,
    emailSignIn: true,
    does_user_exist: does_user_exist,
    ouath_enabled: oauth_enabled,
  };
}
