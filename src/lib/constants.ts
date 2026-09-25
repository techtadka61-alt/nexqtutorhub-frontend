export const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
  "Undergraduate",
  "Competitive Exams",
];

export const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "NIOS", "Other"];

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "History",
  "Geography",
  "Political Science",
  "Economics",
  "Computer Science",
  "Accountancy",
  "Business Studies",
  "Sanskrit",
];

export const TUITION_MODE_OPTIONS: { value: "home" | "online" | "both"; label: string }[] = [
  { value: "home", label: "Home tuition" },
  { value: "online", label: "Online tuition" },
  { value: "both", label: "Both home & online" },
];

export const QUALIFICATION_OPTIONS = [
  "High School",
  "Senior Secondary",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "B.Ed",
  "M.Ed",
  "Ph.D.",
  "Other",
];
