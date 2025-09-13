import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, MoreHorizontal, Upload } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Files Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-brand-gray" />
        <h1 className="text-2xl font-semibold">Files</h1>
      </div>

      {/* Important Information */}
      <Card className="p-4 mb-6 bg-brand-blue/10 border-brand-blue/20">
        <h2 className="font-semibold mb-3">Important information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
            <p>
              We use both WordPress and Joomla, the two most powerful content
              management systems
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
            <p>
              The website will have high-quality, SEO-optimized content and will
              be integrated with social media
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
            <p>Use the logobook and ui-kit when working with the content</p>
          </div>
        </div>
      </Card>

      {/* Files Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Files</h2>
        <div className="space-y-3">
          {/* File Items */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">strategies.pdf</p>
                <p className="text-sm text-muted-foreground">(11.5.3 MB)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">marketing_research.exl</p>
                <p className="text-sm text-muted-foreground">(42.15 MB)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">content_schedule.docx</p>
                <p className="text-sm text-muted-foreground">(21.08 MB)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Files Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Here, you can add some helpful information about file uploading
        </p>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-brand-blue/50 rounded-lg p-8 text-center bg-brand-blue/5">
          <Upload className="h-8 w-8 text-brand-blue mx-auto mb-3" />
          <p className="text-muted-foreground">
            Drag file(s) here or{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-brand-blue hover:text-brand-blue/80"
            >
              click to upload
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
