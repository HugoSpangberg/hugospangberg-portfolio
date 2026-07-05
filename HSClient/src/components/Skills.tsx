import type { Skill } from '../data/content';
import SectionHeading from './SectionHeading';
import SkillCard from './SkillCard';

type SkillsProps = {
  content: {
    kicker: string;
    title: string;
    coreFocusLabel: string;
    coreFocus: string[];
    items: Skill[];
  };
};

function Skills({ content }: SkillsProps) {
  return (
    <section
      className="section section--tinted"
      id="skills"
      aria-labelledby="skills-title"
      data-reveal
    >
      <div className="container">
        <SectionHeading
          kicker={content.kicker}
          title={content.title}
          id="skills-title"
        />
        <div className="core-focus" aria-label={content.coreFocusLabel}>
          <span>{content.coreFocusLabel}:</span>
          <div>
            {content.coreFocus.map((item) => (
              <strong key={item}>{item}</strong>
            ))}
          </div>
        </div>
        <div className="card-grid">
          {content.items.map((skill) => (
            <SkillCard key={skill.title} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
