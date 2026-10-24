import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";

/**
 * Floating "message us on WhatsApp" button, bottom-right on every public page (site and sign-in/sign-up). The chat
 * opens with "Mujhe Class __ ke liye tutor chahiye" already typed, so a parent only fills in the class. Not shown
 * inside the signed-in account area, where it would cover the sticky save bar.
 */
export function WhatsAppButton() {
  return (
    <a
      href={SUPPORT_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp पर ट्यूटर के लिए मैसेज करें"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-lifted transition-transform duration-200 hover:scale-105 focus-ring print:hidden sm:right-6 sm:bottom-6 sm:px-5"
    >
      <WhatsAppIcon size={26} />
      <span lang="hi" className="hidden text-sm font-semibold sm:inline">
        ट्यूटर चाहिए? WhatsApp करें
      </span>
    </a>
  );
}
