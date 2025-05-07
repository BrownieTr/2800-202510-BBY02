function LoginBtn({provider}){
    return(
        <div className="w-full">
            <button className="w-full py-3 px-4 font-medium rounded-lg">Log in with {provider}</button>
        </div>
    );
}

export default LoginBtn;