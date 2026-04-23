export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://api.tcgdex.net" />
      <link rel="preconnect" href="https://assets.tcgdex.net" />
      <link rel="dns-prefetch" href="https://api.tcgdex.net" />
      <link rel="dns-prefetch" href="https://assets.tcgdex.net" />
      <link rel="preload" href="/pokemon-cards/css/all-cards.css" as="style" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var l = document.createElement('link');
              l.rel = 'stylesheet';
              l.href = '/pokemon-cards/css/all-cards.css';
              l.media = 'print';
              l.onload = function() { this.media = 'all'; };
              document.head.appendChild(l);
            })();
          `,
        }}
      />
    </>
  );
}
