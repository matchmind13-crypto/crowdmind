import type { Post } from './types';

// Kép-placeholderek (mock). A picsum seed-elt URL-ek stabil, "fotó" jellegű képek.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/506`;

export const posts: Post[] = [
  {
    id: 'p_starwars',
    category: ['Film & Sorozat', 'Star Wars'],
    title: 'Nézem a Star Wars: A klónok háborúja (4. évad) a nagymamámmal',
    type: 'appreciation',
    authorId: 'u_me',
    ago: '3 napja',
    views: 3200,
    body: [
      'Először olvasd el a sorozatokról szóló bejegyzéseimet 1, 2 és 3.',
      'A nagymamámnak fogalma sem volt, hogy a hat filmből több Star Wars is létezik, mert nem tudott a folytatás-trilógiáról. Elmagyaráztam a sorozatot, és érdeklődött. Gondoltam, mókás lenne rögzíteni néhány gondolatát és megfigyelését.',
      'Szóval itt vagyunk, egy hetvenéves, először néző gondolatai. Ja, és a megjelenési sorrendben nézzük, nem a kronológiai sorrendben.',
    ],
    media: [
      img('sw1'), img('sw2'), img('sw3'), img('sw4'),
      img('sw5'), img('sw6'), img('sw7'), img('sw8'),
    ],
    commentsCount: 312,
    comments: [
      {
        id: 'c1',
        userId: 'u_jedi',
        ago: '3 napja',
        body: 'Imádom az ilyen posztokat! A nagymamád reakciói aranyat érnek. Melyik rész volt a kedvence eddig?',
        votes: 256,
        badge: 'expert',
      },
      {
        id: 'c2',
        userId: 'u_force',
        ago: '3 napja',
        body: 'Én is most nézem újra a sorozatot. A 4. évad az egyik legjobb szerintem!',
        votes: 128,
        badge: 'experience',
      },
      {
        id: 'c3',
        userId: 'u_tech',
        ago: '2 napja',
        body: 'A megjelenési sorrend vs kronológiai sorrend örök vita. Első nézésnél szerintem is a megjelenési a jobb.',
        votes: 74,
      },
    ],
    ai: {
      short:
        'A közösség nagyon pozitívan fogadta a posztot. Sokan értékelik a nagymama őszinte reakcióit, különösen azt, hogy először nézi a sorozatot.',
      detailed:
        'A hozzászólók többsége megható és humoros élményként írja le a posztot. A legtöbben kiemelik, hogy egy új néző friss nézőpontja értékes, és sokan megosztják saját "első nézés" emléküket. Kisebb vita bontakozott ki a nézési sorrendről.',
      sentiment: { positive: 65, neutral: 20, negative: 15 },
      themes: [
        'Nagymama reakciói',
        'Első nézés élménye',
        'A 4. évad minősége',
        'Megjelenési sorrend vs kronológia',
      ],
      argumentsFor: [
        'Érdekes nézőpont egy új nézőtől',
        'Humoros és megható pillanatok',
        'A 4. évad kiemelkedő történetei',
      ],
      keywords: ['nagymama', 'első nézés', '4. évad', 'sorrend', 'nosztalgia'],
      consensus: 78,
      updatedAgo: '10 perccel ezelőtt',
    },
    snapshot: { for: 65, against: 15, uncertain: 20, votes: 1840 },
  },
  {
    id: 'p_porsche',
    category: ['Autók', 'Porsche'],
    title: '2024 Porsche 911 GT3 RS vagy 2025 911 Turbo S?',
    type: 'question',
    authorId: 'u_speed',
    ago: '5 órája',
    views: 1800,
    body: [
      'Nehéz döntés előtt állok, segítséget szeretnék kérni a közösségtől.',
      'Pályanapokra használnám, de utcán is szeretném élvezni.',
      'Nektek melyik lenne a választásotok és miért?',
    ],
    media: [],
    commentsCount: 156,
    comments: [
      {
        id: 'c4',
        userId: 'u_owner',
        ago: '4 órája',
        body: 'GT3 RS-em van, pályán verhetetlen élmény, de utcán kompromisszum. Ha napi használat is cél, a Turbo S sokoldalúbb.',
        votes: 143,
        badge: 'owner',
      },
      {
        id: 'c5',
        userId: 'u_speed',
        ago: '3 órája',
        body: 'Köszi! Pont ez a dilemmám. Mennyire zavaró a GT3 RS az utcán hosszútávon?',
        votes: 22,
      },
    ],
    ai: {
      short:
        'A közösség megosztott: a pályás fókuszúak a GT3 RS-t, a hétköznapi használatot is szem előtt tartók a Turbo S-t ajánlják.',
      detailed:
        'A legtöbb hozzászóló a felhasználási cél alapján dönt. A tulajdonosok szerint a GT3 RS pályán kiemelkedő, de utcán kompromisszumos; a Turbo S sokoldalúbb és komfortosabb a mindennapokban.',
      sentiment: { positive: 48, neutral: 34, negative: 18 },
      themes: ['Pálya vs utca', 'Komfort', 'Értéktartás', 'Vezethetőség'],
      argumentsFor: [
        'GT3 RS: tisztább pályaélmény',
        'Turbo S: hétköznapi sokoldalúság',
        'Turbo S: jobb komfort hosszútávon',
      ],
      keywords: ['pálya', 'utca', 'komfort', 'sokoldalú', 'élmény'],
      consensus: 54,
      updatedAgo: '22 perccel ezelőtt',
    },
    snapshot: { for: 48, against: 18, uncertain: 34, votes: 690 },
  },
  {
    id: 'p_iphone',
    category: ['Technológia', 'Apple'],
    title: 'iPhone 16 megéri az upgrade-et?',
    type: 'question',
    authorId: 'u_tech',
    ago: '1 napja',
    views: 2100,
    body: [
      'Jelenleg iPhone 13 Pro-m van, tökéletesen működik. Szerintetek megéri váltani a 16-ra? Miben jobb, mint az előző széria?',
    ],
    media: [],
    commentsCount: 89,
    comments: [
      {
        id: 'c6',
        userId: 'u_tech',
        ago: '1 napja',
        body: '13 Pro-ról szerintem még nem sürgős. A kamera és a chip jobb, de a napi élmény hasonló.',
        votes: 61,
        badge: 'trusted',
      },
    ],
    ai: {
      short:
        'A közösség szerint 13 Pro-ról az upgrade nem sürgős: a fejlődés érezhető, de nem forradalmi a mindennapokban.',
      detailed:
        'A hozzászólók többsége szerint a 16 érezhetően gyorsabb és jobb kamerával rendelkezik, de egy jól működő 13 Pro-ról a váltás inkább "jó, de nem kötelező". Sokan a hosszabb szoftvertámogatást emelik ki előnyként.',
      sentiment: { positive: 52, neutral: 33, negative: 15 },
      themes: ['Kamera', 'Teljesítmény', 'Ár/érték', 'Szoftvertámogatás'],
      argumentsFor: [
        'Jobb kamera és chip',
        'Hosszabb szoftvertámogatás',
        'Jobb energiagazdálkodás',
      ],
      keywords: ['kamera', 'chip', 'akku', 'ár', 'támogatás'],
      consensus: 61,
      updatedAgo: '1 órával ezelőtt',
    },
    snapshot: { for: 52, against: 15, uncertain: 33, votes: 430 },
  },
];
