import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-[3] flex items-center justify-center p-8 bg-background bg-blue-100">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Right side - Decorative Background (Desktop only) */}
      <div className="hidden lg:flex flex-[2] bg-primary bg-[url(/login_bg.webp)] bg-cover relative overflow-hidden">
        {/* <p>image here </p> */}
      </div>
    </div>
  );
}
