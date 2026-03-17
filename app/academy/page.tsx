import Navbar from "@/components/layout/Navbar";
import Section from "@/components/layout/Section";
import Hero from "@/components/features/Hero";
import Card from "@/components/ui/Card";
import IconCard from "@/components/ui/IconCard";
import Button from "@/components/ui/Button";

const modules = [
  { number: "01", title: "Foundations", description: "Core principles of real estate, client communication, and the BearTeam operating model." },
  { number: "02", title: "Lead Generation", description: "Proven strategies for building a consistent pipeline through digital, referral, and community channels." },
  { number: "03", title: "Buyer Mastery", description: "From first showing to closing — systems for guiding buyers through every step." },
  { number: "04", title: "Listing Excellence", description: "Pricing strategy, staging guidance, marketing plans, and seller negotiation frameworks." },
  { number: "05", title: "Contracts & Compliance", description: "Navigate contracts, disclosures, and legal requirements with confidence." },
  { number: "06", title: "Growth & Leadership", description: "Scale your business, build a personal brand, and develop leadership skills within the team." },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
      <Navbar brand="BearTeam">
        <a href="/" className="text-sm text-foreground hover:text-primary">Home</a>
        <a href="#overview" className="text-sm text-foreground hover:text-primary">Overview</a>
        <a href="#modules" className="text-sm text-foreground hover:text-primary">Modules</a>
        <a href="#enroll" className="text-sm text-foreground hover:text-primary">Enroll</a>
      </Navbar>

      {/* Hero */}
      <div className="bg-panel-dark text-text-light">
        <Hero
          title="BearTeam Academy"
          subtitle="A structured training program designed to take agents from day one to top producer — with coaching, systems, and accountability at every stage."
        >
          <Button variant="secondary">Enroll Now</Button>
          <Button variant="ghost" className="text-text-light hover:bg-white/10">View Curriculum</Button>
        </Hero>
      </div>

      {/* Program Overview */}
      <Section className="bg-card">
        <div id="overview">
          <h2 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
            Program Overview
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            BearTeam Academy is a 12-week intensive program combining live coaching, self-paced coursework, and hands-on practice.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <IconCard icon="📅" title="12 Weeks" description="Structured timeline with weekly milestones and checkpoints." />
            <IconCard icon="🎯" title="Live Coaching" description="Weekly group sessions and bi-weekly 1-on-1s with experienced mentors." />
            <IconCard icon="📚" title="Self-Paced Modules" description="On-demand video lessons and exercises you can complete on your schedule." />
          </div>
        </div>
      </Section>

      {/* Course Modules */}
      <Section className="bg-background">
        <div id="modules">
          <h2 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
            Course Modules
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            Six modules that build on each other to develop a complete, high-performing agent.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <Card key={mod.number}>
                <span className="mb-2 block text-sm font-bold text-panel-blue">Module {mod.number}</span>
                <h3 className="mb-2 text-lg font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>
                  {mod.title}
                </h3>
                <p className="text-sm text-muted">{mod.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Learning Outcomes */}
      <Section className="bg-card">
        <h2 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
          What You&apos;ll Walk Away With
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
          Graduates leave the program ready to operate independently with confidence.
        </p>
        <div className="mx-auto max-w-2xl">
          <ul className="space-y-4">
            {[
              "A fully built lead generation system tailored to your market",
              "Mastery of buyer and seller transaction processes",
              "A personal brand strategy and marketing toolkit",
              "Confidence handling contracts, negotiations, and compliance",
              "A network of accountability partners and mentors within BearTeam",
              "A 90-day business plan for your first quarter post-graduation",
            ].map((outcome, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-foreground">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Enrollment CTA */}
      <Section className="bg-panel-blue text-text-light">
        <div id="enroll" className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
            Start Your Journey
          </h2>
          <p className="max-w-xl text-lg text-text-light/70">
            The next cohort begins soon. Apply now to secure your spot in BearTeam Academy.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary">Apply to Academy</Button>
            <Button variant="ghost" className="text-text-light hover:bg-white/10">Talk to an Advisor</Button>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-muted/20 bg-card px-6 py-8 text-center text-sm text-muted">
        Copyright 2026 WorldTeachPathways | Bear Team All rights reserved.
      </footer>
    </div>
  );
}
