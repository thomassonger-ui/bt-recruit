import Navbar from "@/components/layout/Navbar";
import Section from "@/components/layout/Section";
import Hero from "@/components/features/Hero";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import ScoutAccordion from "@/components/ui/ScoutAccordion";
import BearSystemsOverview from "@/components/sections/BearSystemsOverview";
import Footer from "@/components/ui/Footer";

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

      {/* The BearTeam System — Bear Academy + BearTeamOS */}
      <div id="training">
        <BearSystemsOverview />
      </div>

      {/* Call to Action */}
      <Section className="bg-card">
        <FadeIn>
          <div id="cta" className="flex flex-col items-center gap-6 text-center py-8">
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
              Ready to Grow With BearTeam?
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-muted">
              No commitment, no pressure — just an honest conversation about
              what BearTeam can do for your business.
            </p>
            <a
              href="sms:4077588102?body=Hello%20Tom,%20I%20would%20like%20to%20learn%20more%20about%20joining%20BearTeam."
              className="pt-4"
            >
              <Button variant="primary" className="!px-8 !py-4 !text-base">
                Schedule a Confidential Conversation
              </Button>
            </a>
          </div>
        </FadeIn>
      </Section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
