import type { BuiltWithSection } from '../data/content';
import SectionHeading from './SectionHeading';

type BuiltWithProps = {
  content: {
    kicker: string;
    title: string;
    paragraphs: string[];
    sections: BuiltWithSection[];
  };
};

function BuiltWith({ content }: BuiltWithProps) {
  return (
    <section
      className="section section--compact"
      aria-labelledby="built-with-title"
      data-reveal
    >
      <div className="container">
        <SectionHeading
          kicker={content.kicker}
          title={content.title}
          align="center"
          id="built-with-title"
        />
        <div className="built-with__copy">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="built-grid">
          {content.sections.map((section) => (
            <article className="card built-card" key={section.title}>
              <span className="card-node" aria-hidden="true" />
              <h3>{section.title}</h3>
              <ul className="tag-list">
                {section.items.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BuiltWith;
