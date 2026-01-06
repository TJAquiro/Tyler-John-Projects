import { GoogleLogin, googleLogout } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";

export function Homepage() {

    let givenName = localStorage.getItem("givenName");

    return (
        <p>Hello {givenName}</p>
    )
}