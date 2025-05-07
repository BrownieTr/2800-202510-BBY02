import LoginHeader from "./LoginHeader.jsx";
import LoginTerms from "./LoginTerms.jsx";
import LoginBtn from './LoginBtn.jsx';
import LoginTrouble from './LoginTrouble.jsx'


function Login(){
    return(
        <>
        <LoginHeader/>
        <LoginTerms/>
        <LoginBtn/>
        <LoginBtn/>
        <LoginBtn/>
        <LoginTrouble/>
        </>

    );
}

export default Login;