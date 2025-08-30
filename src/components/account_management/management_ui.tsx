import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  ModalHeader,
} from "@heroui/react";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { deleteAccount, manageSubscription } from "./management_functionality";
import { $userData } from "../../helpers/pockebase";
import { atom } from "nanostores";
import { LiaSignOutAltSolid } from "react-icons/lia";
import { logout, requestResetPasswordEmail } from "../../helpers/auth";
import { UserRecord } from "../../types/global";

const $manageAccount = atom(false);

export function AccountDropdown({ userData }: { userData: UserRecord }) {
  return (
    <>
      <Dropdown className="dark text-white text-[1.2rem]">
        <DropdownTrigger>
          <Avatar
            as="button"
            className="transition-transform"
            color="secondary"
            name={userData.name}
            size="lg"
            // src={}
          />
        </DropdownTrigger>
        <DropdownMenu
          variant="faded"
          aria-label="Dropdown menu for managing the user"
        >
          <DropdownSection showDivider>
            <DropdownItem key="email cursor-default">
              <span className="text-[1.3rem] text-gray-400 font-semibold opacity-80">
                {userData.email}
              </span>
            </DropdownItem>
            {userData.stripe_customer_id !== "" ? (
              <DropdownItem onClick={manageSubscription} key="subscription">
                <span className="text-[1.4rem] font-semibold">
                  Your Subscription
                </span>
              </DropdownItem>
            ) : (
              <DropdownItem key="subscription"></DropdownItem>
            )}
            <DropdownItem
              key="manageAccount"
              onPress={() => {
                $manageAccount.set(true);
              }}
            >
              <span className="text-[1.4rem] font-semibold">
                Manage Your Account
              </span>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection>
            <DropdownItem
              key="logout"
              className="text-danger"
              startContent={<LiaSignOutAltSolid className="w-9 h-9" />}
              color="danger"
              onPress={logout}
            >
              <p className="text-[1.3rem] font-bold">Logout</p>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}

export function AccountModal() {
  const isOpen = useStore($manageAccount);
  const [confirmDeleteAccount, updateConfirmDeleteAccount] = useState(false);
  // const user = useStore($userData);
  const closeModal = () => {
    $manageAccount.set(false);
  };
  return (
    <Modal size="2xl" isOpen={isOpen} onClose={closeModal} className="dark">
      <ModalContent className="text-white">
        <>
          <ModalHeader className=" text-[2rem]">Account Management</ModalHeader>
          <ModalBody>
            <h2 className="text-[1.6rem]">Change your password</h2>
            <hr />
            <p className="text-[1.3rem]">
              You will receive an email with a link to change your password
            </p>
            <Button
              className="self-center w-[15rem]"
              onPress={() => {
                requestResetPasswordEmail($userData.get()!.email);
              }}
            >
              <p className="text-[1.3rem]">Reset Password</p>
            </Button>
            <h1 className="text-danger">Danger Zone</h1>
            <hr className="text-danger opacity-70" />
            <h2 className="text-white">Delete your account</h2>
            <Checkbox
              isSelected={confirmDeleteAccount}
              defaultChecked={false}
              onValueChange={updateConfirmDeleteAccount}
              color="danger"
              radius="none"
            >
              <p className="text-[1.4rem]">
                I understand no data will be recoverable after deleting my
                account, including my credits, videos, and preferences
              </p>
            </Checkbox>
            <br />
            <Button
              className="self-center w-[16rem] text-[1.3rem]"
              variant="solid"
              color="danger"
              onPress={deleteAccount}
              isDisabled={!confirmDeleteAccount}
            >
              Delete my Account
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeModal}>
              <p className="text-[1.3rem]">Close</p>
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}

export function LogOutBtn(props: { className?: string }) {
  return (
    <Button
      key="logout"
      aria-label="Log Out"
      onPress={() => {
        logout();
      }}
      className={props.className}
      color="danger"
      size="lg"
      isIconOnly
    >
      <LiaSignOutAltSolid className="w-10 h-10" />
    </Button>
  );
}
