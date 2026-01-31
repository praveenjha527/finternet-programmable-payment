import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Unified programmable payments</p>
            <Heading as="h1" className={styles.heroTitle}>
              Unified Programmable Payments for the{' '}
              <span className={styles.accentText}>Global Economy</span>
            </Heading>
            <p className={styles.heroSubtitle}>
              An infrastructure layer that turns static payments into
              intelligent, rule-based financial flows—built on trusted systems
              for institutions and innovators worldwide.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} to="/getting-started/overview">
                Read the Documentation
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.orbitRing} />
            <div className={styles.orbitRingSecondary} />
            <div className={styles.heroGlobe}>
              <div className={styles.globeDots} />
            </div>
            <div className={styles.tag}>
              <span>&lt;Interoperability&gt;</span>
            </div>
            <div className={`${styles.tag} ${styles.tagRight}`}>
              <span>&lt;Trusted Rails&gt;</span>
            </div>
            <div className={`${styles.tag} ${styles.tagBottom}`}>
              <span>&lt;Rules &amp; Conditions&gt;</span>
            </div>
            <div className={`${styles.tag} ${styles.tagLower}`}>
              <span>&lt;Embedded compliance&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageSandbox() {
  return (
    <section className={styles.sandboxSection}>
      <div className="container">
        <div className={styles.sandboxGrid}>
          <div>
            <span className={styles.sandboxLabel}>Developer Environment</span>
            <Heading as="h2" className={styles.sandboxTitle}>
              Sandbox
            </Heading>
            <p className={styles.sandboxCopy}>
              A controlled environment where regulated institutions and builders
              can explore, test, and validate programmable payment flows safely.
            </p>
            <div className={styles.sandboxTiles}>
              <div>
                <h4>Reference Flows</h4>
                <p>Pre-built templates</p>
              </div>
              <div>
                <h4>Test Environment</h4>
                <p>Safe experimentation</p>
              </div>
              <div>
                <h4>Collaboration</h4>
                <p>Work with experts</p>
              </div>
            </div>
            <Link className={styles.sandboxCta} to="/examples/quickstart">
              Explore the Sandbox
            </Link>
          </div>
          <div className={styles.sandboxTerminal}>
            <div className={styles.terminalHeader}>
              <span className={styles.terminalDot} />
              <span className={styles.terminalDot} />
              <span className={styles.terminalDot} />
              <span className={styles.terminalTitle}>sandbox.finternet.dev</span>
            </div>
            <pre className={styles.terminalBody}>
{`$ finternet init --template trade-finance
✔ Initialized payment flow template
✔ Connected to sandbox environment
✔ Compliance rules loaded

$ finternet deploy --flow milestone-release
Deploying flow to sandbox...
✔ Flow deployed successfully

$ finternet test --scenario delivery-confirmed
✔ Payment released: ₹50,000 → Supplier A
✔ Compliance check: PASSED`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageHighlights() {
  return (
    <section className={styles.featureBand}>
      <div className="container">
        <div className={styles.featureGrid}>
          <div>
            <h3>Programmable</h3>
            <p>Rules-embedded payments</p>
          </div>
          <div>
            <h3>Compliant</h3>
            <p>Built-in regulatory logic</p>
          </div>
          <div>
            <h3>Interoperable</h3>
            <p>Cross-rail connectivity</p>
          </div>
          <div>
            <h3>Institutional</h3>
            <p>Enterprise-grade infrastructure</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageSecurity() {
  return (
    <section className={styles.securitySection}>
      <div className="container">
        <div className={styles.securityGrid}>
          <div>
            <Heading as="h2">Security-first programmable payments</Heading>
            <p>
              Finternet is designed for regulated environments. Protect funds
              and users with layered controls, tamper-evident audit trails, and
              verifiable workflows at every step.
            </p>
            <ul className={styles.securityList}>
              <li>Policy-based approvals and escrow safeguards</li>
              <li>Signed webhooks and immutable event histories</li>
              <li>Role-based access controls with continuous monitoring</li>
            </ul>
          </div>
          <div className={styles.securityCard}>
            <h3>Platform protections</h3>
            <p>
              Built-in controls help your team enforce compliance requirements
              while maintaining instant visibility into every payment state.
            </p>
            <div className={styles.securityStats}>
              <div>
                <span>24/7</span>
                <p>risk monitoring</p>
              </div>
              <div>
                <span>SOC 2</span>
                <p>aligned operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageNewsletter() {
  return (
    <section className={styles.newsletter}>
      <div className="container">
        <div className={styles.newsletterCard}>
          <div>
            <Heading as="h2">Stay in the loop</Heading>
            <p>
              Get product updates, launch notes, and programmable payments best
              practices in your inbox.
            </p>
          </div>
          <form className={styles.newsletterForm}>
            <input
              className={styles.newsletterInput}
              type="email"
              name="email"
              placeholder="you@company.com"
              required
            />
            <button className={styles.newsletterButton} type="submit">
              Sign up for the newsletter
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function HomepageCallout() {
  return (
    <section className={styles.callout}>
      <div className="container">
        <div className={styles.calloutHeader}>
          <Heading as="h2">What Finternet’s Programmable Payment Rails Enable</Heading>
          <p>
            Build payment flows that stay compliant, interoperable, and globally
            connected with smart rules baked in.
          </p>
        </div>
        <div className={styles.enableGrid}>
          <div>
            <h3>Conditional settlement</h3>
            <p>Release funds only when delivery, SLA, or milestone signals land.</p>
          </div>
          <div>
            <h3>Embedded compliance</h3>
            <p>Enforce jurisdictional rules, audit trails, and approvals by default.</p>
          </div>
          <div>
            <h3>Cross-rail payouts</h3>
            <p>Move value between fiat and chain-based rails without manual hops.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Finternet documentation for programmable payments, escrow, and settlement APIs.">
      <HomepageHeader />
      <main className={styles.mainContent}>
        <HomepageHighlights />
        <HomepageSandbox />
        <HomepageSecurity />
        <HomepageCallout />
        <HomepageNewsletter />
      </main>
    </Layout>
  );
}
