import { Button } from "@heroui/react";
import { AuthProviders, SignUp } from "../../helpers/auth";

export function AuthButton({innerText, provider, className, imgClassname, isDisabled}:{
  innerText: string;
  provider: AuthProviders;
  className?: string;
  imgClassname?:string
  isDisabled?: boolean;
}) {
  let providerIcon;
  switch (provider) {
    case AuthProviders.GOOGLE:
      providerIcon = "/oauth_icons/gLogo.webp";
      break;
    case AuthProviders.TWITCH:
      providerIcon = "/oauth_icons/twitch_logo.png"
  }

  return (
    <Button
      className={`${className} py-7`}
      onClick={() => {
        SignUp(provider);
      }}
      variant="solid"
      disabled={isDisabled}
      startContent={
        <img
          className={`absolute left-5 w-9 h-[2.4rem] ${imgClassname}`}
          src={providerIcon}
          alt="Authorization Provider Logo"
        />
      }
    >
      <p className="text-[1.35rem]">{innerText}</p>
    </Button>
  );
}
