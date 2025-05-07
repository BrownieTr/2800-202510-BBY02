import LoginHeader from "./LoginHeader.jsx";
import LoginTerms from "./LoginTerms.jsx";
import LoginBtn from "./LoginBtn.jsx";
import LoginTrouble from "./LoginTrouble.jsx";
import '../index.css'

function Login() {
  return (
    <>
      <div className="h-screen flex items-center justify-center">
        <div className="w-full max-w-sm p-6 rounded-lg shadow-xl flex flex-col items-center space-y-4">
          <LoginHeader />
          <LoginTerms />
          <LoginBtn provider="Email" />
          <LoginBtn provider="Apple"/>
          <LoginBtn provider="Google"/>
          <LoginTrouble />
        </div>
      </div>
    </>
  );
}

export default Login;
