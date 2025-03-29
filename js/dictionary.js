// Enhanced word list for word games
const wordList = [
    // Your existing words
    "ACE", "ADD", "ADO", "ADS", "BAD", "BED", "BEE", "BET", "BOB", "BOD",
    "CAB", "CAD", "CAT", "COD", "COB", "DAD", "DEB", "DOE", "DOT",
    "EAT", "ERA", "ETA", "ICE", "ITS", "OAT", "ODD", "ODE", "ORE",
    "RAT", "RED", "ROB", "ROD", "ROT", "SAD", "SAT", "SAUCE", "SEA", "SEE",
    "SET", "SOB", "SOD", "SOT", "SUB", "SUE", "TAB", "TAD", "TAE", "TEA",
    "TED", "TEE", "TOE", "TOO", "USE", "USED", "ZED", "ZOO", "BEAD", "BEAR",
    "BEET", "BOAT", "BODE", "BRAT", "BRED", "CASE", "CAST", "DATE", "DEBT",
    "DOER", "DOSE", "DUET", "EAST", "RATE", "READ", "REST", "ROAD", "ROBE",
    "ROSE", "ROTE", "RUDE", "RUSE", "RUST", "SATE", "SEAT", "SEED", "SOAR",
    "STAR", "STET", "STUD", "SUET", "TACO", "TEAR", "TEST", "TRUE", "TUBE",
    "USER", "ZERO", "ZEST", "BEAST", "BOARD", "BOAST", "BREAD", "CARET",
    "CASTE", "COBRA", "COAST", "DREAM", "ROAST", "ROBOT", "ROUTE", "SABER",
    "SAUTE", "SCOUT", "SCARE", "SOBER", "STORE", "TRACE", "TRADE", "TROVE",
    
    // Additional 3-letter words
    "AAH", "AAL", "ABA", "ABE", "ABO", "ABS", "ABY", "ACH", "ACT", "ADZ", 
    "AFF", "AFT", "AGA", "AGE", "AGO", "AHA", "AHI", "AID", "AIL", "AIM", 
    "AIN", "AIR", "AIS", "AIT", "ALA", "ALB", "ALE", "ALL", "ALP", "ALS", 
    "ALT", "AMA", "AMI", "AMP", "AMU", "ANA", "AND", "ANE", "ANI", "ANT", 
    "ANY", "APE", "APO", "APP", "APT", "ARB", "ARC", "ARD", "ARE", "ARF", 
    "ARK", "ARM", "ARS", "ART", "ASH", "ASK", "ASP", "ASS", "ATE", "ATT", 
    "AUK", "AVA", "AVE", "AVO", "AWA", "AWE", "AWL", "AWN", "AXE", "AYE", 
    "AYS", "AZO", "BAA", "BAG", "BAH", "BAL", "BAM", "BAN", "BAP", "BAR", 
    "BAS", "BAT", "BAY", "BEG", "BEL", "BEN", "BES", "BEY", "BIB", "BID", 
    "BIG", "BIN", "BIO", "BIS", "BIT", "BIZ", "BOA", "BOG", "BON", "BOO", 
    "BOP", "BOS", "BOT", "BOW", "BOX", "BOY", "BRA", "BRO", "BRR", "BUB", 
    "BUD", "BUG", "BUM", "BUN", "BUR", "BUS", "BUT", "BUY", "BYE", "BYS",
    
    // 4-letter words
    "ABLE", "ABLY", "ABUT", "ACED", "ACES", "ACHE", "ACHY", "ACID", "ACME", 
    "ACNE", "ACRE", "ACTS", "ADAM", "ADDS", "ADIT", "ADOS", "ADZE", "AEON", 
    "AERY", "AFAR", "AFRO", "AGAR", "AGED", "AGES", "AGOG", "AGUE", "AHEM", 
    "AHOY", "AIDE", "AIDS", "AILS", "AIMS", "AINS", "AIRN", "AIRS", "AIRY", 
    "AITS", "AJAR", "AJEE", "AKEE", "AKIN", "ALAE", "ALAN", "ALAR", "ALAS", 
    "ALBA", "ALBS", "ALEC", "ALEE", "ALES", "ALFA", "ALGA", "ALIF", "ALIT", 
    "ALKY", "ALLS", "ALLY", "ALMA", "ALME", "ALMS", "ALOE", "ALOW", "ALPS", 
    "ALSO", "ALTO", "ALTS", "ALUM", "AMAH", "AMAS", "AMBO", "AMEN", "AMID", 
    "AMIE", "AMIN", "AMIR", "AMIS", "AMMO", "AMOK", "AMPS", "AMUS", "AMYL",
    
    // 5-letter words
    "ABACK", "ABAFT", "ABASE", "ABASH", "ABATE", "ABBEY", "ABBOT", "ABEAM", 
    "ABHOR", "ABIDE", "ABLED", "ABLER", "ABODE", "ABORT", "ABOUT", "ABOVE", 
    "ABUSE", "ABUTS", "ABUZZ", "ABYSS", "ACCTS", "ACHED", "ACHES", "ACHOO", 
    "ACIDS", "ACIDY", "ACING", "ACMES", "ACNED", "ACNES", "ACORN", "ACRES", 
    "ACRID", "ACTED", "ACTOR", "ACUTE", "ADAGE", "ADAPT", "ADDED", "ADDER", 
    "ADDLE", "ADEPT", "ADIEU", "ADIOS", "ADITS", "ADMAN", "ADMIT", "ADMIX", 
    "ADOBE", "ADOBO", "ADOPT", "ADORE", "ADORN", "ADULT", "ADZES", "AEGIS", 
    "AEONS", "AERIE", "AFFIX", "AFIRE", "AFOOT", "AFORE", "AFOUL", "AFROS", 
    "AFTER", "AGAIN", "AGAPE", "AGATE", "AGAVE", "AGENT", "AGERS", "AGILE", 
    "AGING", "AGISM", "AGIST", "AGLET", "AGLOW", "AGONY", "AGORA", "AGREE", 
    "AHEAD", "AHEMS", "AHOYS", "AIDED", "AIDER",
    
    // Common 6-letter words
    "ABACUS", "ABASED", "ABASES", "ABATED", "ABATES", "ABBESS", "ABBEYS", 
    "ABBOTS", "ABDUCT", "ABHORS", "ABIDED", "ABIDES", "ABJECT", "ABJURE", 
    "ABLATE", "ABLAUT", "ABLAZE", "ABLECY", "ABLINS", "ABODES", "ABOHMS", 
    "ABOLLA", "ABOMAS", "ABORAL", "ABORTS", "ABOUND", "ABOUTS", "ABOVES", 
    "ABRADE", "ABROAD", "ABRUPT", "ABSEIL", "ABSENT", "ABSORB", "ABSURD", 
    "ABULIA", "ABULIC", "ABUSED", "ABUSER", "ABUSES", "ABVOLT", "ABWATT", 
    "ACACIA", "ACAJOU", "ACARID", "ACCEDE", "ACCENT", "ACCEPT", "ACCESS",
    
    // Common 7-letter words
    "ABANDON", "ABASERS", "ABASHED", "ABASHES", "ABASING", "ABATERS", 
    "ABATING", "ABATORS", "ABATTIS", "ABATURE", "ABBOTCY", "ABDOMEN", 
    "ABDUCED", "ABDUCES", "ABDUCTS", "ABELIAN", "ABELIAS", "ABETTAL", 
    "ABETTED", "ABETTER", "ABETTOR", "ABEYANT", "ABFARAD", "ABHENRY", 
    "ABIDERS", "ABIDING", "ABILITY", "ABIOSES", "ABIOSIS", "ABIOTIC", 
    "ABJECTS", "ABJOINT", "ABJURED", "ABJURER", "ABJURES", "ABLATED", 
    "ABLATES", "ABLAUTS", "ABLEGAL", "ABLINGS", "ABLUENT", "ABLUTED", 
    "ABODING", "ABOLISH", "ABOLLAE", "ABOLLAS", "ABOMASA", "ABOMASI", 
    
    // Add more words as needed for 8-letter+ words
    "ABSOLUTE", "ACADEMY", "ACCEPTED", "ACCIDENT", "ACCURATE", "ACHIEVED", 
    "ACQUIRED", "ACTIVITY", "ACTUALLY", "ADDITION", "ADEQUATE", "ADJUSTED", 
    "ADVANCED", "ADVISORY", "ADVOCATE", "AFFECTED", "AIRCRAFT", "ALLIANCE", 
    "ALTHOUGH", "AMERICAN", "ANALYSIS", "ANNOUNCE", "ANYTHING", "APPARENT", 
    "APPROACH", "APPROVAL", "ARGUMENT", "ATHLETIC", "ATTACHED", "ATTACKED", 
    "ATTEMPTED", "ATTENDED", "ATTITUDE", "ATTORNEY", "AUDIENCE", "BEHAVIOR", 
    "BENEFITS", "BUILDING", "BUSINESS", "CAMPAIGN", "CAPACITY", "CARRYING", 
    "CATEGORY", "CHAIRMAN", "CHAMPION", "CHANGING", "CHANNELS", "CHEMICAL", 
    "CHILDREN", "CITIZENS", "CLOTHING", "COLLECTED"
    
    // You can continue adding more words as needed
];

// Create a Set from the word list, all uppercase for case-insensitive matching
const dictionary = new Set(wordList.map(word => word.toUpperCase()));