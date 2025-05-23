import { useAuth0 } from "@auth0/auth0-react";
import Button from "./button";

const LoginButton = ({
  className,
  title
}) => {
  const { loginWithRedirect } = useAuth0();

  return <Button 
  className={`${className}`}
  onClick={() =>
    loginWithRedirect({
      appState: { targetUrl: "/home" },
    })
  }
>
  {title}
</Button>;

};

export default LoginButton;