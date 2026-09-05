export interface StageDependency {
  stageId: string;
  ageFrom: number | null;
  coreDocuments: string[];
  requiredDocuments: string[];
  prepNow: string;
  prepNow_te: string;
}

const GENERIC_PREP = "Gather the papers listed for this stage.";
const GENERIC_PREP_TE = "ఈ దశకు అవసరమైన పత్రాలను సేకరించండి.";

export const STAGE_DEPENDENCIES: readonly StageDependency[] = [
  { stageId: "birth", ageFrom: 0, coreDocuments: ["birth"], requiredDocuments: [], prepNow: "Keep the hospital record and a parent's ID ready for registration.", prepNow_te: "నమోదు కోసం ఆసుపత్రి రికార్డు, తల్లిదండ్రుల గుర్తింపు పత్రం సిద్ధంగా ఉంచండి." },
  { stageId: "school-entry", ageFrom: 5, coreDocuments: ["school"], requiredDocuments: ["birth", "aadhaar"], prepNow: "Keep the birth certificate and Aadhaar ready for admission.", prepNow_te: "ప్రవేశానికి జనన ధృవీకరణ పత్రం, ఆధార్ సిద్ధంగా ఉంచండి." },
  { stageId: "turning-18", ageFrom: 18, coreDocuments: ["voter"], requiredDocuments: ["birth", "aadhaar"], prepNow: "Start now: Aadhaar biometric update, then voter Form 6 on the 18th birthday.", prepNow_te: "ఇప్పుడే ప్రారంభించండి: ఆధార్ బయోమెట్రిక్ అప్‌డేట్, 18వ పుట్టినరోజున ఓటరు ఫారం 6." },
  { stageId: "higher-education", ageFrom: 17, coreDocuments: [], requiredDocuments: ["birth", "school", "caste", "aadhaar"], prepNow: "Start now: caste & income certificate and transfer certificate from school.", prepNow_te: "ఇప్పుడే కుల, ఆదాయ ధృవీకరణ పత్రం మరియు పాఠశాల బదిలీ పత్రం సిద్ధం చేయండి." },
  { stageId: "first-job", ageFrom: 18, coreDocuments: ["pan"], requiredDocuments: ["aadhaar", "bank"], prepNow: "Open a bank account and keep Aadhaar details current.", prepNow_te: "బ్యాంకు ఖాతా తెరిచి ఆధార్ వివరాలను తాజాగా ఉంచండి." },
  { stageId: "going-abroad", ageFrom: null, coreDocuments: [], requiredDocuments: ["birth", "aadhaar", "pan"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "marriage", ageFrom: 21, coreDocuments: ["marriage"], requiredDocuments: ["birth", "aadhaar"], prepNow: "Keep age proof and Aadhaar ready for registration.", prepNow_te: "నమోదు కోసం వయస్సు రుజువు, ఆధార్ సిద్ధంగా ఉంచండి." },
  { stageId: "becoming-a-parent", ageFrom: null, coreDocuments: [], requiredDocuments: ["marriage", "aadhaar", "ration"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "buying-a-vehicle", ageFrom: null, coreDocuments: [], requiredDocuments: ["dl", "aadhaar", "pan"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "buying-property", ageFrom: null, coreDocuments: [], requiredDocuments: ["aadhaar", "pan", "bank"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "moving", ageFrom: null, coreDocuments: [], requiredDocuments: ["aadhaar", "voter", "ration"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "starting-a-business", ageFrom: null, coreDocuments: [], requiredDocuments: ["pan", "bank", "aadhaar"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "illness-disability", ageFrom: null, coreDocuments: [], requiredDocuments: ["aadhaar", "ration", "insurance"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "losing-a-job", ageFrom: null, coreDocuments: [], requiredDocuments: ["bank", "pan"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
  { stageId: "retirement", ageFrom: 60, coreDocuments: ["pension"], requiredDocuments: ["aadhaar", "bank", "nominee"], prepNow: "Start now: confirm a nominee, gather age proof, and ask the Sachivalayam about pension enrolment.", prepNow_te: "ఇప్పుడే నామినీని నిర్ధారించి, వయస్సు రుజువు సేకరించి, పెన్షన్ నమోదు గురించి సచివాలయంలో అడగండి." },
  { stageId: "death", ageFrom: null, coreDocuments: [], requiredDocuments: ["nominee", "ration", "aadhaar"], prepNow: GENERIC_PREP, prepNow_te: GENERIC_PREP_TE },
] as const;

export const STAGE_DEPENDENCY_BY_ID = new Map(STAGE_DEPENDENCIES.map((stage) => [stage.stageId, stage]));
