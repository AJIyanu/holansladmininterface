import ForgotPasswordForm from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-[3] flex items-center justify-center p-8 bg-background bg-blue-100">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>

      {/* Right side - Decorative Background (Desktop only) */}
      <div className="hidden lg:flex flex-[2] bg-primary bg-[url(/login_bg.webp)] bg-cover relative overflow-hidden">
        {/* <p>image here </p> */}
      </div>
    </div>
  );
}
