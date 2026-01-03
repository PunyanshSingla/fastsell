import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <SignIn signInUrl="/" signUpUrl="/sign-up" />
        </div>
    );
}