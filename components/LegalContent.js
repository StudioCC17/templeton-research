// components/LegalContent.js
// Static legal document renderer. Holds Privacy Policy, Cookie Policy and
// Terms of Use as hardcoded content, and renders one based on the slug the
// overlay passes in. No Sanity fetch — this content rarely changes and lives
// in the codebase so it's version-controlled alongside everything else.
//
// To edit copy: change the JSX below. Fill in every [BRACKETED] placeholder
// before going live.

import styles from './LegalContent.module.css'

// Slugs the overlay + footer use. Keep in sync with LegalOverlay.js and Footer.js
export const LEGAL_SLUGS = ['privacy-policy', 'cookie-policy', 'terms-of-use']

// Human-readable titles, handy for aria labels
export const LEGAL_TITLES = {
  'privacy-policy': 'Privacy Policy',
  'cookie-policy': 'Cookie Policy',
  'terms-of-use': 'Terms of Use',
}

// ============================================================
// PRIVACY POLICY
// ============================================================

function PrivacyPolicy() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: [DATE]</p>
      </header>

      <div className={styles.body}>
        <p>
          This Privacy Policy explains how Templeton Research (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects and uses personal data when you
          visit [www.templeton-research.com] or contact us through this website. We are
          committed to protecting your privacy and handling your data in line with the UK
          General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </p>

        <h2>Who we are</h2>
        <p>For the purposes of UK data protection law, the data controller is:</p>
        <p className={styles.address}>
          Templeton Research
          <br />
          [Registered address]
          <br />
          [Company registration number, if applicable]
          <br />
          Email: [projects@templeton-research.com]
        </p>
        <p>
          [If you have registered with the Information Commissioner&rsquo;s Office, include
          your ICO registration number here.]
        </p>

        <h2>What data we collect</h2>
        <p>
          This website collects personal data only when you choose to send us an enquiry
          through our contact form. When you do, we collect:
        </p>
        <ul>
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your company name (optional)</li>
          <li>The content of your message</li>
          <li>The date and time your message was submitted</li>
        </ul>
        <p>
          We do not use analytics, advertising, or marketing tracking on this website, and
          we do not collect personal data automatically beyond what is strictly necessary
          to operate and secure the site (see our Cookie Policy).
        </p>

        <h2>How we use your data and our lawful basis</h2>
        <p>
          We use the information you submit through the contact form solely to read,
          respond to, and follow up on your enquiry.
        </p>
        <p>
          Our lawful basis for this processing is our <strong>legitimate interests</strong>{' '}
          (UK GDPR Article 6(1)(f)) - specifically, responding to and managing enquiries
          from people who choose to get in touch with us. We consider this processing to
          have a minimal privacy impact, as you provide the information voluntarily and for
          the purpose of receiving a reply.
        </p>
        <p>
          We will not use your contact details to send you marketing unless you separately
          and explicitly ask us to.
        </p>

        <h2>Who we share your data with</h2>
        <p>
          We do not sell your personal data, and we do not share it for marketing purposes.
          We do use trusted third-party service providers (&ldquo;processors&rdquo;) to
          operate this website. Your contact form submission is stored using:
        </p>
        <ul>
          <li>
            <strong>Sanity</strong> - our content platform, which stores contact form
            submissions. [Verify your dataset hosting region.]
          </li>
          <li>
            <strong>[Hosting provider, e.g. Vercel]</strong> - which hosts and serves this
            website.
          </li>
        </ul>
        <p>
          These providers process data on our instructions and are bound by appropriate
          data protection terms. We may also disclose your data where required to do so by
          law.
        </p>

        <h2>International transfers</h2>
        <p>
          Some of our service providers are based outside the UK, which may mean your
          personal data is transferred to and stored in a country outside the UK. Where
          this happens, we take steps to ensure your data is protected by an appropriate
          safeguard recognised under UK data protection law, such as the UK International
          Data Transfer Agreement (IDTA) or the UK Addendum to the EU Standard Contractual
          Clauses, or transfer to a country covered by UK adequacy regulations. [Confirm
          the specific mechanism your processors rely on.]
        </p>

        <h2>How long we keep your data</h2>
        <p>
          We keep contact form submissions for [e.g. 24 months] from the date of your
          enquiry, after which they are deleted, unless we need to retain them longer to
          manage an ongoing relationship or to comply with a legal obligation.
        </p>

        <h2>Your rights</h2>
        <p>Under UK data protection law, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Ask us to correct inaccurate or incomplete data</li>
          <li>Ask us to erase your data</li>
          <li>Object to, or ask us to restrict, our processing of your data</li>
          <li>Request that we transfer your data to another organisation (data portability)</li>
          <li>Withdraw consent, where our processing is based on consent</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at [projects@templeton-research.com].
          We will respond within one month.
        </p>

        <h2>Complaints</h2>
        <p>
          If you have a concern about how we handle your data, please contact us first so
          we can try to resolve it. You also have the right to lodge a complaint with the
          UK supervisory authority:
        </p>
        <p className={styles.address}>
          Information Commissioner&rsquo;s Office (ICO)
          <br />
          Website: ico.org.uk
          <br />
          Helpline: 0303 123 1113
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top shows when it was last revised.
        </p>

        <h2>Contact</h2>
        <p>
          For any questions about this policy or your personal data, contact us at
          [projects@templeton-research.com].
        </p>
      </div>
    </>
  )
}

// ============================================================
// COOKIE POLICY
// ============================================================

function CookiePolicy() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Cookie Policy</h1>
        <p className={styles.lastUpdated}>Last updated: [DATE]</p>
      </header>

      <div className={styles.body}>
        <p>
          This Cookie Policy explains how Templeton Research (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;) uses cookies and similar technologies on
          [www.templeton-research.com]. It should be read alongside our Privacy Policy.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files that a website places on your device when you visit.
          They are widely used to make websites work, or work more efficiently, and to
          provide information to the site&rsquo;s operators. Similar technologies include
          local storage and pixels.
        </p>

        <h2>How we use cookies</h2>
        <p>
          This is a simple, content-focused website. We do <strong>not</strong> use cookies
          for analytics, advertising, profiling, or marketing. We do not track your
          activity across other websites.
        </p>
        <p>
          We only use cookies and similar technologies that fall into the categories below.
        </p>

        <h3>Strictly necessary</h3>
        <p>
          These are essential for the website to function and to keep it secure. They are
          set automatically and cannot be switched off through our site. They do not store
          any information that personally identifies you for marketing purposes.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cookie / technology</th>
                <th>Set by</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>[e.g. hosting/security cookie]</td>
                <td>[Hosting provider]</td>
                <td>Keeps the site running securely and reliably</td>
                <td>[Session / duration]</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Third-party services</h3>
        <p>We load some resources from third parties to display the website correctly:</p>
        <ul>
          <li>
            <strong>Adobe Fonts (Typekit)</strong> - used to serve the typography on this
            site. Adobe may process limited technical information (such as your IP address)
            to deliver the fonts. [Confirm whether Adobe Fonts sets any cookies in your
            configuration; the standard web-only embed is designed not to.]
          </li>
        </ul>
        <p>
          [List any other third-party resources that set cookies, or delete this section if
          none apply.]
        </p>

        <h2>Managing cookies</h2>
        <p>
          Because we only use strictly necessary cookies (and, where applicable, third-party
          font delivery), there is no consent banner required for non-essential tracking -
          because we don&rsquo;t do any.
        </p>
        <p>
          You can still control or delete cookies through your browser settings at any time.
          Most browsers let you block or remove cookies, though doing so may affect how this
          and other websites work. Guidance for common browsers is available at
          [aboutcookies.org] or your browser&rsquo;s help pages.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Cookie Policy from time to time. The &ldquo;Last updated&rdquo;
          date above shows when it was last revised.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about our use of cookies, contact us at
          [projects@templeton-research.com].
        </p>
      </div>
    </>
  )
}

// ============================================================
// TERMS OF USE
// ============================================================

function TermsOfUse() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms of Use</h1>
        <p className={styles.lastUpdated}>Last updated: [DATE]</p>
      </header>

      <div className={styles.body}>
        <p>
          These Terms of Use govern your access to and use of [www.templeton-research.com]
          (the &ldquo;website&rdquo;), operated by Templeton Research (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;). By using the website, you agree to these
          terms. If you do not agree, please do not use the website.
        </p>

        <h2>About us</h2>
        <p className={styles.address}>
          Templeton Research
          <br />
          [Registered address]
          <br />
          [Company registration number, if applicable]
          <br />
          Email: [projects@templeton-research.com]
        </p>

        <h2>Using our website</h2>
        <p>You may use this website for lawful purposes only. You agree not to:</p>
        <ul>
          <li>Use the website in any way that breaches any applicable law or regulation</li>
          <li>
            Attempt to gain unauthorised access to the website, the server on which it is
            stored, or any connected server, computer, or database
          </li>
          <li>
            Introduce viruses, malware, or other material that is malicious or
            technologically harmful
          </li>
          <li>
            Use any automated system to access, scrape, or copy the website in a way that
            places an unreasonable load on our infrastructure
          </li>
          <li>Use the website to transmit unsolicited or unauthorised advertising</li>
        </ul>
        <p>
          We may suspend or withdraw access to all or part of the website at any time
          without notice. We do not guarantee that the website, or any content on it, will
          always be available or uninterrupted.
        </p>

        <h2>Intellectual property</h2>
        <p>
          All content on this website - including text, graphics, logos, images, layout, and
          design - is owned by or licensed to Templeton Research and is protected by
          copyright and other intellectual property laws. You may view and print pages for
          your own personal, non-commercial use. You must not reproduce, distribute, modify,
          or otherwise use any content for commercial purposes without our prior written
          permission.
        </p>

        <h2>No reliance on information</h2>
        <p>
          The content on this website is provided for general information only. It does not
          constitute advice - including investment, financial, legal, or professional advice
          - on which you should rely. Any engagement of our services is subject to a separate
          written agreement. We make no representations or warranties, whether express or
          implied, that the content on the website is accurate, complete, or up to date.
        </p>

        <h2>Links to other sites</h2>
        <p>
          Where the website contains links to other sites and resources provided by third
          parties, these links are provided for your information only. We have no control
          over the contents of those sites or resources and accept no responsibility for
          them or for any loss or damage that may arise from your use of them.
        </p>

        <h2>Our liability</h2>
        <p>
          Nothing in these terms excludes or limits our liability where it would be unlawful
          to do so, including liability for death or personal injury caused by negligence, or
          for fraud or fraudulent misrepresentation.
        </p>
        <p>
          To the extent permitted by law, we exclude all implied conditions, warranties,
          representations, or other terms that may apply to the website or any content on it.
          We will not be liable to you for any loss or damage, whether in contract, tort
          (including negligence), breach of statutory duty, or otherwise, arising under or in
          connection with use of, or inability to use, the website, or use of or reliance on
          any content displayed on it.
        </p>

        <h2>Your information</h2>
        <p>
          Our use of any personal data you provide through the website is governed by our
          Privacy Policy and Cookie Policy.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may revise these Terms of Use at any time by amending this page. Please check
          this page from time to time to take notice of any changes, as they are binding on
          you.
        </p>

        <h2>Governing law</h2>
        <p>
          These Terms of Use, their subject matter, and their formation are governed by the
          laws of England and Wales. You and we both agree that the courts of England and
          Wales will have exclusive jurisdiction over any dispute arising from or related to
          them.
        </p>

        <h2>Contact</h2>
        <p>To contact us, please email [projects@templeton-research.com].</p>
      </div>
    </>
  )
}

// ============================================================
// Main component — picks the document by slug
// ============================================================

export default function LegalContent({ slug }) {
  return (
    <article className={styles.doc}>
      <div className={styles.inner}>
        {slug === 'privacy-policy' && <PrivacyPolicy />}
        {slug === 'cookie-policy' && <CookiePolicy />}
        {slug === 'terms-of-use' && <TermsOfUse />}
      </div>
    </article>
  )
}
