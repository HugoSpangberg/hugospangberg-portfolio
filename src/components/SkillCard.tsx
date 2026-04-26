import type { Skill } from '../data/content';

type SkillCardProps = {
  skill: Skill;
};

function SkillCard({ skill }: SkillCardProps) {
  return (
    <article className="card skill-card">
      <span className="card-node" aria-hidden="true" />
      <h3>{skill.title}</h3>
      <p>{skill.description}</p>
      <div className="tag-list" aria-label={`${skill.title} tekniker`}>
        {skill.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

export default SkillCard;
