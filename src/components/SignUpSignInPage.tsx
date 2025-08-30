import {
  $credentials,
  AuthProviders,
  SignIn,
  SignUp,
  resetCredentials,
  requestResetPasswordEmail,
  verifyPassword,
  verifyUser,
} from "../helpers/auth";
import isEmail from "validator/es/lib/isEmail";
import { useState } from "react";
import { Button, Checkbox, Link, Input, Card, Image } from "@heroui/react";
import { AuthButton } from "./ui/auth";
import { IoEyeSharp } from "react-icons/io5";
import { IoIosEyeOff } from "react-icons/io";
import { useStore } from "@nanostores/react";
import { toast } from "react-toastify";

export default function SignUpPage() {
  return (
    <div className="flex flex-col justify-center place-items-center z-50">
      <div className="flex flex-row z-50">
        <Image
          isBlurred
          className="w-[7rem] h-[7rem] z-50"
          src="/app-icons/icon-192px.png"
          alt="Flow Frames Logo"
        />
      </div>
      <Card className="flex flex-col justify-center w-[30rem] sm:w-[40rem] mt-10 p-4 font-[510]">
        <h1 className="mb-5 text-[2rem] text-gray-300">Sign Up or Sign In</h1>
        <div className="flex flex-col gap-y-3">
          <AuthButton
            innerText="Continue With Google"
            provider={AuthProviders.GOOGLE}
            className="text-[1.3rem] font-semibold opacity-80"
          />
          <AuthButton
            innerText="Continue With Twitch"
            provider={AuthProviders.TWITCH}
            className="text-[1.3rem] font-semibold opacity-80"
          />
        </div>
        <div className="flex items-center my-4">
          <div className="grow border-t border-gray-500"></div>
          <span className="mx-4 text-gray-500 font-semibold">
            or continue with email
          </span>
          <div className="grow border-t border-gray-500"></div>
        </div>
        <SignUpWithEmailForm />
      </Card>
      {/* <MarketingVideo className="lg:absolute lg:ml-[45rem] lg:right-[0rem] lg:top-[-2vh]" /> */}
    </div>
  );
}

function SignUpWithEmailForm({ className }: { className?: string }) {
  const credentials = useStore($credentials);
  const {
    email,
    isEmailValid,
    emailSignIn,
    does_user_exist,
    password,
    pswdError,
  } = credentials;
  // Password local states
  const [isPswdVisible, setIsPswdVisible] = useState(false);

  return (
    <form
      className={className + ""}
      onSubmit={async (e) => {
        e.preventDefault();
        if (isEmailValid && emailSignIn === false) {
          const newCredentials = await verifyUser(credentials);
          if (newCredentials.ouath_enabled === true) {
            // The user has an auth provider linked
            toast.info(
              `Your account is linked with an oauth provider. Please, sign in with your preferred oauth provider`,
            );
            //resetCredentials();
            return;
          }
          $credentials.set(newCredentials);
          setTimeout(() => {
            document.getElementById("password")?.focus();
          }, 200);
          return;
        }
        if (password !== "" && pswdError === undefined) {
          if (does_user_exist === true) {
            SignIn(AuthProviders.EMAIL, email, password);
          } else {
            SignUp(AuthProviders.EMAIL, email, password);
            resetCredentials();
          }
        }
      }}
    >
      <Input
        name="email"
        isClearable
        value={email}
        onValueChange={(newEmail) => {
          resetCredentials();
          $credentials.setKey("isEmailValid", isEmail(newEmail));
          $credentials.setKey("email", newEmail);
        }}
        type="email"
        label="Email"
        errorMessage="Please enter a valid email"
        isInvalid={isEmailValid === false && email.length !== 0}
        classNames={{
          input: ["text-[1.35rem] font-bold"],
          label: [" text-[1.1rem] font-bold"],
          inputWrapper: [
            "focus-within:!bg-default-200/50",
            "dark:focus-within:!bg-default/60",
            "h-[4rem]",
          ],
          errorMessage: ["text-[1.3rem]"],
          clearButton: ["w-10", "h-[3rem]"],
        }}
        className="mb-2"
      />
      {emailSignIn ? (
        <div>
          <Input
            id="password"
            onValueChange={(newPassword) => {
              $credentials.setKey("pswdError", verifyPassword(newPassword));
              $credentials.setKey("password", newPassword);
            }}
            endContent={
              isPswdVisible ? (
                <IoIosEyeOff
                  className="cursor-pointer opacity-70"
                  onClick={() => {
                    setIsPswdVisible(!isPswdVisible);
                  }}
                />
              ) : (
                <IoEyeSharp
                  className="cursor-pointer opacity-70"
                  onClick={() => {
                    setIsPswdVisible(!isPswdVisible);
                  }}
                />
              )
            }
            type={isPswdVisible ? "text" : "password"}
            label="Password"
            isInvalid={pswdError !== undefined && does_user_exist === false}
            errorMessage={pswdError}
            classNames={{
              input: ["text-[1.35rem]"],
              label: ["text-[1.1rem] font-bold"],
              inputWrapper: [
                "focus-within:!bg-default-200/50",
                "dark:focus-within:!bg-default/60",
                "h-[4rem]",
              ],
              errorMessage: ["text-[1.3rem]"],
            }}
          />
          {does_user_exist ? (
            <EmailSignInSection email={email} />
          ) : (
            <EmailSignUpSection
              isPswdValid={pswdError === undefined && password !== ""}
            />
          )}
        </div>
      ) : (
        <Button
          className="text-[1.5rem] font-semibold opacity-80 mt-1"
          type="submit"
        >
          Continue with email
        </Button>
      )}
      <div>
        <small className="text-gray-500 opacity-85 text-sm font-semibold">
          By continuing, you accept our <ToSPPLinks type="tos" showAnchorIcon />{" "}
          & <ToSPPLinks type="pp" showAnchorIcon />
        </small>
      </div>
    </form>
  );
}

function EmailSignInSection({ email }: { email: string }) {
  return (
    <div className="mt-2">
      <Button className="text-[1.6rem] mt-3 font-bold" type="submit">
        Sign In
      </Button>
      <br />
      <Link
        className="text-[0.9rem] cursor-pointer"
        onClick={() => {
          requestResetPasswordEmail(email);
        }}
      >
        Reset Your Password
      </Link>
    </div>
  );
}

function EmailSignUpSection({ isPswdValid }: { isPswdValid: boolean }) {
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  return (
    <div className="mt-2">
      <AcceptTosPP
        acceptedTos={acceptedTos}
        setAcceptedTos={setAcceptedTos}
        acceptedPrivacyPolicy={acceptedPrivacyPolicy}
        setAcceptedPrivacyPolicy={setAcceptedPrivacyPolicy}
      />
      <br />
      <Button
        className="text-[1.6rem] mt-3 font-bold"
        isDisabled={
          isPswdValid === false ||
          acceptedTos === false ||
          acceptedPrivacyPolicy === false
        }
        type="submit"
      >
        Sign Up
      </Button>
    </div>
  );
}

function AcceptTosPP({
  className,
  acceptedTos,
  setAcceptedTos,
  acceptedPrivacyPolicy,
  setAcceptedPrivacyPolicy,
}: {
  className?: string;
  acceptedTos: boolean;
  setAcceptedTos: React.Dispatch<React.SetStateAction<boolean>>;
  acceptedPrivacyPolicy: boolean;
  setAcceptedPrivacyPolicy: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className={"SignUpForm flex flex-col items-center" + className}>
      <Checkbox isSelected={acceptedTos} onValueChange={setAcceptedTos}>
        <p className="text-white text-[1.2rem]">
          I agree to the <ToSPPLinks type="tos" showAnchorIcon />
        </p>
      </Checkbox>
      <Checkbox
        className="text-white"
        isSelected={acceptedPrivacyPolicy}
        onValueChange={setAcceptedPrivacyPolicy}
      >
        <p className="text-white text-[1.2rem]">
          I agree to the <ToSPPLinks type="pp" showAnchorIcon />
        </p>
      </Checkbox>
    </div>
  );
}

function ToSPPLinks({
  type,
  showAnchorIcon,
  className,
}: {
  type: "tos" | "pp";
  showAnchorIcon?: boolean;
  className?: string;
}) {
  switch (type) {
    case "tos":
      return (
        <Link
          className={className}
          isExternal
          showAnchorIcon={showAnchorIcon}
          href="https://flowframes.pro/legal/tos"
        >
          Terms & Conditions
        </Link>
      );
    case "pp":
      return (
        <Link
          className={className}
          isExternal
          showAnchorIcon={showAnchorIcon}
          href="https://flowframes.pro/legal/privacy"
        >
          Privacy Policy
        </Link>
      );
  }
}
