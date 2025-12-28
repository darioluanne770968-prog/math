import { Sidebar } from "@/components/layout/Sidebar";
import { SubjectNav } from "@/components/layout/SubjectNav";
import Link from "next/link";
import { ArrowRight, Video, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60">
        <SubjectNav />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-8">
          <div className="max-w-2xl text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Learn Math with{" "}
                <span className="text-primary">AI-Powered</span> Videos
              </h1>
              <p className="text-lg text-muted-foreground">
                Create engaging video explanations for any STEM concept.
                Just ask a question and get a personalized video tutorial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools/video">
                <Button size="lg" className="gap-2">
                  <Video className="h-5 w-5" />
                  Create Video
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="lg" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  Explore Gallery
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI-Generated Content</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI creates step-by-step explanations tailored to your question.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Video Explanations</h3>
                <p className="text-sm text-muted-foreground">
                  Watch animated videos with voiceover explaining each concept.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Multiple Subjects</h3>
                <p className="text-sm text-muted-foreground">
                  Math, Physics, Chemistry, and Accounting - all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
