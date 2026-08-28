export type StageStatus = "live" | "planned";

export interface LifeStage {
  id: string;
  order: number;
  title: string;
  description: string;
  status: StageStatus;
  /** Present only on live stages. Planned stages must never carry one. */
  journeyId?: string;
}

export const LIFE_STAGES: readonly LifeStage[] = [
  {
    id: "birth",
    order: 1,
    title: "A child is born",
    description:
      "Register the birth with the local Registrar, enrol the newborn for Aadhaar, add the child to the ration card, and start the U-WIN immunisation schedule.",
    status: "live",
    journeyId: "birth",
  },
  {
    id: "school-entry",
    order: 2,
    title: "Starting school",
    description:
      "School admission, the RTE 25% reserved quota, and the caste and income certificates that most admissions and later scholarships depend on.",
    status: "planned",
  },
  {
    id: "turning-18",
    order: 3,
    title: "Turning 18",
    description:
      "Voter registration through Form 6, a PAN card, and a learner's licence followed by a driving licence on Parivahan.",
    status: "live",
    journeyId: "turning18",
  },
  {
    id: "higher-education",
    order: 4,
    title: "Higher education",
    description:
      "Scholarships on the National Scholarship Portal, education loans through Vidya Lakshmi, and the domicile, migration and transfer certificates colleges ask for.",
    status: "planned",
  },
  {
    id: "first-job",
    order: 5,
    title: "The first job",
    description:
      "Activating your UAN with EPFO, ESIC registration, professional tax, and filing an income tax return for the first time.",
    status: "planned",
  },
  {
    id: "going-abroad",
    order: 6,
    title: "Going abroad",
    description:
      "Passport application and police verification, a Police Clearance Certificate, apostille of educational documents, and what changes once you hold NRI status.",
    status: "planned",
  },
  {
    id: "marriage",
    order: 7,
    title: "Getting married",
    description:
      "Registration under the Hindu Marriage Act or the Special Marriage Act, gazette notification for a name change, and the cascade of updates that follows across Aadhaar, PAN, passport, bank and EPF nominees.",
    status: "planned",
  },
  {
    id: "becoming-a-parent",
    order: 8,
    title: "Becoming a parent",
    description:
      "The PMMVY maternity benefit, statutory maternity and paternity leave, and adding a dependent to employer and insurance records.",
    status: "planned",
  },
  {
    id: "buying-a-vehicle",
    order: 9,
    title: "Buying a vehicle",
    description:
      "Registration certificate through Vahan, third-party insurance, the PUC certificate, HSRP plates, and the NOC and transfer process when you sell.",
    status: "planned",
  },
  {
    id: "buying-property",
    order: 10,
    title: "Buying property",
    description:
      "Stamp duty and sale deed registration, mutation in municipal or revenue records, the encumbrance certificate, property tax assessment, and RERA verification for under-construction projects.",
    status: "planned",
  },
  {
    id: "moving",
    order: 11,
    title: "Moving city or state",
    description:
      "Aadhaar address update, ration card portability under One Nation One Ration Card, voter roll transfer through Form 8, and moving the LPG connection.",
    status: "planned",
  },
  {
    id: "starting-a-business",
    order: 12,
    title: "Starting a business",
    description:
      "Udyam registration, GST registration and thresholds, the Shops and Establishments licence, trade licence, and opening a current account.",
    status: "planned",
  },
  {
    id: "illness-disability",
    order: 13,
    title: "Illness or disability",
    description:
      "Ayushman Bharat PM-JAY eligibility, state health schemes such as Aarogyasri, the disability certificate, and the UDID card.",
    status: "planned",
  },
  {
    id: "losing-a-job",
    order: 14,
    title: "Losing a job",
    description:
      "EPF withdrawal and advance rules, transferring your UAN, continuing ESIC cover, and claiming unemployment relief under ABVKY.",
    status: "planned",
  },
  {
    id: "retirement",
    order: 15,
    title: "Retirement",
    description:
      "EPS-95 pension, NPS exit and annuity choices, gratuity, the senior citizen card, and the Jeevan Pramaan life certificate that has to be filed every year.",
    status: "planned",
  },
  {
    id: "death",
    order: 16,
    title: "A death in the family",
    description:
      "Death registration, the legal heir and succession certificates, transferring a family pension, claiming nominee benefits, deactivating Aadhaar and voter records, and mutating property to the heirs.",
    status: "live",
    journeyId: "death",
  },
] as const;

export const LIVE_STAGES = LIFE_STAGES.filter((s) => s.status === "live");
export const PLANNED_STAGES = LIFE_STAGES.filter((s) => s.status === "planned");
