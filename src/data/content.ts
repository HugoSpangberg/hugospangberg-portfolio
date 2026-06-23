export type Locale = 'sv' | 'en';

export type NavItem = {
  label: string;
  href: string;
};

export type HeroAction = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
  external?: boolean;
};

export type Skill = {
  title: string;
  description: string;
  tags: string[];
};

export type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
  focus?: string[];
  impact?: string[];
};

export type Education = {
  program: string;
  school: string;
  period: string;
  description: string;
};

export type Lab = {
  title: string;
  description: string;
  technologies: string[];
};

export type ContactLink = {
  label: string;
  value: string;
  href?: string;
};

export type SystemThinkingCard = {
  title: string;
  description: string;
};

export type BuiltWithSection = {
  title: string;
  items: string[];
};

export const content = {
  sv: {
    seo: {
      title: 'Hugo Spångberg – Webbutvecklare & Systemutvecklare',
      description:
        'Portfolio för Hugo Spångberg, webbutvecklare och systemutvecklare med fokus på .NET, automation, kvalitet och verksamhetsnytta.',
    },
    nav: [
      { label: 'Start', href: '#start' },
      { label: 'Om mig', href: '#om-mig' },
      { label: 'Kompetenser', href: '#skills' },
      { label: 'Erfarenhet', href: '#erfarenhet' },
      { label: 'Projekt', href: '#projekt' },
      { label: 'Säg hej', href: '#say-hi' },
      { label: 'Kontakt', href: '#contact' },
    ] satisfies NavItem[],
    hero: {
      eyebrow: 'Portfolio',
      title: 'Hugo Spångberg',
      role: 'Webbutvecklare & systemutvecklare med .NET-fokus',
      subtitle:
        'Jag bygger moderna webb- och systemlösningar med fokus på .NET, automation, kvalitet och verklig verksamhetsnytta. Med erfarenhet från IoT, processautomation, test och design skapar jag lösningar som är stabila, genomtänkta och användbara i praktiken.',
      tagline:
        'Kod, system och problemlösning med rötterna i skogen och blicken mot framtiden.',
      actionsLabel: 'Primära länkar',
      actions: [
        { label: 'Visa erfarenhet', href: '#erfarenhet', variant: 'primary' },
        { label: 'Se kompetenser', href: '#skills', variant: 'ghost' },
        { label: 'Kontakta mig', href: '#contact', variant: 'ghost' },
        {
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/hugo-spangberg',
          variant: 'ghost',
          external: true,
        },
      ] satisfies HeroAction[],
      availability: 'Öppen för roller inom webbutveckling, systemutveckling och backend.',
      stack: '.NET / C# / React / Automation',
      sceneLabel: 'Interaktiv karriärkarta med nordisk skog, IoT och systemutveckling',
      fallbackLabel: 'Statisk karriärkarta med skog, IoT och erfarenhetspunkter',
    },
    about: {
      kicker: 'Om mig',
      title: 'Professionell utveckling med praktisk förankring.',
      paragraphs: [
        'Jag är en webbutvecklare och systemutvecklare med fokus på .NET, backend och lösningar som gör nytta i riktiga verksamheter. Jag trivs bäst i miljöer där man samarbetar, delar idéer och bygger lösningar som håller över tid.',
        'Min erfarenhet sträcker sig från IoT-tjänster och systemutveckling till automation, test, CI-flöden och verksamhetsnära problemlösning. Jag har även en bakgrund inom motion design, service och ledarskap, vilket gör att jag gärna ser helheten: tekniken, användaren, teamet och värdet lösningen faktiskt skapar.',
        'Jag drivs av nyfikenhet, problemlösning och viljan att hela tiden bli bättre. För mig är bra utveckling inte bara kod som fungerar, utan kod och system som är begripliga, stabila och byggda med omtanke.',
        'Den här portfolion är inspirerad av nordisk skog, teknik och subtil sci-fi - en blandning som speglar både min arbetslivserfarenhet och mina personliga intressen.',
      ],
      lookingForTitle: 'Vad jag söker',
      lookingFor: [
        'Jag söker roller inom webbutveckling och systemutveckling där jag får arbeta med moderna tekniker, långsiktiga lösningar och team som värdesätter samarbete, kvalitet och lärande.',
        'Mitt främsta fokus ligger inom .NET, backend, webbapplikationer och systemutveckling, men jag trivs även i gränslandet mellan automation, test, frontend och verksamhetsnära problemlösning.',
      ],
      highlights: ['.NET', 'Backend', 'Webbutveckling', 'Automation', 'Test', 'IoT'],
    },
    skills: {
      kicker: 'Kompetenser',
      title: 'Teknikområden',
      coreFocusLabel: 'Core focus',
      coreFocus: ['.NET', 'C#', 'React', 'TypeScript', 'SQL', 'Automation', 'IoT'],
      items: [
        {
          title: 'Backend',
          description:
            'Jag har främst arbetat med .NET och C#, men har även erfarenhet av Java, Kotlin och Spring Boot. Jag tycker om att bygga tydliga, stabila och underhållbara backendlösningar med fokus på verkliga behov.',
          tags: ['C#', '.NET', 'ASP.NET Core', 'Entity Framework Core', 'Java', 'Kotlin', 'Spring Boot'],
        },
        {
          title: 'Frontend',
          description:
            'Jag bygger gärna moderna gränssnitt med React, TypeScript och välstrukturerad CSS. Min bakgrund inom design gör att jag uppskattar tydliga användarflöden, bra struktur och genomtänkta visuella detaljer.',
          tags: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS/SCSS', 'Blazor'],
        },
        {
          title: 'Databaser',
          description:
            'Jag har erfarenhet av relationsdatabaser och datamodellering, med fokus på att skapa lösningar som är begripliga, effektiva och lätta att vidareutveckla.',
          tags: ['SQL', 'SQL Server', 'PostgreSQL', 'DocumentDB'],
        },
        {
          title: 'Cloud & Infrastruktur',
          description:
            'Jag har arbetat med moln- och infrastrukturrelaterade verktyg som stödjer moderna utvecklingsflöden, deployment och skalbara system.',
          tags: ['Microsoft Azure', 'AWS', 'Docker'],
        },
        {
          title: 'DevOps & Verktyg',
          description:
            'Jag är van vid att arbeta i teammiljöer med versionshantering, ärendehantering och CI/CD-flöden. Jag gillar när utvecklingsprocessen är tydlig, automatiserad och lätt att följa.',
          tags: ['Git', 'GitHub', 'Bitbucket', 'Azure DevOps', 'CI/CD', 'Jira'],
        },
        {
          title: 'Automation & Kvalitet',
          description:
            'Automation och kvalitet har varit en viktig del av min utvecklarresa. Jag har byggt automatiserade flöden, arbetat med testautomation och förbättrat processer med hjälp av programmering.',
          tags: ['RPA', 'PowerShell', 'testautomation', 'kvalitetssäkring', 'GUI-verktyg', 'processförbättring'],
        },
        {
          title: 'CMS & Arbetssätt',
          description:
            'Jag har erfarenhet av CMS, agila arbetssätt och AI-assisterad utveckling som stöd i moderna utvecklingsprocesser.',
          tags: ['Umbraco', 'Scrum', 'AI-assisterad utveckling'],
        },
      ] satisfies Skill[],
    },
    systemThinking: {
      kicker: 'Systemtänk',
      title: 'Systemtänk i praktiken',
      body:
        'Jag gillar att förstå hur delar hänger ihop — människor, processer, data, system och användarflöden. Min erfarenhet från automation, IoT, test och verksamhetsnära utveckling gör att jag ofta tänker på hela kedjan: från behov och analys till implementation, kvalitet och långsiktig förvaltning.',
      cards: [
        {
          title: 'Förstå behovet',
          description:
            'Bryta ner problemet, förstå användaren och hitta var tekniken faktiskt kan skapa värde.',
        },
        {
          title: 'Bygga lösningen',
          description:
            'Skapa tydliga systemflöden, stabil backend, användbara gränssnitt och testbara delar.',
        },
        {
          title: 'Förbättra över tid',
          description:
            'Automatisera, kvalitetssäkra och vidareutveckla lösningar så att de håller i praktiken.',
        },
      ] satisfies SystemThinkingCard[],
    },
    experience: {
      kicker: 'Erfarenhet',
      title: 'Arbete och uppdrag',
      items: [
        {
          company: 'Dasa Control System',
          role: 'System Developer',
          period: 'Mars 2026 - Maj 2026',
          description:
            'På Dasa Control System arbetar jag med utveckling och underhåll av företagets produkter och IoT-tjänster, med fokus på backend i .NET och viss frontend. Rollen innebär arbete genom hela utvecklingsprocessen, från analys och implementation till test och förbättring av befintliga system. Jag bidrar även till förbättringar av arkitektur, arbetssätt och tekniska lösningar.',
          focus: ['.NET', 'backend', 'IoT', 'frontend', 'systemutveckling', 'arkitektur', 'test', 'förbättringsarbete'],
          impact: [
            'Utvecklade och underhöll IoT-tjänster med .NET.',
            'Bidrog till förbättringar av system, arkitektur och arbetssätt.',
          ],
        },
        {
          company: 'Södra Skogsägarna',
          role: 'Automation Developer',
          period: 'Maj 2025 - Februari 2026',
          description:
            'På Södra arbetade jag med att automatisera och förbättra affärsprocesser genom RPA och programmering. Rollen kombinerade teknisk utveckling med nära samarbete med verksamheten. Jag identifierade behov, byggde lösningar och kvalitetssäkrade automatiserade flöden med fokus på att skapa nytta, minska manuellt arbete och förbättra processer.',
          focus: ['.NET', 'PowerShell', 'RPA', 'automation', 'processförbättring', 'verksamhetsnära utveckling'],
          impact: [
            'Automatiserade affärsprocesser med .NET, PowerShell och RPA.',
            'Arbetade nära verksamheten för att minska manuellt arbete och förbättra flöden.',
          ],
        },
        {
          company: 'Visma Enterprise',
          role: 'Technical Quality Assurer, LIA',
          period: 'November 2024 - Maj 2025',
          description:
            'På Visma arbetade jag med automatiserade tester för HR-plus lönesystem. Jag byggde testautomation i C# och .NET, arbetade i CI-miljö och kvalitetssäkrade funktionalitet och prestanda. Jag utvecklade även ett GUI för testautomationsverktyg, vilket gav mig erfarenhet av att kombinera teknisk kvalitetssäkring med användarvänliga verktyg.',
          focus: ['C#', '.NET', 'testautomation', 'CI/CD', 'kvalitetssäkring', 'GUI-utveckling'],
          impact: [
            'Byggde testautomation i C# och .NET.',
            'Utvecklade GUI för testautomationsverktyg.',
          ],
        },
        {
          company: 'Filmstaden Växjö AB',
          role: 'Deputy Cinema Manager',
          period: 'Somrar: 2019-2022',
          description:
            'Som Deputy Cinema Manager ansvarade jag för fakturering, schemaläggning, premiärer, service och arbetsmiljö. Rollen gav mig erfarenhet av ansvar, planering och ledarskap i en miljö med högt tempo.',
          focus: ['Ledarskap', 'planering', 'service', 'ansvar', 'arbetsmiljö'],
          impact: [
            'Tog ansvar för planering, arbetsmiljö och operativ drift.',
          ],
        },
        {
          company: 'Filmstaden Växjö AB',
          role: 'Guest Experience Supervisor',
          period: 'Oktober 2012 - November 2024',
          description:
            'Under min tid på Filmstaden arbetade jag med personalansvar, kundupplevelse, rekrytering, utbildning, drift och servicekvalitet. Erfarenheten har gett mig en stark grund i kommunikation, ansvarstagande och samarbete. Det är erfarenheter jag tar med mig in i utvecklarrollen, särskilt när det gäller teamarbete, användarfokus och förståelse för verksamhetens behov.',
          focus: ['Teamledning', 'service', 'rekrytering', 'utbildning', 'drift', 'kundupplevelse'],
          impact: [
            'Byggde erfarenhet av teamledning, kommunikation och användarfokus.',
          ],
        },
        {
          company: 'Pacson',
          role: 'Lagerarbetare',
          period: 'Januari 2011 - November 2012',
          description:
            'På Pacson arbetade jag med orderplock, packning och leveranser. Rollen gav mig erfarenhet av struktur, ansvar och noggrannhet i det dagliga arbetet.',
        },
        {
          company: 'Karlskrona Kommun',
          role: 'Grafisk Formgivare, praktik',
          period: 'Mars 2021 - Juni 2021',
          description:
            'Jag skapade engagerande GIF:ar av Fredric Henric af Chapman för att väcka intresse hos skolelever inför ett jubileumsår.',
          focus: ['Grafisk formgivning', 'animation', 'kommunikation', 'målgruppsanpassning'],
        },
        {
          company: 'Gagnat',
          role: 'Grafisk Formgivare, praktik',
          period: 'Februari 2021 - Mars 2021',
          description:
            'Jag arbetade i team med att producera en enminutsvideo som presenterade företagets verksamhet för nya klienter.',
          focus: ['Motion design', 'video', 'teamarbete', 'visuell kommunikation'],
        },
      ] satisfies Experience[],
    },
    education: {
      kicker: 'Utbildning',
      title: 'Studier och lärande',
      items: [
        {
          school: 'EC Utbildning',
          program: 'Webbutvecklare inom .NET',
          period: 'Augusti 2023 - Juni 2025',
          description:
            'Utbildning inom webbutveckling med fokus på .NET, C#, SQL, frontend, backend, Azure, ASP.NET och CMS. Utbildningen gav mig en stabil grund inom modern system- och webbutveckling, från databaser och API:er till frontend och molnrelaterade tekniker.',
        },
        {
          school: 'Hyper Island, Karlskrona',
          program: 'Motion Designer',
          period: 'Augusti 2019 - Maj 2021',
          description:
            'Utbildning inom grafisk formgivning, motion design och praktiskt klientarbete. Fokus låg på kreativ problemlösning, grupparbete, presentation och visuell kommunikation. Den här bakgrunden hjälper mig i dag att tänka mer på användarupplevelse, struktur och hur tekniska lösningar faktiskt upplevs av människor.',
        },
      ] satisfies Education[],
    },
    labs: {
      kicker: 'Projekt',
      title: 'Projektsektionen är under uppbyggnad',
      description:
        'Jag arbetar på egna projekt inom .NET, React, automation och IoT som kommer att publiceras här framöver. Målet är att visa lösningar som kombinerar backend, frontend, databas, automation och tydlig användarnytta.',
      items: [
        {
          title: 'IoT Dashboard',
          description:
            'En dashboard för att visualisera sensordata, status och signaler i realtid.',
          technologies: ['React', 'TypeScript', '.NET API', 'SQL', 'Three.js'],
        },
        {
          title: 'Automation Toolkit',
          description:
            'Ett verktyg för att strukturera, köra och följa upp automatiserade flöden.',
          technologies: ['.NET', 'PowerShell', 'React', 'TypeScript'],
        },
        {
          title: 'Movie Explorer',
          description:
            'En film- och serieinspirerad webbapp med API-integration, sökfunktion och personlig design.',
          technologies: ['React', 'TypeScript', 'API-integration', 'CSS/SCSS'],
        },
      ] satisfies Lab[],
    },
    sayHi: {
      kicker: 'Nyfiken?',
      title: 'Säg hej till mig',
      description: '',
      curiosity: 'Nyfiken?',
      buttonLabel: 'Klicka på mig',
      loadingLabel: 'Skickar...',
      cooldownLabel: 'Någon har precis sagt hej',
      cooldownHint: 'Försök igen om en liten stund.',
      resetLabel: 'Försök igen',
      panelTitle: 'Kontroller för Say hi',
      comingSoon:
        'Funktionen är avstängd i den här miljön och kan aktiveras med VITE_SAY_HI_ENABLED.',
      canvasLabel: 'Interaktiv 3D-lampa.',
      fallback: '3D-lampan laddas.',
      successDialog: {
        title: 'Du har sagt hej till mig 👋',
        body: 'En av mina lampor hemma har precis ändrat färg till rött.',
        privacy:
          'Jag vet inte vem du är. Jag får inte ditt namn, din e-postadress eller någon profilinformation. Jag ser bara att någon har skickat ett hej.',
        technicalPrivacy:
          'Teknisk information kan behandlas tillfälligt för att skydda funktionen mot spam och missbruk, men den används inte för att identifiera dig.',
        closeLabel: 'Stäng',
      },
      errorDialog: {
        title: 'Det gick inte den här gången',
        body: 'Signalen kunde inte skickas till mitt smarta hem just nu. Försök gärna igen senare.',
        closeLabel: 'Stäng',
      },
      statuses: {
        idle: '',
        sending: 'Skickar signal till Hugos smarta hem...',
        success: 'Signalen skickades till mitt smarta hem.',
        cooldown: 'Försök igen om en liten stund.',
        unavailable: 'Signalen kunde inte skickas just nu.',
        error: 'Signalen kunde inte skickas just nu.',
      },
    },
    builtWith: {
      kicker: 'Byggd med',
      title: 'Byggd som en liten systemdemo',
      paragraphs: [
        'Den här portfolion är inte bara en statisk presentation. Den är byggd för att spegla hur jag tänker som utvecklare: struktur, interaktion, system, dataflöden och användarupplevelse.',
      ],
      sections: [
        { title: 'Frontend', items: ['React', 'TypeScript', 'SCSS'] },
        { title: 'Interactive layer', items: ['Three.js', 'sensor nodes', 'data pulses'] },
        { title: 'Backend mindset', items: ['.NET', 'API-tänk', 'systemstruktur'] },
        { title: 'Design', items: ['Nordic Forest Tech', 'motion design', 'tillgänglighet'] },
        { title: 'Performance', items: ['Responsive design', 'reduced motion', 'optimized scene'] },
      ] satisfies BuiltWithSection[],
    },
    contact: {
      kicker: 'Kontakt',
      title: 'Låt oss bygga något genomtänkt',
      paragraphs: [
        'Jag är öppen för roller inom webbutveckling, systemutveckling och backendutveckling — särskilt där teknik, kvalitet och verksamhetsnytta möts. Hör gärna av dig om du söker en utvecklare som är nyfiken, ansvarstagande och van vid att arbeta nära både teknik och människor.',
      ],
      cta: 'Kontakta mig',
      secondaryCta: 'Besök LinkedIn',
      linksLabel: 'Kontaktuppgifter',
      links: [
        {
          label: 'Email',
          value: 'hugospangberg1@gmail.com',
          href: 'mailto:hugospangberg1@gmail.com',
        },
        {
          label: 'LinkedIn',
          value: 'linkedin.com/in/hugo-spangberg',
          href: 'https://www.linkedin.com/in/hugo-spangberg',
        },
        {
          label: 'CV',
          value: 'Tillgängligt som nedladdningsbar PDF senare.',
        },
        {
          label: 'GitHub',
          value: 'Läggs till senare.',
        },
      ] satisfies ContactLink[],
    },
    footer: {
      text: 'Byggd som en lugn teknisk bas för Hugo Spångbergs portfolio.',
      backToTop: 'Till toppen',
    },
  },
  en: {
    seo: {
      title: 'Hugo Spångberg – Web Developer & Software Developer',
      description:
        'Portfolio for Hugo Spångberg, a web and software developer focused on .NET, automation, quality and real business value.',
    },
    nav: [
      { label: 'Home', href: '#start' },
      { label: 'About', href: '#om-mig' },
      { label: 'Skills', href: '#skills' },
      { label: 'Experience', href: '#erfarenhet' },
      { label: 'Projects', href: '#projekt' },
      { label: 'Say hi', href: '#say-hi' },
      { label: 'Contact', href: '#contact' },
    ] satisfies NavItem[],
    hero: {
      eyebrow: 'Portfolio',
      title: 'Hugo Spångberg',
      role: 'Web & Software Developer focused on .NET',
      subtitle:
        'I build modern web and software solutions with a focus on .NET, automation, quality and real business value. With experience from IoT, process automation, testing and design, I create solutions that are reliable, thoughtful and useful in real-world environments.',
      tagline:
        'Code, systems and problem-solving - rooted in the forest, looking toward the future.',
      actionsLabel: 'Primary links',
      actions: [
        { label: 'View experience', href: '#erfarenhet', variant: 'primary' },
        { label: 'View skills', href: '#skills', variant: 'ghost' },
        { label: 'Contact me', href: '#contact', variant: 'ghost' },
        {
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/hugo-spangberg',
          variant: 'ghost',
          external: true,
        },
      ] satisfies HeroAction[],
      availability: 'Open to roles in web development, software development and backend.',
      stack: '.NET / C# / React / Automation',
      sceneLabel: 'Interactive career map with Nordic forest, IoT and software development',
      fallbackLabel: 'Static career map with forest, IoT and experience points',
    },
    about: {
      kicker: 'About',
      title: 'Professional development grounded in practical experience.',
      paragraphs: [
        'I am a web developer and software developer focused on .NET, backend and solutions that create value in real organizations. I work best in environments where people collaborate, share ideas and build solutions that last.',
        'My experience spans IoT services and software development, automation, testing, CI workflows and business-focused problem solving. I also have a background in motion design, service and leadership, which helps me look at the whole picture: the technology, the user, the team and the value the solution actually creates.',
        'I am driven by curiosity, problem solving and the ambition to keep improving. To me, good development is not only code that works, but code and systems that are understandable, stable and built with care.',
        'This portfolio is inspired by Nordic forest, technology and subtle sci-fi - a mix that reflects both my work experience and my personal interests.',
      ],
      lookingForTitle: 'What I am looking for',
      lookingFor: [
        'I am looking for roles in web development and software development where I can work with modern technologies, long-term solutions and teams that value collaboration, quality and learning.',
        'My main focus is .NET, backend, web applications and software development, but I also enjoy working where automation, testing, frontend and business-focused problem solving meet.',
      ],
      highlights: ['.NET', 'Backend', 'Web development', 'Automation', 'Testing', 'IoT'],
    },
    skills: {
      kicker: 'Skills',
      title: 'Technical areas',
      coreFocusLabel: 'Core focus',
      coreFocus: ['.NET', 'C#', 'React', 'TypeScript', 'SQL', 'Automation', 'IoT'],
      items: [
        {
          title: 'Backend',
          description:
            'I have mainly worked with .NET and C#, and I also have experience with Java, Kotlin and Spring Boot. I enjoy building clear, stable and maintainable backend solutions focused on real needs.',
          tags: ['C#', '.NET', 'ASP.NET Core', 'Entity Framework Core', 'Java', 'Kotlin', 'Spring Boot'],
        },
        {
          title: 'Frontend',
          description:
            'I enjoy building modern interfaces with React, TypeScript and well-structured CSS. My design background makes me value clear user flows, solid structure and thoughtful visual details.',
          tags: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS/SCSS', 'Blazor'],
        },
        {
          title: 'Databases',
          description:
            'I have experience with relational databases and data modeling, with a focus on creating solutions that are understandable, efficient and easy to continue developing.',
          tags: ['SQL', 'SQL Server', 'PostgreSQL', 'DocumentDB'],
        },
        {
          title: 'Cloud & Infrastructure',
          description:
            'I have worked with cloud and infrastructure-related tools that support modern development workflows, deployment and scalable systems.',
          tags: ['Microsoft Azure', 'AWS', 'Docker'],
        },
        {
          title: 'DevOps & Tools',
          description:
            'I am used to working in team environments with version control, issue tracking and CI/CD workflows. I appreciate development processes that are clear, automated and easy to follow.',
          tags: ['Git', 'GitHub', 'Bitbucket', 'Azure DevOps', 'CI/CD', 'Jira'],
        },
        {
          title: 'Automation & Quality',
          description:
            'Automation and quality have been important parts of my developer journey. I have built automated flows, worked with test automation and improved processes through programming.',
          tags: ['RPA', 'PowerShell', 'test automation', 'quality assurance', 'GUI tools', 'process improvement'],
        },
        {
          title: 'CMS & Ways of Working',
          description:
            'I have experience with CMS platforms, agile workflows and AI-assisted development as support in modern development processes.',
          tags: ['Umbraco', 'Scrum', 'AI-assisted development'],
        },
      ] satisfies Skill[],
    },
    systemThinking: {
      kicker: 'System thinking',
      title: 'System thinking in practice',
      body:
        'I enjoy understanding how things connect — people, processes, data, systems and user flows. My experience from automation, IoT, testing and business-oriented development helps me think across the full chain: from needs and analysis to implementation, quality and long-term maintainability.',
      cards: [
        {
          title: 'Understand the need',
          description:
            'Break down the problem, understand the user and identify where technology can create real value.',
        },
        {
          title: 'Build the solution',
          description:
            'Create clear system flows, stable backend, useful interfaces and testable parts.',
        },
        {
          title: 'Improve over time',
          description:
            'Automate, quality-assure and evolve solutions so they remain useful in practice.',
        },
      ] satisfies SystemThinkingCard[],
    },
    experience: {
      kicker: 'Experience',
      title: 'Work and assignments',
      items: [
        {
          company: 'Dasa Control System',
          role: 'System Developer',
          period: 'March 2026 - May 2026',
          description:
            "At Dasa Control System, I work with development and maintenance of the company's products and IoT services, with a focus on backend in .NET and some frontend. The role involves the full development process, from analysis and implementation to testing and improving existing systems. I also contribute to improvements in architecture, ways of working and technical solutions.",
          focus: ['.NET', 'backend', 'IoT', 'frontend', 'software development', 'architecture', 'testing', 'improvement work'],
          impact: [
            'Developed and maintained IoT services with .NET.',
            'Contributed to improvements in systems, architecture and ways of working.',
          ],
        },
        {
          company: 'Södra Skogsägarna',
          role: 'Automation Developer',
          period: 'May 2025 - February 2026',
          description:
            'At Södra, I worked on automating and improving business processes through RPA and programming. The role combined technical development with close collaboration with the business. I identified needs, built solutions and quality-assured automated flows with a focus on creating value, reducing manual work and improving processes.',
          focus: ['.NET', 'PowerShell', 'RPA', 'automation', 'process improvement', 'business-focused development'],
          impact: [
            'Automated business processes with .NET, PowerShell and RPA.',
            'Worked close to the business to reduce manual work and improve flows.',
          ],
        },
        {
          company: 'Visma Enterprise',
          role: 'Technical Quality Assurer, internship',
          period: 'November 2024 - May 2025',
          description:
            'At Visma, I worked with automated tests for the HR-plus payroll system. I built test automation in C# and .NET, worked in a CI environment and quality-assured functionality and performance. I also developed a GUI for test automation tools, which gave me experience combining technical quality assurance with user-friendly tooling.',
          focus: ['C#', '.NET', 'test automation', 'CI/CD', 'quality assurance', 'GUI development'],
          impact: [
            'Built test automation in C# and .NET.',
            'Developed a GUI for test automation tooling.',
          ],
        },
        {
          company: 'Filmstaden Växjö AB',
          role: 'Deputy Cinema Manager',
          period: 'Summers: 2019-2022',
          description:
            'As Deputy Cinema Manager, I was responsible for invoicing, scheduling, premieres, service and work environment. The role gave me experience with responsibility, planning and leadership in a fast-paced environment.',
          focus: ['Leadership', 'planning', 'service', 'responsibility', 'work environment'],
          impact: [
            'Handled planning, work environment and operational responsibility.',
          ],
        },
        {
          company: 'Filmstaden Växjö AB',
          role: 'Guest Experience Supervisor',
          period: 'October 2012 - November 2024',
          description:
            'During my time at Filmstaden, I worked with staff responsibility, guest experience, recruitment, training, operations and service quality. This experience gave me a strong foundation in communication, responsibility and collaboration. I bring those experiences into my developer role, especially in teamwork, user focus and understanding business needs.',
          focus: ['Team leadership', 'service', 'recruitment', 'training', 'operations', 'guest experience'],
          impact: [
            'Built experience in team leadership, communication and user focus.',
          ],
        },
        {
          company: 'Pacson',
          role: 'Warehouse Worker',
          period: 'January 2011 - November 2012',
          description:
            'At Pacson, I worked with order picking, packing and deliveries. The role gave me experience with structure, responsibility and accuracy in daily work.',
        },
        {
          company: 'Karlskrona Municipality',
          role: 'Graphic Designer, internship',
          period: 'March 2021 - June 2021',
          description:
            'I created engaging GIFs of Fredric Henric af Chapman to spark interest among school students ahead of an anniversary year.',
          focus: ['Graphic design', 'animation', 'communication', 'audience adaptation'],
        },
        {
          company: 'Gagnat',
          role: 'Graphic Designer, internship',
          period: 'February 2021 - March 2021',
          description:
            "I worked in a team to produce a one-minute video presenting the company's business to new clients.",
          focus: ['Motion design', 'video', 'teamwork', 'visual communication'],
        },
      ] satisfies Experience[],
    },
    education: {
      kicker: 'Education',
      title: 'Studies and learning',
      items: [
        {
          school: 'EC Utbildning',
          program: 'Web Developer in .NET',
          period: 'August 2023 - June 2025',
          description:
            'Education in web development with a focus on .NET, C#, SQL, frontend, backend, Azure, ASP.NET and CMS. The program gave me a solid foundation in modern software and web development, from databases and APIs to frontend and cloud-related technologies.',
        },
        {
          school: 'Hyper Island, Karlskrona',
          program: 'Motion Designer',
          period: 'August 2019 - May 2021',
          description:
            'Education in graphic design, motion design and practical client work. The focus was creative problem solving, group work, presentation and visual communication. This background helps me today think more about user experience, structure and how technical solutions are actually experienced by people.',
        },
      ] satisfies Education[],
    },
    labs: {
      kicker: 'Projects',
      title: 'The project section is under construction',
      description:
        'I am working on personal projects in .NET, React, automation and IoT that will be published here over time. The goal is to show solutions that combine backend, frontend, database, automation and clear user value.',
      items: [
        {
          title: 'IoT Dashboard',
          description:
            'A dashboard for visualizing sensor data, statuses and signals in real time.',
          technologies: ['React', 'TypeScript', '.NET API', 'SQL', 'Three.js'],
        },
        {
          title: 'Automation Toolkit',
          description:
            'A tool for structuring, running and following up automated flows.',
          technologies: ['.NET', 'PowerShell', 'React', 'TypeScript'],
        },
        {
          title: 'Movie Explorer',
          description:
            'A movie and series-inspired web app with API integration, search and a personal design.',
          technologies: ['React', 'TypeScript', 'API integration', 'CSS/SCSS'],
        },
      ] satisfies Lab[],
    },
    sayHi: {
      kicker: 'Curious?',
      title: 'Say hi to me',
      description: '',
      curiosity: 'Curious?',
      buttonLabel: 'Click me',
      loadingLabel: 'Sending...',
      cooldownLabel: 'Someone just said hi',
      cooldownHint: 'Try again in a moment.',
      resetLabel: 'Try again',
      panelTitle: 'Say hi controls',
      comingSoon:
        'This feature is disabled in this environment and can be enabled with VITE_SAY_HI_ENABLED.',
      canvasLabel: 'Interactive 3D lamp.',
      fallback: 'The 3D lamp is loading.',
      successDialog: {
        title: 'You just said hi to me 👋',
        body: 'One of my lights at home just changed color to red.',
        privacy:
          'I do not know who you are. I do not receive your name, email address, or profile information. I only know that someone sent a hello.',
        technicalPrivacy:
          'Technical request data may be processed temporarily to protect the feature from spam and abuse, but it is not used to identify you.',
        closeLabel: 'Close',
      },
      errorDialog: {
        title: 'It did not work this time',
        body: 'The signal could not reach my smart home right now. Please try again later.',
        closeLabel: 'Close',
      },
      statuses: {
        idle: '',
        sending: "Sending a signal to Hugo's smart home...",
        success: 'The signal was sent to my smart home.',
        cooldown: 'Try again in a moment.',
        unavailable: 'The signal could not be sent right now.',
        error: 'The signal could not be sent right now.',
      },
    },
    builtWith: {
      kicker: 'Built with',
      title: 'Built as a small system demo',
      paragraphs: [
        'This portfolio is not just a static presentation. It is designed to reflect how I think as a developer: structure, interaction, systems, data flows and user experience.',
      ],
      sections: [
        { title: 'Frontend', items: ['React', 'TypeScript', 'SCSS'] },
        { title: 'Interactive layer', items: ['Three.js', 'sensor nodes', 'data pulses'] },
        { title: 'Backend mindset', items: ['.NET', 'API thinking', 'system structure'] },
        { title: 'Design', items: ['Nordic Forest Tech', 'motion design', 'accessibility'] },
        { title: 'Performance', items: ['Responsive design', 'reduced motion', 'optimized scene'] },
      ] satisfies BuiltWithSection[],
    },
    contact: {
      kicker: 'Contact',
      title: 'Let’s build something thoughtful',
      paragraphs: [
        'I am open to roles within web development, software development and backend development — especially where technology, quality and business value meet. Feel free to reach out if you are looking for a developer who is curious, responsible and used to working close to both technology and people.',
      ],
      cta: 'Contact me',
      secondaryCta: 'Visit LinkedIn',
      linksLabel: 'Contact details',
      links: [
        {
          label: 'Email',
          value: 'hugospangberg1@gmail.com',
          href: 'mailto:hugospangberg1@gmail.com',
        },
        {
          label: 'LinkedIn',
          value: 'linkedin.com/in/hugo-spangberg',
          href: 'https://www.linkedin.com/in/hugo-spangberg',
        },
        {
          label: 'CV',
          value: 'Available as a downloadable PDF later.',
        },
        {
          label: 'GitHub',
          value: 'Coming later.',
        },
      ] satisfies ContactLink[],
    },
    footer: {
      text: 'Built as a calm technical foundation for Hugo Spångbergs portfolio.',
      backToTop: 'Back to top',
    },
  },
};
