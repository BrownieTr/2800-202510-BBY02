import { useAuth0 } from "@auth0/auth0-react";
import GlassButton from "./glassButton.jsx";

const LogoutPopUp = ({onOptionClick}) => {
  const { logout } = useAuth0();
  
  const handleClick = (id) => {
    onOptionClick(id);
  }

return (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray bg-opacity-10 backdrop-blur-lg">
    <div className="glass-card max-w-sm w-full text-center space-y-6 animate-fadeIn transform transition-all duration-300 scale-105">
      <h2 className="text-xl font-semibold text-white">
        Are you sure you want to log out?
      </h2>

      <div className="flex justify-center gap-4 mt-6">
        <GlassButton onClick={() => handleClick(0)}>
          Cancel
        </GlassButton>

        <GlassButton
          className="bg-red-500 bg-opacity-20 border-red-300 border-opacity-30"
          onClick={() =>
            logout({
              logoutParams: { returnTo: window.location.origin },
            })
          }
        >
          Log out
        </GlassButton>
      </div>
    </div>
  </div>
);
};

export default LogoutPopUp;