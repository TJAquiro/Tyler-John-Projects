import { GoogleLogin, googleLogout } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";

export function Login() {

    const navigate = useNavigate()

    return (
        <>
            <GoogleLogin 
            
            onSuccess={(credentialResponse) => {
                console.log(credentialResponse)
                console.log(jwtDecode(credentialResponse.credential))
                console.log(jwtDecode(credentialResponse.credential).given_name)
                console.log(jwtDecode(credentialResponse.credential).family_name)

                const decoded = jwtDecode(credentialResponse.credential);

                localStorage.setItem("email", decoded.email);
                localStorage.setItem("givenName", decoded.given_name);
                localStorage.setItem("family_name", decoded.family_name);

                navigate("/Homepage")
            }} 
            
            onError={() => console.log("Login Failed")}

            auto_select={true}/>

            <button onClick={() => googleLogout()}> Logout </button>
        </>
    )
}