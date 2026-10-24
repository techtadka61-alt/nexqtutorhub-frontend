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

/** Languages a tutor can teach in; must match the API's TEACHING_LANGUAGES. */
export const TEACHING_LANGUAGES = ["Hindi", "English", "Bhojpuri", "Urdu", "Sanskrit", "Bengali", "Punjabi", "Marathi"];

/** Public support contact, shown site-wide (top bar, contact page, footer). */
export const SUPPORT_EMAIL = "nexqira.online@gmail.com";
export const SUPPORT_PHONE = "+91 93697 76898";
/** tel: form of SUPPORT_PHONE. */
export const SUPPORT_PHONE_HREF = "+919369776898";
/** The support number also takes WhatsApp; the floating button opens a chat with this message already typed. */
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE_HREF.slice(1)}?text=${encodeURIComponent(
  "Mujhe Class __ ke liye tutor chahiye",
)}`;

/** Udyam (MSME) registration, shown in the Highlights section. */
export const UDYAM_NUMBER = "UDYAM-UP-72-0040416";
