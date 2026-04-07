import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Finance Dashboard",
  description: "Sign in to access finance dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
