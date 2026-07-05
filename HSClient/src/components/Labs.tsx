import type { Lab } from '../data/content';
import SectionHeading from './SectionHeading';

type LabsProps = {
  content: {
    kicker: string;
    title: string;
    description: string;
    items: Lab[];
  };
};

function Labs({ content }: LabsProps) {
  return (
    <section
      className="section section--tinted"
      id="projekt"
      aria-labelledby="labs-title"
      data-reveal
    >
      <div className="container">
        <SectionHeading kicker={content.kicker} title={content.title} id="labs-title" />
        <p className="section-intro">{content.description}</p>
        <div className="card-grid">
          {content.items.map((item) => (
            <article className="card lab-card" key={item.title}>
              <span className="card-node" aria-hidden="true" />
              <div className="lab-card__topline">
                <h3>{item.title}</h3>
              </div>
              <p>{item.description}</p>
              <div className="tag-list" aria-label={`${item.title} tekniker`}>
                {item.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Labs;
