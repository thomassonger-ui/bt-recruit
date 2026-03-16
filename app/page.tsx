import Navbar from "@/components/layout/Navbar";
import Section from "@/components/layout/Section";
import Hero from "@/components/features/Hero";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import ScoutAccordion from "@/components/ui/ScoutAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
      <Navbar brand="BearTeam">
        <a href="#values" className="text-sm text-foreground hover:text-primary">Why BearTeam</a>
        <a href="#training" className="text-sm text-foreground hover:text-primary">Training</a>
        <a href="#cta" className="text-sm text-foreground hover:text-primary">Get Started</a>
      </Navbar>

      {/* Hero */}
      <div className="bg-panel-dark text-text-light">
        <Hero
          title="Build Teams That Perform"
          subtitle="BearTeam delivers training, systems, and strategy to help teams operate at their highest level — consistently."
        >
          <Button variant="secondary">Start Training</Button>
          <Button variant="ghost" className="text-text-light hover:bg-white/10">Learn More</Button>
        </Hero>
      </div>

      {/* Meet Scout */}
      <Section className="bg-card">
        <FadeIn>
          <div id="scout">
            <h2 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
              Meet Scout
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted">
              Your AI-powered real estate assistant. Scout helps agents work faster across listings, buyers, showings, communication, and marketing.
            </p>
            <ScoutAccordion />
            <div className="mt-8 flex justify-center">
              <a href="/chat">
                <Button variant="secondary">Try Scout Live</Button>
              </a>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Value Proposition */}
      <Section className="bg-background">
        <FadeIn>
          <div id="values">
            <h2 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
              Why Teams Choose BearTeam
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
              We combine proven frameworks with hands-on coaching to unlock performance at every level.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <h3 className="mb-2 text-lg font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Proven Frameworks</h3>
                <p className="text-sm text-muted">Battle-tested systems designed for real-world team dynamics, not theory.</p>
              </Card>
              <Card>
                <h3 className="mb-2 text-lg font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Hands-On Coaching</h3>
                <p className="text-sm text-muted">Direct, practical guidance from experienced team builders who have been in the trenches.</p>
              </Card>
              <Card>
                <h3 className="mb-2 text-lg font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Measurable Results</h3>
                <p className="text-sm text-muted">Track progress with clear metrics and see the impact on your team's output.</p>
              </Card>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Training & Systems */}
      <Section className="bg-background">
        <FadeIn>
          <div id="training">
            <h2 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
              Training & Systems
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
              Structured programs that scale with your organization.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <h3 className="mb-2 text-xl font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Team Alignment Program</h3>
                <p className="mb-4 text-sm text-muted">
                  A 6-week intensive that aligns your team around shared goals, clear roles, and effective communication patterns.
                </p>
                <Button variant="secondary">Learn More</Button>
              </Card>
              <Card>
                <h3 className="mb-2 text-xl font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Operations Toolkit</h3>
                <p className="mb-4 text-sm text-muted">
                  Ready-to-deploy systems for standups, retrospectives, decision-making, and async workflows.
                </p>
                <Button variant="secondary">Explore Tools</Button>
              </Card>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Call to Action */}
      <Section className="bg-panel-blue text-text-light">
        <FadeIn>
          <div id="cta" className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
              Ready to Level Up Your Team?
            </h2>
            <p className="max-w-xl text-lg text-text-light/70">
              Get started with a free consultation and see how BearTeam can transform the way your team works.
            </p>
            <div className="flex gap-4">
              <Button variant="secondary">Book a Call</Button>
              <Button variant="ghost" className="text-text-light hover:bg-white/10">View Case Studies</Button>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Footer */}
      <footer className="border-t border-muted/20 bg-card px-6 py-8 text-center text-sm text-muted">
        &copy; 2026 BearTeam. All rights reserved.
      </footer>
    </div>
  );
}
