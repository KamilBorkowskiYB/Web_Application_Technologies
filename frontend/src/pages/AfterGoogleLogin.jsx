import { useEffect } from "react";

const AfterGoogleLogin = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("TOKEN:", token);
    console.log("WINDOW.OPENER:", window.opener);



    if (token) {
        const channel = new BroadcastChannel("auth_channel");
        channel.postMessage({ token });
        channel.close();
        window.close();
    }
  }, []);

  return <p>Nie dostałem tokenu ;-;.</p>;
};

export default AfterGoogleLogin;