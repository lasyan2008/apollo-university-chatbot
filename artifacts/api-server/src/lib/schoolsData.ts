export interface Branch {
  id: string;
  name: string;
}

export interface School {
  id: string;
  name: string;
  shortName: string;
  branches: Branch[];
}

export const schoolsData: School[] = [
  {
    id: "SOT",
    name: "School of Technology",
    shortName: "SOT",
    branches: [
      { id: "btech_cse", name: "B.Tech. Computer Science and Engineering" },
      { id: "btech_aids", name: "B.Tech. CSE – Artificial Intelligence and Data Science" },
      { id: "btech_aiml", name: "B.Tech. CSE – Artificial Intelligence and Machine Learning" },
      { id: "btech_cyber", name: "B.Tech. CSE (Cyber Security)" },
      { id: "btech_cloud", name: "B.Tech. CSE (Cloud Computing)" },
      { id: "btech_aihealth", name: "B.Tech. CSE (AI & Healthcare Technology)" },
      { id: "mtech_vlsi", name: "M.Tech. VLSI Design and Embedded Systems" },
      { id: "mtech_ds", name: "M.Tech. Data Science" },
      { id: "mtech_cse", name: "M.Tech. Computer Science and Engineering" },
      { id: "mtech_ees", name: "M.Tech. Electronic Embedded Systems" },
    ],
  },
  {
    id: "SOM",
    name: "School of Management",
    shortName: "SOM",
    branches: [
      { id: "bba", name: "Bachelor of Business Administration (BBA)" },
      { id: "mba_healthcare", name: "MBA – Hospital and Healthcare Management" },
    ],
  },
  {
    id: "SOHS",
    name: "School of Health Sciences",
    shortName: "SOHS",
    branches: [
      { id: "bsc_clinpsych", name: "B.Sc. Clinical Psychology" },
      { id: "bsc_anaesthesia", name: "B.Sc. Anaesthesiology & Operation Theatre Technology" },
      { id: "bsc_renal", name: "B.Sc. Renal Dialysis Technology" },
      { id: "bsc_mlt", name: "B.Sc. Medical Laboratory Technology" },
      { id: "boptom", name: "Bachelor of Optometry (B.Optom)" },
      { id: "bsc_imaging", name: "B.Sc. Imaging Technology" },
      { id: "bsc_emergency", name: "B.Sc. Emergency Medical Technology" },
      { id: "bsc_physician", name: "B.Sc. Physician Assistant" },
      { id: "bsc_respiratory", name: "B.Sc. Respiratory Therapy Technology" },
      { id: "boc_occtherapy", name: "Bachelor in Occupational Therapy" },
      { id: "bsc_genetics", name: "B.Sc. Genetics and Molecular Biology" },
      { id: "bpt", name: "Bachelor of Physiotherapy (BPT)" },
      { id: "bsc_biotech", name: "B.Sc. Bio-Technology" },
      { id: "bsc_critical", name: "B.Sc. Critical Care Technology" },
      { id: "msc_clinpsych", name: "M.Sc. Clinical Psychology" },
      { id: "msc_healthinfo", name: "M.Sc. Health Informatics and Analytics" },
      { id: "msc_medimaging", name: "M.Sc. Medical Imaging Technology" },
      { id: "msc_medbiotech", name: "M.Sc. Medical Bio-Technology" },
      { id: "mph", name: "Master of Public Health (MPH)" },
      { id: "mpt", name: "Master of Physiotherapy (MPT)" },
      { id: "mdt", name: "Masters of Dialysis Therapy (MDT)" },
      { id: "mmls", name: "Master of Medical Laboratory Science (MMLS)" },
      { id: "pgd_sportpsych", name: "P.G. Diploma in Sport Psychology" },
      { id: "pgd_guidance", name: "P.G. Diploma in Advanced Guidance and Counselling" },
      { id: "pgd_biostat", name: "P.G. Diploma in Biostatistics (PGDBS)" },
    ],
  },
  {
    id: "AIPS",
    name: "Apollo Institute of Pharmaceutical Sciences",
    shortName: "AIPS",
    branches: [
      { id: "bpharmacy", name: "B.Pharmacy" },
      { id: "pharmd", name: "Pharm D (Doctor of Pharmacy)" },
    ],
  },
  {
    id: "SOSS",
    name: "School of Social Sciences",
    shortName: "SOSS",
    branches: [
      { id: "cert_systematic", name: "Certificate Course on Systematic Review Methods" },
    ],
  },
];
