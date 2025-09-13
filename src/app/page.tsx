import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-brand-navy text-brand-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to Your Next.js App
          </h1>
          <p className="text-xl mb-8 text-brand-white/90">
            Built with Tailwind CSS and shadcn/ui using your brand colors
          </p>
          <Button className="bg-brand-blue text-brand-navy hover:bg-brand-blue/90">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Brand Color Showcase
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* White Card */}
            <Card className="border-2 border-brand-gray/20">
              <CardHeader className="bg-brand-white">
                <CardTitle className="text-brand-navy">White</CardTitle>
                <CardDescription className="text-brand-gray">
                  #FFFFFF
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full h-20 bg-brand-white border-2 border-brand-gray/20 rounded"></div>
              </CardContent>
            </Card>

            {/* Gray Card */}
            <Card className="border-2 border-brand-gray/20">
              <CardHeader className="bg-brand-gray">
                <CardTitle className="text-brand-white">Gray</CardTitle>
                <CardDescription className="text-brand-white/80">
                  #696060
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full h-20 bg-brand-gray rounded"></div>
              </CardContent>
            </Card>

            {/* Blue Card */}
            <Card className="border-2 border-brand-blue/20">
              <CardHeader className="bg-brand-blue">
                <CardTitle className="text-brand-navy">Sky Blue</CardTitle>
                <CardDescription className="text-brand-navy/80">
                  #69CAF0
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full h-20 bg-brand-blue rounded"></div>
              </CardContent>
            </Card>

            {/* Navy Card */}
            <Card className="border-2 border-brand-navy/20">
              <CardHeader className="bg-brand-navy">
                <CardTitle className="text-brand-white">Navy</CardTitle>
                <CardDescription className="text-brand-white/80">
                  #04035E
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full h-20 bg-brand-navy rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Interactive Components
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button
              variant="outline"
              className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-brand-navy"
            >
              Outline Button
            </Button>
            <Button
              variant="ghost"
              className="text-brand-navy hover:bg-brand-blue/10"
            >
              Ghost Button
            </Button>
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>shadcn/ui Integration</CardTitle>
              <CardDescription>
                All components use your brand colors automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The color system is configured to use your brand colors
                throughout all shadcn/ui components. You can also use the custom
                brand color classes like{" "}
                <code className="bg-muted px-1 rounded">bg-brand-blue</code>{" "}
                directly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
