import { useStore } from "@nanostores/react";
import { Suspense, lazy } from "react";
import {
  AccountDropdown,
  AccountModal,
} from "./account_management/management_ui";
const PayUpModal = lazy(() => import("./payment_modal"));

// Styling
import {
  Image,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Tooltip,
} from "@heroui/react";
import { TbClockCog } from "react-icons/tb";
import { $userData } from "../helpers/pockebase";

export function NavigationBar() {
  const userData = useStore($userData);

  return (
    <Navbar
      className="flex justify-between gap-8 pr-4 bg-[var(--primary)] text-[white] text-[1.5rem] h-[6rem]  px-[4%]"
      maxWidth="full"
    >
      <NavbarBrand className="flex flex-row space-x-3">
        <Image
          className="h-[5rem] w-[5rem] z-10 cursor-pointer"
          src="/app-icons/icon-192px.png"
          alt="Flow Frames Logo"
          isBlurred
          onClick={() => {
            window.location.reload();
          }}
        />
      </NavbarBrand>

      {userData && (
        <NavbarContent justify="end">
          <span className="relative text-[2rem] flex flex-row">
            <TbClockCog className="h-[3.5rem] w-[3.5rem] pr-1 top-1 border-[--primary]" />
            <Tooltip
              classNames={{
                content: "text-[1.2rem]",
              }}
              content="1m = 1 minute of uploaded video to process"
            >
              <p className={`font-bold pl-4 pt-2 border-[--primary]`}>
                {userData["credits"]}m
              </p>
            </Tooltip>
          </span>
          <Suspense>
            <PayUpModal />
          </Suspense>
          <AccountDropdown userData={userData} />
          <AccountModal />
        </NavbarContent>
      )}
    </Navbar>
  );
}

export default NavigationBar;
