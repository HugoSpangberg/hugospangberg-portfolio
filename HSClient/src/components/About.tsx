import SectionHeading from './SectionHeading';

type AboutProps = {
  content: {
    kicker: string;
    title: string;
    paragraphs: string[];
    lookingForTitle: string;
    lookingFor: string[];
    highlights: string[];
  };
};

function About({ content }: AboutProps) {
  return (
    <section
      className="section about-section"
      id="om-mig"
      aria-labelledby="about-title"
      data-reveal
    >
      <div className="container about__layout">
        <div className="about__header">
          <SectionHeading
            kicker={content.kicker}
            title={content.title}
            id="about-title"
          />
          <ul className="pill-list" aria-label="Profilområden">
            {content.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rich-copy">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="callout">
            <h3>{content.lookingForTitle}</h3>
            {content.lookingFor.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
