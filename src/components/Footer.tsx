type FooterProps = {
  content: {
    text: string;
    backToTop: string;
  };
};

function Footer({ content }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>{content.text}</p>
        <a href="#start">{content.backToTop}</a>
      </div>
    </footer>
  );
}

export default Footer;
