import type { SystemThinkingCard } from '../data/content';
import SectionHeading from './SectionHeading';

type SystemThinkingProps = {
  content: {
    kicker: string;
    title: string;
    body: string;
    cards: SystemThinkingCard[];
  };
};

function SystemThinking({ content }: SystemThinkingProps) {
  return (
    <section
      className="section system-thinking"
      aria-labelledby="system-thinking-title"
      data-reveal
    >
      <div className="container system-thinking__inner">
        <div>
          <SectionHeading
            kicker={content.kicker}
            title={content.title}
            id="system-thinking-title"
          />
          <p className="section-intro">{content.body}</p>
        </div>
        <div className="system-flow" aria-label={content.title}>
          {content.cards.map((card, index) => (
            <article className="card system-card" key={card.title}>
              <span className="card-node" aria-hidden="true" />
              <span className="system-card__step">0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SystemThinking;
