export interface HowToGetDocument {
  title: string;
  title_te: string;
  where: string;
  carry: string;
  officialSource: string | null;
  lastVerified?: string;
}

export interface DocumentDefinition {
  id: string;
  label: string;
  label_te: string;
  howToGet: HowToGetDocument & { lateTrack?: HowToGetDocument };
}

export const DOCUMENTS: readonly DocumentDefinition[] = [
  {
    id: "birth",
    label: "Birth certificate",
    label_te: "జనన ధృవీకరణ పత్రం",
    howToGet: {
      title: "Register the birth",
      title_te: "జననాన్ని నమోదు చేయండి",
      where: "Municipality / Panchayat office",
      carry: "Hospital record, parent's Aadhaar",
      officialSource: "https://crsorgi.gov.in",
      lastVerified: "2026-08-28",
      lateTrack: {
        title: "Late Registration of Birth",
        title_te: "ఆలస్య జనన నమోదు",
        where: "Grama / Ward Sachivalayam or MeeSeva centre",
        carry: "Aadhaar, ration card, school record or age proof",
        officialSource: "https://ap.meeseva.gov.in",
        lastVerified: "2026-08-28",
      },
    },
  },
  {
    id: "aadhaar",
    label: "Aadhaar",
    label_te: "ఆధార్",
    howToGet: { title: "Aadhaar enrolment", title_te: "ఆధార్ నమోదు", where: "Nearest Aadhaar enrolment centre", carry: "Birth certificate, parent's Aadhaar", officialSource: "https://uidai.gov.in", lastVerified: "2026-08-28" },
  },
  {
    id: "ration",
    label: "Name on ration card",
    label_te: "రేషన్ కార్డులో పేరు",
    howToGet: { title: "Add name to ration card", title_te: "రేషన్ కార్డులో పేరు చేర్చండి", where: "MeeSeva / Sachivalayam", carry: "Birth certificate, Aadhaar", officialSource: "https://ap.meeseva.gov.in", lastVerified: "2026-08-28" },
  },
  {
    id: "school",
    label: "School transfer certificate",
    label_te: "బదిలీ పత్రం (TC)",
    howToGet: { title: "Collect school transfer certificate", title_te: "బదిలీ పత్రం తీసుకోండి", where: "Last school attended", carry: "Aadhaar", officialSource: null },
  },
  {
    id: "caste",
    label: "Caste & income certificate",
    label_te: "కుల, ఆదాయ ధృవీకరణ",
    howToGet: { title: "Caste & income certificate", title_te: "కుల, ఆదాయ ధృవీకరణ పత్రం", where: "MeeSeva (Tahsildar issues it)", carry: "Aadhaar, ration card, school record", officialSource: null },
  },
  {
    id: "voter",
    label: "Voter ID",
    label_te: "ఓటరు కార్డు",
    howToGet: { title: "Enrol as a voter (Form 6)", title_te: "ఓటరుగా నమోదు (ఫారం 6)", where: "voters.eci.gov.in or the ward BLO", carry: "Address proof, age proof", officialSource: "https://voters.eci.gov.in", lastVerified: "2026-08-28" },
  },
  {
    id: "bank",
    label: "Own bank account",
    label_te: "సొంత బ్యాంకు ఖాతా",
    howToGet: { title: "Open or convert a bank account", title_te: "బ్యాంకు ఖాతా తెరవండి", where: "Any bank branch", carry: "Aadhaar, PAN or Form 60, photo", officialSource: null },
  },
  {
    id: "nominee",
    label: "Nominee on bank account",
    label_te: "బ్యాంకు ఖాతాలో నామినీ",
    howToGet: { title: "Register a nominee", title_te: "నామినీని నమోదు చేయండి", where: "Your bank branch; ask for the nomination form", carry: "Passbook, nominee's Aadhaar", officialSource: null },
  },
  {
    id: "pan",
    label: "PAN card",
    label_te: "PAN కార్డు",
    howToGet: { title: "Apply for PAN", title_te: "PAN కోసం దరఖాస్తు", where: "Online or a PAN service centre", carry: "Aadhaar, photo", officialSource: null },
  },
  {
    id: "dl",
    label: "Driving licence",
    label_te: "డ్రైవింగ్ లైసెన్స్",
    howToGet: { title: "Learner's licence", title_te: "లెర్నర్ లైసెన్స్", where: "AP Transport / Parivahan Sarathi", carry: "Aadhaar, age proof", officialSource: "https://parivahan.gov.in", lastVerified: "2026-08-28" },
  },
  {
    id: "marriage",
    label: "Marriage certificate",
    label_te: "వివాహ ధృవీకరణ పత్రం",
    howToGet: { title: "Register the marriage", title_te: "వివాహ నమోదు", where: "Sub-Registrar office", carry: "Age proof of both, witnesses, photos", officialSource: null },
  },
  {
    id: "insurance",
    label: "Health cover (PM-JAY / policy)",
    label_te: "ఆరోగ్య బీమా",
    howToGet: { title: "Get health cover", title_te: "ఆరోగ్య బీమా పొందండి", where: "PM-JAY desk at a hospital or MeeSeva", carry: "Aadhaar, ration card", officialSource: null },
  },
  {
    id: "pension",
    label: "Pension enrolment",
    label_te: "పెన్షన్ నమోదు",
    howToGet: { title: "Enrol for pension", title_te: "పెన్షన్ నమోదు", where: "Grama / Ward Sachivalayam", carry: "Aadhaar, bank passbook, age proof", officialSource: null },
  },
] as const;

export const DOCUMENT_BY_ID = new Map(DOCUMENTS.map((document) => [document.id, document]));
