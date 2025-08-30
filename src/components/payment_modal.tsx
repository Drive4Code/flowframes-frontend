import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Slider,
} from "@heroui/react";
import { requestFromApi } from "../helpers/general_helpers";
import { $userData } from "../helpers/pockebase";
import { useStore } from "@nanostores/react";
import { manageSubscription } from "./account_management/management_functionality";
import { $router, FRONTPAGE_URL, UserRecord } from "../types/global";
import { useEffect, useState } from "react";
import { openPage, redirectPage } from "@nanostores/router";
import { toast } from "react-toastify";

async function handleCheckout(
  billing_period: string,
  subscription_plan: string,
) {
  console.warn(
    `Billing period: ${billing_period}. Subscription plan: ${subscription_plan}`,
  );
  toast
    .promise(
      requestFromApi(
        "GET",
        `/payments/v2/checkout/${billing_period}/${subscription_plan}`,
      ),
      {
        pending: "Redirecting to checkout...",
        error: "Error redirecting to checkout. Please, contact our support",
      },
    )
    .then((response) => {
      if (response.status_code !== 200) {
        return;
      }
      const session_id = response.body.session_id;
      console.assert(session_id !== undefined);
      const session_url = response.body.session_url;
      console.assert(session_url !== undefined);
      console.log(response, session_id);
      location.href = session_url;
    });
}

function CheckoutButton({ userData }: { userData: UserRecord }) {
  return (
    <Button
      color="primary"
      onClick={() => {
        if (userData.stripe_customer_id) {
          manageSubscription();
          return;
        }
        // handleCheckout();
      }}
    >
      Checkout
    </Button>
  );
}

export default function PayUpModal() {
  const [openPricingModal, setOpenPricingModal] = useState(false);
  const userData = useStore($userData);

  useEffect(() => {
    const unbind_listener = $router.subscribe((route) => {
      if (!route) {
        return;
      }
      const route_params = route.params;
      if (
        route_params.modal_type === "payment" &&
        route_params.modal_parameter === "buy" &&
        route_params.billing_period &&
        route_params.subscription_plan
      ) {
        console.assert(userData !== null);
        if (userData!.stripe_customer_id) {
          manageSubscription();
          redirectPage($router, "index", { modal_type: "payment" });
          return;
        }
        // The user does not have a customer id yet, meaning they never bought anything. I'll hence do a normal checkout session
        handleCheckout(
          route_params.billing_period,
          route_params.subscription_plan,
        );
        redirectPage($router, "index", { modal_type: "payment" });
      }
    });

    return () => {
      unbind_listener();
    };
  }, []);

  return (
    <>
      <a href={`${FRONTPAGE_URL}/pricing`}>
        <Button
          // onClick={() => {
          //   openPage($router, "index", {
          //     modal_type: "pricing",
          //   });
          // }}
          className="text-[1.4rem] font-semibold"
          radius="sm"
        >
          <span className="glowing">Add Credits</span>
        </Button>
      </a>
      <Modal
        isOpen={openPricingModal}
        onClose={() => {
          openPage($router, "index", { modal_type: "" });
        }}
        className="dark text-white"
        size="full"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Purchase Credits
            </ModalHeader>
            <ModalBody>
              {/* <p>Purchase Credits: {credits}</p> */}
              {/* <div id="pricing_section" className="h-full bg-inherit" /> */}
              {/* <iframe
                src={`${FRONTPAGE_URL}/pricing/pricing-section/month/18181B`}
                className="h-full"
              /> */}
              {/* <Slider
                onChange={(value) => {
                  $creditQuantity.set(Math.max(0, value as number));
                }}
                minValue={100}
                defaultValue={200}
                maxValue={2000}
              /> */}
            </ModalBody>
            {/* <ModalFooter>
              <CheckoutButton userData={userData!} />
            </ModalFooter> */}
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
