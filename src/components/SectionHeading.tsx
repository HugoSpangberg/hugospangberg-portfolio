type SectionHeadingProps = {
  kicker: string;
  title: string;
  align?: 'left' | 'center';
  id?: string;
};

function SectionHeading({
  kicker,
  title,
  align = 'left',
  id,
}: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <p className="section-heading__kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

export default SectionHeading;
