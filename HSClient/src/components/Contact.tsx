import SectionHeading from './SectionHeading';

type ContactProps = {
  content: {
    kicker: string;
    title: string;
    paragraphs: string[];
    cta: string;
    secondaryCta: string;
    linksLabel: string;
    links: {
      label: string;
      value: string;
      href?: string;
    }[];
  };
};

function Contact({ content }: ContactProps) {
  return (
    <section
      className="section contact-section"
      id="contact"
      aria-labelledby="contact-title"
      data-reveal
    >
      <div className="container contact-panel">
        <SectionHeading
          kicker={content.kicker}
          title={content.title}
          id="contact-title"
        />
        <div className="rich-copy">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="contact-actions">
            <a className="button button--primary" href={content.links[0]?.href}>
              {content.cta}
            </a>
            <a
              className="button button--ghost"
              href={content.links[1]?.href}
              target="_blank"
              rel="noreferrer"
            >
              {content.secondaryCta}
            </a>
          </div>
          <div className="contact-links" aria-label={content.linksLabel}>
            {content.links.map((link) => (
              <div className="contact-link" key={link.label}>
                <span>{link.label}</span>
                {link.href ? (
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    {link.value}
                  </a>
                ) : (
                  <p>{link.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
