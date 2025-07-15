export const summaries = [
  {
    summary: "The agreement starts in 2025 and is valid for two years.",
    chunkIds: "chunk-001",
    legalOntology: {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: ["January 1, 2025"],
      parties: [],
    },
  },
  {
    summary: "Monthly reports must be submitted by the provider.",
    chunkIds: "chunk-002",
    legalOntology: {
      definitions: [],
      obligations: ["submit monthly reports"],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: ["provider"],
    },
  },
  {
    summary: "The client may terminate the agreement with 30 days’ notice.",
    chunkIds: "chunk-003",
    legalOntology: {
      definitions: [],
      obligations: [],
      rights: ["termination by client"],
      conditions: [],
      clauses: [],
      dates: [],
      parties: ["client"],
    },
  },
  {
    summary:
      "All information shared between the parties must remain confidential.",
    chunkIds: "chunk-004",
    legalOntology: {
      definitions: [],
      obligations: ["maintain confidentiality"],
      rights: [],
      conditions: [],
      clauses: ["confidentiality"],
      dates: [],
      parties: ["provider", "client"],
    },
  },
  {
    summary: "SLA violations lead to financial penalties.",
    chunkIds: "chunk-005",
    legalOntology: {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: ["SLA violation"],
      clauses: [],
      dates: [],
      parties: [],
    },
  },
  {
    summary:
      "Uptime is defined as the total operational availability of service.",
    chunkIds: "chunk-006",
    legalOntology: {
      definitions: ["Service Uptime"],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: [],
    },
  },
  {
    summary: "The contract terms may be renegotiated after one year.",
    chunkIds: "chunk-007",
    legalOntology: {
      definitions: [],
      obligations: [],
      rights: ["renegotiation"],
      conditions: ["after one year"],
      clauses: [],
      dates: [],
      parties: [],
    },
  },
  {
    summary:
      "Provider agrees to follow data protection standards under ISO 27001.",
    chunkIds: "chunk-008",
    legalOntology: {
      definitions: [],
      obligations: ["follow data protection standards"],
      rights: [],
      conditions: [],
      clauses: ["data security"],
      dates: [],
      parties: ["provider"],
    },
  },
];

export const chunks = [
  {
    id: "chunk-001",
    content: `Barney Stinson is a fictional character portrayed by Neil Patrick Harris and created by Carter Bays and Craig Thomas for the CBS television series How I Met Your Mother (2005–2014).

One of the show's main characters, Barney is known for his brash, manipulative and opinionated personality. He is a womanizer known for his love of expensive suits, laser tag, and Scotch whisky. The character uses many 'plays' in his 'playbook' to help him have sex with women. In later seasons, he has a few serious relationships, then marries, divorces, and has a child with an unnamed woman from a one-night stand, and then marries the same woman again (as implied in the alternate ending). Barney's catchphrases included "Suit up!", “Go for Barney”, "What up?!", "Stinson out", "Legendary", "Wait for it" (often combining the two as "legen—wait for it—dary!"), "Daddy's home", "Haaaaave you met Ted", “True story”, “That’s the dream!”, "Challenge accepted", "Just.. just... okay?", and "I only have one rule." (that one rule is constantly changing).

Critics have praised the character and credited Harris’ performance for much of the show's success. Barney is considered the show's breakout character.[3]

Development
The show's creators envisioned Barney as what Bays later described as a "large, John Belushi-type character";[4] nonetheless, Megan Branman, the casting director for How I Met Your Mother, invited Harris to audition. He assumed that he was invited solely because the two were friends and did not believe he had a chance of winning the role. Harris later said: "Since I considered myself in the long shot, I didn't care that much, and I think that allowed a freedom." His audition centered on a scene playing laser tag, and Harris attempted a dive roll, accidentally knocking over a chair and slamming into a wall in the process. CBS executives enjoyed his playing and soon offered Harris the part.[5] The character is named for a heroin dealer in the James Ellroy novel L.A. Confidential.[citation needed]

Character
Barney Stinson is one of five main characters on How I Met Your Mother. He is a manipulative, oversexed businessman in his thirties who always wears a suit, likes women with "daddy issues" and is frequently willing to offer his (sometimes hypocritical) opinion.[5] Throughout the earlier seasons, Barney is a huge womanizer, and has been described as a "high-functioning sociopath" by his best friend, Ted Mosby (Josh Radnor). Barney has a plethora of strategies and rules designed to meet women, sleep with them, and discard them.[5] Through several seasons of the show, four of the main characters are couples, as Ted began dating Robin Scherbatsky (Cobie Smulders) and Ted's roommate Marshall Eriksen (Jason Segel) becomes engaged and later married to Lily Aldrin (Alyson Hannigan). This leaves Barney the only single character, and, according to Harris, Barney is "resentful" that the other characters have paired up. Later on, in season 5, he dates Robin. They end up breaking up not long after, once they both realize they are making one another miserable.

Harris describes Barney as a man who "likes to create crazy situations and then sit back and watch it all go down."[6] He is an opportunist who manipulates any situation so that it goes his way. He is also highly competitive, and will take on "challenges" to complete outlandish tasks in order to prove his worth by often announcing "Challenge Accepted". He is proud and stubborn, and attempts to stand by his word no matter what. In "I Heart NJ", for example, he refuses to put down his fist unless someone offers him a fist bump. By the end of the episode, he has the same fist elevated in a sling after struggling to keep his fist up throughout the episode. In "Lucky Penny", when the others do not believe that he can run the New York City Marathon the next day without training, Barney immediately agrees to do so. Although he succeeds, he is unable to walk afterwards. Although he thinks of himself as worldly, Barney is sometimes extremely naive, believing many lies his mother told him well into adulthood, such as believing that Bob Barker is his father.

Barney, like Harris himself, is an illusionist. His favorite types of magic tricks involve fire, as seen in the tenth episode of the second season, "Single Stamina" and in the fourth episode of the fourth season, "Intervention". Barney uses magic tricks mostly to pick up women. His most common method of picking up women is telling them elaborate lies about himself, often using an alias. Many of his schemes for picking up women are in a book he has written called "The Playbook", which is exposed in the episode "The Playbook". He has commitment issues, as evidenced in his reluctance to put a label on his relationship with Robin and the fact that she is one of the few women he has actually dated since the show started.`,
    documentId: "doc-001",
    documentName: "Service Agreement",
  },
  {
    id: "chunk-002",
    content:
      "The provider must deliver monthly reports detailing the usage metrics and service uptime.",
    documentId: "doc-001",
    documentName: "Service Agreement",
  },
  {
    id: "chunk-003",
    content:
      "The client has the right to terminate the agreement with 30 days’ written notice.",
    documentId: "doc-001",
    documentName: "Service Agreement",
  },
  {
    id: "chunk-004",
    content:
      "All parties agree to maintain confidentiality of all shared documents and communications.",
    documentId: "doc-002",
    documentName: "Confidentiality Clause",
  },
  {
    id: "chunk-005",
    content:
      "Failure to meet SLA commitments will result in a 10% fee deduction from the monthly invoice.",
    documentId: "doc-003",
    documentName: "SLA Agreement",
  },
  {
    id: "chunk-006",
    content:
      "Definitions: 'Service Uptime' means the percentage of time the service is fully operational.",
    documentId: "doc-004",
    documentName: "Definitions",
  },
  {
    id: "chunk-007",
    content:
      "Either party may renegotiate the terms upon mutual agreement after one year.",
    documentId: "doc-001",
    documentName: "Service Agreement",
  },
  {
    id: "chunk-008",
    content:
      "The provider agrees to use best practices in data protection as per ISO 27001 standards.",
    documentId: "doc-005",
    documentName: "Data Security Policy",
  },
  {
    id: "chunk-009",
    content:
      "The provider and client are collectively referred to as 'The Parties'.",
    documentId: "doc-004",
    documentName: "Definitions",
  },
  {
    id: "chunk-010",
    content:
      "Dates and deadlines may be extended upon written agreement between the parties.",
    documentId: "doc-006",
    documentName: "Addendum",
  },
];
