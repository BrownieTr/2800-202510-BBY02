import { useAuth0 } from "@auth0/auth0-react";
import Button from "./button";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <Button 
  className={"p-8 rounded-lg shadow-lg bg-gradient-to-tr from-pink-700 via-purple-700 to-blue-700 text-white"}
  onClick={() =>
    loginWithRedirect({
      appState: { targetUrl: "/home" },
    })
  }
>
  Log In/Sign Up
</Button>;

};

export default LoginButton;