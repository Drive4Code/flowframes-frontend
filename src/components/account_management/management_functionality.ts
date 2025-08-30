import { toast } from "react-toastify";
import { requestFromApi } from "../../helpers/general_helpers";
import { logout } from "../../helpers/auth";

export async function manageSubscription() {
  try {
    const portal_request = requestFromApi(
      "GET",
      "/payments/subscription/v2/manage",
    )
      .catch(() => {
        console.error("Error with stripe portal session:");
      })
      .then((response) => {
        if (!response) {
          console.error("Error with stripe portal session:");
          toast.error(
            "Error generating stripe portal session. Please, contact our support",
          );
          return;
        }
        window.location.href = response.body.portal_url;
      });
    toast.promise(portal_request, {
      pending: "Redirecting to stripe portal session...",
      error:
        "Error generating stripe portal session. Please, contact our support",
    });
  } catch (error) {
    console.error("Error with stripe portal session:", error);
    toast.error("Failed to Create Stripe Portal Session");
  }
}

export function deleteAccount() {
  const deleteAccountPromise = requestFromApi("DELETE", "/account/v2/delete");
  toast.promise(deleteAccountPromise, {
    pending: "Deleting account...",
    // success: "Account successfully deleted.",
    error: "Error deleting your account. Please, contact our support",
  });
  deleteAccountPromise.then((response) => {
    if (response.status_code === 200) {
      logout();
      location.reload();
      return;
    }
    console.error(
      `Error deleting account. Status code: ${response.status_code}`,
    );
    toast.error("Error deleting your account. Please, contact our support");
  });
}
