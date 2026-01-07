import { useGoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"

export function LoginWithGoogle() {
    const navigate = useNavigate()

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            // Fetch user info from Google
            const res = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                }
            )

            const user = await res.json()

            // Save user data
            localStorage.setItem("email", user.email)
            localStorage.setItem("givenName", user.given_name)
            localStorage.setItem("familyName", user.family_name)

            navigate("/Homepage")
        },
        onError: () => {
            console.log("Google Login Failed")
        },
    })

    return (
        <button
            type="button"
            onClick={() => login()}
            className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2"
        >
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width="20"
                height="20"
            />
            Continue with Google
        </button>
    )
}