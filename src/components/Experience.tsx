import type { Experience as ExperienceItem } from '../data/content';
import ExperienceCard from './ExperienceCard';
import SectionHeading from './SectionHeading';

type ExperienceProps = {
  content: {
    kicker: string;
    title: string;
    items: ExperienceItem[];
  };
};

const experienceTargetByCompany: Record<string, string> = {
  'Dasa Control System': 'experience-dasa',
  'Södra Skogsägarna': 'experience-sodra',
  'Visma Enterprise': 'experience-visma',
  'Filmstaden Växjö AB': 'experience-filmstaden',
};

function Experience({ content }: ExperienceProps) {
  return (
    <section
      className="section"
      id="erfarenhet"
      aria-labelledby="experience-title"
      data-reveal
    >
      <div className="container">
        <SectionHeading
          kicker={content.kicker}
          title={content.title}
          id="experience-title"
        />
        <div className="timeline">
          {content.items.map((item, index) => {
            const targetId = experienceTargetByCompany[item.company];
            const isDuplicateTarget = content.items
              .slice(0, index)
              .some((previousItem) => previousItem.company === item.company);

            return (
              <ExperienceCard
                key={`${item.role}-${item.company}-${item.period}`}
                experience={item}
                id={isDuplicateTarget ? undefined : targetId}
                isFeatured={index < 3}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Experience;
