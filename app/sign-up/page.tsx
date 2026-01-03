import { SignUp } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <SignUp signInUrl="/sign-in"/>
        </div>
    );
}