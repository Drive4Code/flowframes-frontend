import { useState, useEffect, lazy, Suspense } from "react";

// Styling
import "./style/App.css";
import "./style/fonts.css";
import { CircularProgress } from "@heroui/react";
import "animate.css/animate.min.css";

// Components
import {
  pb,
  $currUserId,
  fetchAndSubscribeToUserData,
} from "./helpers/pockebase";
import NavigationBar from "./components/Navigationbar";
import { Slide, ToastContainer } from "react-toastify";
import { useStore } from "@nanostores/react";
import { LogOutBtn } from "./components/account_management/management_ui";
import { $loadedVideos } from "./helpers/pockebase";
import { $keyPressed } from "./helpers/global_states";
const Inputs = lazy(() => import("./components/inputs/Inputs"));
const SignUpPage = lazy(() => import("./components/SignUpSignInPage"));

function App() {
  const user_id = useStore($currUserId);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (user_id === undefined) {
      console.warn("[ fetchUserData ] null User");
      setLoaded(true);
    } else {
      fetchAndSubscribeToUserData(user_id, setLoaded);
    }
  }, [user_id]);

  useEffect(() => {
    // Unsubscribe whenever leaving the window
    function unsub_from_users_pb() {
      pb.collection("users").unsubscribe();
    }

    addEventListener("beforeunload", unsub_from_users_pb);

    return () => {
      window.removeEventListener("beforeunload", unsub_from_users_pb);
    };
  }, []);

  // Handle Scrolling
  useEffect(() => {
    function viewMoreVideos() {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;
      if (bottom) {
        $loadedVideos.set($loadedVideos.get() + 4);
      }
    }

    window.addEventListener("scroll", viewMoreVideos);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", viewMoreVideos);
    };
  }, []);

  return (
    <div
      className="App dark"
      onKeyDown={(e) => {
        $keyPressed.set(e.key);
      }}
    >
      {loaded ? (
        <>
          <main>
            {user_id ? (
              <Suspense>
                <div className="loggedIn">
                  <NavigationBar />
                  <Inputs />
                </div>
              </Suspense>
            ) : (
              <Suspense>
                <SignUpPage />
              </Suspense>
            )}
          </main>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover={false}
            theme="dark"
            className={"animate__headShake text-[1.7rem] opacity-[0.97]"}
            transition={Slide}
          />
        </>
      ) : (
        <div className="App flex absolute left-1/2 top-1/3">
          <CircularProgress
            aria-label="Loading..."
            size="lg"
            classNames={{
              svg: "w-36 h-36 drop-shadow-md",
              indicator: "stroke-white",
              track: "stroke-white/10",
              value: "text-3xl font-semibold text-white",
            }}
            strokeWidth={4}
          />
          <LogOutBtn />
        </div>
      )}
    </div>
  );
}

export default App;
