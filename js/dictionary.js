// Keep this list relatively small for client-side, or consider server-side validation
// For a real game, use a much larger list (e.g., fetch a file)
const wordList = [
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
    "SAUTE", "SCOUT", "SCARE", "SOBER", "STORE", "TRACE", "TRADE", "TROVE"
    // Add many more words...
];

const dictionary = new Set(wordList.map(word => word.toUpperCase()));