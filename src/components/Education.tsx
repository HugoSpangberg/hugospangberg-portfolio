import type { Education as EducationItem } from '../data/content';
import SectionHeading from './SectionHeading';

type EducationProps = {
  content: {
    kicker: string;
    title: string;
    items: EducationItem[];
  };
};

function Education({ content }: EducationProps) {
  return (
    <section
      className="section section--compact education-section"
      id="education"
      aria-labelledby="education-title"
      data-reveal
    >
      <div className="container">
        <div className="education__header">
          <SectionHeading
            kicker={content.kicker}
            title={content.title}
            id="education-title"
          />
        </div>
        <div className="education__grid">
          {content.items.map((item) => (
            <article className="card" key={`${item.program}-${item.school}`}>
              <span className="card-node" aria-hidden="true" />
              <p className="meta">{item.period}</p>
              <h3>{item.program}</h3>
              <p className="muted">{item.school}</p>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Education;
