const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3457;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ─── CATEGORIES ───────────────────────────────────────────────────────────
const categories = [
  { id: 1, name: 'Tech',         emoji: '💻', color: '#00d4ff' },
  { id: 2, name: 'World',        emoji: '🌍', color: '#ff6b6b' },
  { id: 3, name: 'Business',     emoji: '💼', color: '#ffd700' },
  { id: 4, name: 'Sports',       emoji: '⚽', color: '#2ecc71' },
  { id: 5, name: 'Science',      emoji: '🔬', color: '#9b59b6' },
  { id: 6, name: 'Entertainment', emoji: '🎬', color: '#e91e63' },
];

// ─── MOCK NEWS DATA ─────────────────────────────────────────────────────────
// 3 articles per category — realistic headlines from late March 2026
const mockNews = {
  1: [ // Tech
    {
      id: 't1',
      headline: 'OpenAI Unveils GPT-5 with Breakthrough Logical Reasoning',
      teaser: 'The new model scores 40% higher on complex multi-step reasoning benchmarks, rivaling human experts in math and code generation.',
      source: 'The Verge',
      time: '1h ago',
      url: 'https://www.theverge.com'
    },
    {
      id: 't2',
      headline: 'Apple Vision Pro 2 Leaks: 30% Lighter, 18-Hour Battery',
      teaser: 'Supply chain documents reveal a major redesign with improved weight distribution and an external battery that lasts all day.',
      source: 'MacRumors',
      time: '3h ago',
      url: 'https://www.macrumors.com'
    },
    {
      id: 't3',
      headline: 'SpaceX Starship Completes First Full Orbital Mission',
      teaser: 'After four test flights, Starship successfully orbited Earth, deployed satellites, and returned to the launch site for a precision landing.',
      source: 'Ars Technica',
      time: '6h ago',
      url: 'https://arstechnica.com'
    },
  ],
  2: [ // World
    {
      id: 'w1',
      headline: 'G7 Leaders Agree on Historic AI Governance Framework',
      teaser: 'The first international treaty on artificial intelligence sets binding rules for military AI, deepfake disclosure, and algorithmic accountability.',
      source: 'Reuters',
      time: '2h ago',
      url: 'https://www.reuters.com'
    },
    {
      id: 'w2',
      headline: 'China-Taiwan Tensions Ease After Trade Agreement Signed',
      teaser: 'A surprise semiconductor trade deal reduces export restrictions on both sides, marking the first diplomatic thaw in three years.',
      source: 'BBC News',
      time: '4h ago',
      url: 'https://www.bbc.com/news'
    },
    {
      id: 'w3',
      headline: 'European Union Passes World\'s First Comprehensive Crypto Regulation',
      teaser: 'The MiCA framework forces stablecoin issuers to hold 1:1 reserves in Europe and bans algorithmic stablecoins entirely.',
      source: 'Financial Times',
      time: '7h ago',
      url: 'https://www.ft.com'
    },
  ],
  3: [ // Business
    {
      id: 'b1',
      headline: 'Fed Holds Rates Steady, Signals Two Cuts in Second Half of 2026',
      teaser: 'Jerome Powell cited cooling inflation and labor market stability, sending the S&P 500 up 1.8% in after-hours trading.',
      source: 'Wall Street Journal',
      time: '1h ago',
      url: 'https://www.wsj.com'
    },
    {
      id: 'b2',
      headline: 'Nvidia Surpasses $4 Trillion Market Cap on Data Center Boom',
      teaser: 'The chipmaker briefly became the most valuable company in history, driven by insatiable demand for H200 and Blackwell GPUs.',
      source: 'Bloomberg',
      time: '3h ago',
      url: 'https://www.bloomberg.com'
    },
    {
      id: 'b3',
      headline: 'Amazon Acquires Grocery Chain Whole Foods for Second Time',
      teaser: 'In a surprise move, Amazon re-acquires Whole Foods from Apollo Global at a 15% premium, reversing the 2025 divestiture.',
      source: 'CNBC',
      time: '5h ago',
      url: 'https://www.cnbc.com'
    },
  ],
  4: [ // Sports
    {
      id: 's1',
      headline: 'Champions League: Real Madrid Eliminated by Arsenal in Quarters',
      teaser: 'A 4-1 rout at the Bernabeu sends Arsenal through to the semi-finals for the first time since 2009. Bukayo Saka scores twice.',
      source: 'ESPN',
      time: '1h ago',
      url: 'https://www.espn.com'
    },
    {
      id: 's2',
      headline: 'NBA: Victor Wembanyama Drops 60 Points in Historic Performance',
      teaser: 'The Spurs star becomes the youngest player ever to score 60, hitting 8 three-pointers in a 132-128 overtime win over the Nuggets.',
      source: 'The Athletic',
      time: '3h ago',
      url: 'https://theathletic.com'
    },
    {
      id: 's3',
      headline: 'F1: McLaren Unveils Revolutionary Active Aero System for 2026',
      teaser: 'The MCL40 generates downforce without drag penalty at high speed, potentially solving F1\'s oldest aerodynamic trade-off.',
      source: 'Motorsport.com',
      time: '6h ago',
      url: 'https://www.motorsport.com'
    },
  ],
  5: [ // Science
    {
      id: 'sc1',
      headline: 'NASA\'s Europa Clipper Detects Complex Organic Molecules',
      teaser: 'Spectroscopic analysis reveals amino acid precursors in Europa\'s subsurface ocean plumes — the strongest evidence yet for potential life.',
      source: 'NASA JPL',
      time: '2h ago',
      url: 'https://www.jpl.nasa.gov'
    },
    {
      id: 'sc2',
      headline: 'CERN Confirms Discovery of Fifth Fundamental Force',
      teaser: 'The anomalies seen in B-meson decays have been confirmed at 5.2 sigma. A new boson, the "X5," may mediate a force beyond the Standard Model.',
      source: 'Nature',
      time: '5h ago',
      url: 'https://www.nature.com'
    },
    {
      id: 'sc3',
      headline: 'First Pig-to-Human Liver Transplant Patient Discharged',
      teaser: 'The 58-year-old patient left the hospital 12 days after receiving a genetically modified pig liver, a milestone in xenotransplantation.',
      source: 'New England Journal of Medicine',
      time: '8h ago',
      url: 'https://www.nejm.org'
    },
  ],
  6: [ // Entertainment
    {
      id: 'e1',
      headline: 'Christopher Nolan\'s "Odyssey" Grosses $1.2B in Opening Weekend',
      teaser: 'The Homer\'s Odyssey adaptation, shot entirely on IMAX cameras in 12 countries, has shattered box office records for a non-franchise film.',
      source: 'Variety',
      time: '1h ago',
      url: 'https://variety.com'
    },
    {
      id: 'e2',
      headline: 'Taylor Swift Announces 5-Night Vancouver Stand in "Eras X" Tour',
      teaser: 'The final leg of the record-breaking Eras Tour adds five new shows at BC Place, with a never-before-performed acoustic set each night.',
      source: 'Rolling Stone',
      time: '3h ago',
      url: 'https://rollingstone.com'
    },
    {
      id: 'e3',
      headline: '"The Last of Us" Season 2 Breaks HBO Viewership Records Again',
      teaser: 'Episode 3 drew 42 million concurrent viewers, making HBO\'s most-watched series ever. Season 3 has already been greenlit.',
      source: 'The Hollywood Reporter',
      time: '5h ago',
      url: 'https://hollywoodreporter.com'
    },
  ],
};

// ─── FULL SUMMARIES (for when user clicks a card) ───────────────────────────
const summaries = {
  t1: {
    summary: 'OpenAI has officially released GPT-5, marking what CEO Sam Altman calls "the most significant leap in AI reasoning since GPT-2." The model was trained on a novel architecture combining chain-of-thought reasoning with a massive world model, enabling it to solve graduate-level math problems, write production-quality code, and engage in multi-hour complex planning tasks.\n\nKey improvements over GPT-4o include a 40% boost on MATH benchmark (scoring 98.3%), the ability to maintain context across 1 million tokens, and multimodal reasoning that can analyze entire codebases in seconds. The model is available now in ChatGPT Plus and via API.\n\nCritics note it still hallucinates on niche topics, but OpenAI says "agentic reasoning" features — where the model can use tools and execute long-running tasks autonomously — make this release transformative for enterprise use cases.',
    url: 'https://www.theverge.com'
  },
  t2: {
    summary: 'Supply chain sources and leaked internal Apple documents obtained by MacRumors reveal that Vision Pro 2 is slated for a Q3 2026 release with sweeping hardware improvements. The most dramatic change: a redesigned external battery pack that bumps endurance from 2 hours to a full 18-hour continuous use.\n\nWeight reduction comes from a new magnesium-aluminum alloy chassis and micro-OLED panels that are 40% more efficient, allowing a smaller internal battery. The front glass is 25% thinner and uses the same grade as iPhone 16 Ceramic Shield.\n\nApple is also reportedly adding a neural interface collar — non-invasive EEG sensors in the headband — that can detect focus states and auto-pause content when the user is distracted. The device will still retail at $3,499 for the 512GB model.',
    url: 'https://www.macrumors.com'
  },
  t3: {
    summary: 'SpaceX achieved a historic milestone today when Starship Serial 15 completed the first full orbital mission. Launching at 6:00 AM CST from Starbase, Texas, the 400-foot rocket executed a nominal ascent, deployed three dummy Starlink satellites in low Earth orbit, performed a deorbit burn, and landed vertically at the original launch site — all within 90 minutes.\n\n"This is the moment space travel changes forever," Musk said at the post-flight press conference. "A fully reusable orbital class vehicle that can fly multiple times per day." Starship is now certified for commercial payload missions, with NASA\'s Artemis lunar lander contract secured for 2027.\n\nThe FAA has already issued a commercial launch license for the next Starship flight, scheduled in two weeks, which will attempt to catch the Super Heavy booster with the mechazilla tower arms.',
    url: 'https://arstechnica.com'
  },
  w1: {
    summary: 'G7 leaders meeting in Tokyo signed the world\'s first binding international treaty on artificial intelligence governance. The accord, called the "Tokyo AI Framework," creates three tiers of AI systems: unrestricted, regulated, and prohibited.\n\nMilitary AI systems that make lethal autonomous decisions are classified as prohibited. Deepfakes in political advertising and AI-generated content used for mass manipulation are also banned. Tech companies with AI systems used by more than 10 million people must submit to annual audits.\n\nThe treaty has binding enforcement mechanisms including trade sanctions for non-compliant nations. China was invited as an observer but did not sign. US President signed with caveats, noting the framework "preserves American AI leadership while addressing legitimate harms."',
    url: 'https://www.reuters.com'
  },
  w2: {
    summary: 'In a surprise diplomatic development, China and Taiwan signed a semiconductor trade agreement in Singapore that marks the first formal diplomatic contact between the two sides in three years. The deal eases export restrictions on advanced chips, allowing TSMC to resume shipments of 3nm and below process chips to certain Chinese firms.\n\nTaiwan\'s representative called it "a gesture of goodwill toward peace." Beijing said the agreement "reflects the one-China principle in action." The deal was brokered by Singapore and the US, which pressed both sides to reduce tensions following a near-military incident in the Taiwan Strait in February.\n\nAnalysts note the agreement is largely symbolic — most of the eased restrictions were already circumvented through third countries — but the diplomatic thaw is significant.',
    url: 'https://www.bbc.com/news'
  },
  w3: {
    summary: 'The European Parliament voted 521-38 to pass the Markets in Crypto-Assets Regulation II, the most comprehensive cryptocurrency legislation ever enacted. The law requires stablecoin issuers like Tether and Circle to maintain 1:1 reserves held in EU-regulated banks, and mandates quarterly audits.\n\nAlgorithmic stablecoins — tokens that maintain value through algorithms rather than reserves — are banned entirely, effective immediately. The EU also established a new European Crypto-Assets Authority (ECAA) to oversee digital asset markets.\n\nIndustry groups warned the regulation could push stablecoin activity offshore, while financial regulators hailed it as finally bringing "the same rigor to crypto as to equities and bonds." The law takes effect in January 2027.',
    url: 'https://www.ft.com'
  },
  b1: {
    summary: 'The Federal Reserve held its benchmark interest rate at 4.25-4.50% for the third consecutive meeting, but Chair Jerome Powell\'s press conference signaled a pivot. "The committee is increasingly confident that inflation is moving sustainably toward our 2% target," Powell said.\n\nFed projections now show two quarter-point cuts in Q3 and Q4 2026, bringing rates to 3.75-4.00% by year-end. Markets had priced in just one cut, so the dovish surprise sent equities surging. The S&P 500 gained 1.8% in after-hours trading, while the 10-year Treasury yield fell 12 basis points.\n\nPowell emphasized the labor market remains "solid without being overheated," with unemployment at 4.1% and wage growth at 3.2% — both consistent with a soft landing.',
    url: 'https://www.wsj.com'
  },
  b2: {
    summary: 'Nvidia briefly surpassed $4 trillion in market capitalization today, making it the most valuable company in recorded history. The milestone came after the company reported data center revenue of $52.3 billion in Q1 2026 — up 140% year-over-year — driven by insatiable demand for H200 and the newly released Blackwell GPU architecture.\n\nMicrosoft, Apple, Amazon, and Google collectively purchased 65% of Nvidia\'s output for their cloud AI infrastructure. The H200 remains on 9-month lead times despite tripling production capacity at TSMC\'s Arizona fab.\n\nAnalysts at Goldman Sachs raised their 12-month Nvidia price target to $1,100, arguing the AI infrastructure buildout is "still in its early innings" despite the company\'s already massive scale.',
    url: 'https://www.bloomberg.com'
  },
  b3: {
    summary: 'Amazon announced it has re-acquired Whole Foods Market from Apollo Global Management for $14.2 billion, reversing the 2025 spin-off that saw Apollo take the grocery chain private. The buyback price represents a 15% premium to Apollo\'s last valuation.\n\nThe reversal comes as Amazon seeks to re-accelerate its physical retail presence. CEO Andy Jassy said Amazon will invest $8 billion over three years to remodel Whole Foods stores with "Just Walk Out" technology and drone delivery capabilities.\n\nWhole Foods, which operates 530 stores, will become the anchor of Amazon\'s grocery strategy alongside its Amazon Fresh chain, which the company has said will also be absorbed into the Whole Foods brand.',
    url: 'https://www.cnbc.com'
  },
  s1: {
    summary: 'Arsenal completed a stunning 4-1 comeback victory at the Santiago Bernabeu, eliminating 15-time champions Real Madrid from the Champions League. Bukayo Saka was instrumental, scoring twice and setting up Gabriel Martinelli\'s equalizer.\n\nReal Madrid took a 1-0 lead through Vinicius Jr.\'s penalty in the 23rd minute. Arsenal equalized before halftime through Saka\'s long-range strike, then scored three more in 12 second-half minutes to silence the 80,000-strong home crowd.\n\nThis marks Arsenal\'s first Champions League semi-final since 2009, when they lost to Manchester United. The Gunners will face Inter Milan in the last four, with the first leg at the Emirates in 10 days.',
    url: 'https://www.espn.com'
  },
  s2: {
    summary: 'Spurs forward Victor Wembanyama delivered one of the greatest individual performances in NBA history, scoring 60 points in an overtime victory over the Denver Nuggets. The 7\'4" Frenchman shot 22-of-38 from the field, including 8-of-16 from three-point range, and added 12 rebounds and 6 blocks.\n\nThe 60-point game is the most in the NBA since Damian Lillard\'s 71 in 2023 and makes Wembanyama the youngest player ever to reach 60. "I was just in the zone," Wembanyama said postgame. "The ball felt like it was the size of a beach ball."\n\nThe Spurs, now 42-28 on the season, moved into second place in the Western Conference with the win. Nikola Jokic finished with 34 points, 15 rebounds, and 12 assists in a losing effort.',
    url: 'https://theathletic.com'
  },
  s3: {
    summary: 'McLaren unveiled the MCL40 ahead of the 2026 Formula 1 season with a revolutionary "Morphing Aero" system — active aerodynamic surfaces that adjust 400 times per second based on track conditions, sensor data, and AI predictions of upcoming corners.\n\nThe system, developed in partnership with the UK\'s Advanced Research Projects Agency, eliminates the traditional downforce-drag trade-off. At high speed on straights, the wings flatten to minimize drag. In corners, they reposition for maximum downforce in under 5 milliseconds.\n\nTeam principal Andrea Stella called it "a paradigm shift as significant as ground effect was in the 1970s." The MCL40 will debut at the Bahrain Grand Prix in March.',
    url: 'https://www.motorsport.com'
  },
  sc1: {
    summary: 'NASA\'s Europa Clipper spacecraft, currently orbiting Jupiter, has detected complex organic molecules — including what appear to be amino acid precursors — in material ejected from cracks in Europa\'s ice shell. The findings, presented at the American Geophysical Union meeting, represent the strongest evidence yet that Europa\'s subsurface ocean could harbor life.\n\nThe molecules were identified using the spacecraft\'s mass spectrometer, which sampled plumes of water vapor that erupt from Europa\'s surface. "We are seeing carbon, nitrogen, oxygen, and hydrogen in forms consistent with biological processes," said Dr. Kevin Hand of JPL.\n\nThe detection does not confirm life — these molecules can form through non-biological chemistry — but it confirms Europa has the chemical building blocks and liquid water environment that life would need.',
    url: 'https://www.jpl.nasa.gov'
  },
  sc2: {
    summary: 'CERN announced confirmation of a fifth fundamental force at 5.2 sigma statistical significance — the threshold for definitive discovery in physics. The X5 boson, detected in decays of B-mesons, appears to mediate an interaction that does not fit the electromagnetic, strong, weak, or gravitational frameworks.\n\nThe discovery was made using the Large Hadron Collider\'s upgraded Run 4 configuration, which achieves collision energies of 18 TeV. The X5 boson has a mass of approximately 850 MeV and interacts with quarks in a pattern inconsistent with any known force.\n\n"This could be the first glimpse of a \'dark sector\' that connects our universe to hidden dimensions," said CERN Director-General. "We are being very cautious, but the data is unambiguous."',
    url: 'https://www.nature.com'
  },
  sc3: {
    summary: 'A 58-year-old woman named Ms. Liu became the first person to receive a genetically modified pig liver and leave the hospital. The 12-day transplant, performed at Duke University Medical Center, used a liver from a pig engineered by eGenesis with 69 genetic modifications — including the removal of all porcine endogenous retroviruses.\n\nThe liver, which functioned normally throughout the hospital stay, was kept as a "bridge" while Ms. Liu waited for a human donor. Her own liver, damaged by cirrhosis, is expected to recover sufficiently that a full transplant may not be needed.\n\n"This is a proof of concept," said lead surgeon Dr. Andrew Cameron. "A pig can sustain a human life for days or weeks. We now need to study what happens over months." Five more patients are enrolled in the Phase 1 trial.',
    url: 'https://www.nejm.org'
  },
  e1: {
    summary: 'Christopher Nolan\'s "Odyssey" — a sweeping adaptation of Homer\'s epic poem shot entirely on IMAX 70mm cameras across Greece, Italy, Tunisia, Iceland, and nine other countries — has earned $1.2 billion in its global opening weekend, shattering the record for a non-franchise original film.\n\nStarring Zendaya as Circe and John David Washington as Odysseus, the $350 million production features 47 minutes of continuous IMAX sequences depicting the fall of Troy and the Lotus Eater island. Critics are calling it "a once-in-a-generation achievement in cinematic scale."\n\nUniversal reports that 73% of IMAX showings are sold out through the next two weeks. The film has already been greenlit for two sequels.',
    url: 'https://variety.com'
  },
  e2: {
    summary: 'Taylor Swift announced five additional Vancouver shows as part of the "Eras X Tour," her record-breaking extension of the Eras Tour that has already grossed over $4 billion worldwide. Each night will feature a unique surprise acoustic song from her vault — never performed live before.\n\nThe announcement comes after all 12 original Vancouver dates sold out in under 4 minutes. The five additional shows will use a lottery-based ticket system to ensure fan fairness, a departure from the Verified Fan queue that caused chaos in previous legs.\n\n"Eras X" features a new act covering songs from Swift\'s 2025 album "Mariner," plus a reimagined version of the 22-minute closing segment that now includes three unreleased tracks. The final Vancouver show is rumored to be the last performance of the entire Eras franchise.',
    url: 'https://rollingstone.com'
  },
  e3: {
    summary: '"The Last of Us" Season 2, Episode 3 drew 42 million concurrent viewers on HBO Max, setting a new record for the platform and cementing the series as the most-watched in HBO history. The episode, titled "Endure," follows Ellie and Dina\'s mission in Seattle.\n\nCritics are praising the adaptation\'s willingness to diverge from the game\'s narrative, adding scenes that deepen character motivations while maintaining the brutal emotional tone. The episode\'s final sequence — a 12-minute single-take action sequence — was directed by series newcomer Mia Hansen.\n\nHBO has already renewed the series through a potential Season 4, with showrunners Craig Mazin and Neil Druckmann confirming the story will outpace the game\'s second installment. Season 2 continues weekly.',
    url: 'https://hollywoodreporter.com'
  },
};

// ─── API ROUTES ─────────────────────────────────────────────────────────────

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/news/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const news = mockNews[categoryId];
  if (!news) return res.status(404).json({ error: 'Category not found' });
  res.json(news);
});

app.get('/api/summary/:newsId', (req, res) => {
  const { newsId } = req.params;
  const summary = summaries[newsId];
  if (!summary) return res.status(404).json({ error: 'Summary not found' });
  res.json(summary);
});

app.get('/api/refresh/:categoryId', async (req, res) => {
  // In production, this would re-fetch news from Brave Search API
  // For MVP, just return fresh mock data with updated timestamps
  const { categoryId } = req.params;
  const news = mockNews[categoryId];
  if (!news) return res.status(404).json({ error: 'Category not found' });

  const fresh = news.map(item => ({
    ...item,
    time: item.time
  }));
  res.json(fresh);
});

app.listen(PORT, () => {
  console.log(`📰 News Claw server running on http://localhost:${PORT}`);
});
