import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/cargoshipanim.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-white/30" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/HolanSL_logo_Full_color_Horizontal.webp"
            alt="Logo"
            // layout="fill"
            // objectFit="contain"
            width={500}
            height={500}
            className="w-full h auto"
            loading="eager"
          />
        </div>

        <Link href="/login">
          <Button className="w-80 py-6 px-12 bg-transparent text-white text-xl font-semibold rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-brand-navy border border-brand-navy border-3">
            {"Let's Get You in!"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
