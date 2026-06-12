import { Footer } from "@/components/seo/Shell";
export default function PrivacyPolicy() {
  return (
    <>
    <div style={{ minHeight: "100vh", background: "#ffffff", padding: "60px 20px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", fontFamily: "Inter, -apple-system, sans-serif" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0b1d3a", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "40px" }}>Last updated: April 5, 2026</p>

        <Section title="1. Who We Are">
          <p>This Privacy Policy applies to all websites, applications, and services operated by Bear Real Estate Team (&ldquo;Bear Team,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), including but not limited to:</p>
          <ul>
            <li>joinbearteam.com</li>
            <li>BearTeamOS&trade; (dashboard and agent tools)</li>
            <li>Scout&trade; (AI-powered assistant)</li>
            <li>Bear Academy&trade; (training platform)</li>
          </ul>
          <p>Bear Team is an independently licensed real estate brokerage based in Orlando, Florida. Bethanne Baer, Licensed Broker.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong>Personal Information:</strong> Name, email address, phone number, and other contact details you provide through forms, chat, scheduling tools, or direct communication.</p>
          <p><strong>Usage Data:</strong> Pages visited, time spent on pages, click behavior, referring URLs, browser type, device type, and operating system.</p>
          <p><strong>IP Address:</strong> We collect your Internet Protocol (IP) address when you visit our sites. IP addresses may be used for analytics, security, fraud prevention, geographic analysis, and to administer and improve our services.</p>
          <p><strong>Cookies &amp; Tracking Technologies:</strong> We use cookies, pixels, and similar technologies to recognize returning visitors, analyze traffic, and improve user experience. You may disable cookies in your browser settings, though some features may not function properly.</p>
          <p><strong>Chat &amp; AI Interaction Data:</strong> When you interact with Scout&trade; or any AI-powered tool on our platform, we collect the content of those conversations to improve service quality, train our systems, and provide personalized responses.</p>
          <p><strong>Scheduling Data:</strong> When you book a call through Calendly or similar tools, we receive the information you provide (name, email, selected time).</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To provide, operate, and improve our websites and services</li>
            <li>To respond to inquiries and communicate with you</li>
            <li>To schedule appointments and discovery calls</li>
            <li>To personalize your experience across our platforms</li>
            <li>To analyze site usage and optimize performance</li>
            <li>To detect, prevent, and address fraud or security issues</li>
            <li>To comply with legal obligations</li>
            <li>To train and improve our AI systems (Scout&trade;) using anonymized interaction data</li>
          </ul>
        </Section>

        <Section title="4. Intellectual Property">
          <p>All content, software, designs, text, graphics, logos, trademarks, and proprietary technology on our websites and platforms are the exclusive intellectual property of Bear Real Estate Team unless otherwise stated. This includes but is not limited to:</p>
          <ul>
            <li><strong>Scout&trade;</strong> &mdash; AI-powered assistant, including all underlying logic, prompts, conversation flows, and training data</li>
            <li><strong>BearTeamOS&trade;</strong> &mdash; Brokerage operating system, including dashboards, pipeline tools, compliance systems, and all related software</li>
            <li><strong>Bear Academy&trade;</strong> &mdash; Training platform, course content, curriculum, and instructional materials</li>
            <li>All website designs, page layouts, copy, and visual assets across joinbearteam.com and related properties</li>
          </ul>
          <p>You may not copy, reproduce, distribute, modify, create derivative works from, publicly display, or otherwise exploit any of our intellectual property without prior written consent from Bear Real Estate Team.</p>
          <p>Unauthorized use of any Bear Team intellectual property may result in legal action under applicable federal and state laws, including the U.S. Copyright Act, the Lanham Act, and Florida state law.</p>
        </Section>

        <Section title="5. Data Sharing &amp; Third Parties">
          <p>We do not sell your personal information. We may share data with trusted third-party service providers who assist in operating our platforms, including:</p>
          <ul>
            <li>Vercel (hosting)</li>
            <li>Calendly (scheduling)</li>
            <li>Anthropic / OpenAI (AI services)</li>
            <li>Google Analytics (website analytics)</li>
            <li>Moodle (learning management)</li>
          </ul>
          <p>These providers are contractually obligated to protect your data and use it only for the services they provide to us.</p>
          <p>We may also disclose information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, safety, or property.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain personal information for as long as necessary to fulfill the purposes described in this policy, or as required by law. Chat and AI interaction data may be retained indefinitely in anonymized form for system improvement.</p>
          <p>You may request deletion of your personal data by contacting us at the email address below.</p>
        </Section>

        <Section title="7. Security">
          <p>We implement commercially reasonable administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of certain data collection (e.g., cookies)</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>To exercise any of these rights, contact us using the information below.</p>
        </Section>

        <Section title="9. Children&rsquo;s Privacy">
          <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of our services after any changes constitutes acceptance of the revised policy.</p>
        </Section>

        <Section title="11. Contact Us">
          <p>If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:</p>
          <p>
            <strong>Bear Real Estate Team</strong><br />
            Orlando, FL<br />
            Email: Tom@BearTeam.com<br />
            Website: joinbearteam.com
          </p>
        </Section>
      </div>
    </div>
    <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0b1d3a", marginBottom: "12px" }}>{title}</h2>
      <div style={{ fontSize: "0.95rem", color: "#374151", lineHeight: 1.75 }}>
        <style>{`
          .privacy-section ul { padding-left: 20px; margin: 8px 0 16px; }
          .privacy-section li { margin-bottom: 6px; }
          .privacy-section p { margin-bottom: 12px; }
        `}</style>
        <div className="privacy-section">{children}</div>
      </div>
    </div>
  );
}
