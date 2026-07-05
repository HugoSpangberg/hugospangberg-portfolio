import type { Experience } from '../data/content';

type ExperienceCardProps = {
  experience: Experience;
  id?: string;
  isFeatured?: boolean;
};

function ExperienceCard({ experience, id, isFeatured = false }: ExperienceCardProps) {
  return (
    <article
      id={id}
      className={`timeline-card${isFeatured ? ' timeline-card--featured' : ''}`}
      data-reveal
    >
      <span className="timeline-card__node" aria-hidden="true" />
      <div>
        <p className="timeline-card__period">{experience.period}</p>
        <h3>{experience.role}</h3>
        <p className="timeline-card__company">{experience.company}</p>
      </div>
      <div>
        <p>{experience.description}</p>
        {experience.impact && (
          <ul className="impact-list">
            {experience.impact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {experience.focus && (
          <div className="tag-list" aria-label={`${experience.role} fokusområden`}>
            {experience.focus.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default ExperienceCard;
