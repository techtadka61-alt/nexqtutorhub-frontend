import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section lang="hi" className="bg-surface py-20">
      <Container className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-brand-secondary-light px-8 py-16 text-center">
        <h2 className="max-w-xl font-display text-3xl font-bold text-brand-primary sm:text-4xl">
          अपने बच्चे के लिए सही ट्यूटर खोजने के लिए तैयार हैं?
        </h2>
        <p className="max-w-lg text-text-secondary">
          NexTutorHub पर स्टूडेंट्स और ट्यूटर पहले से जुड़ रहे हैं — शुरू करने में पाँच मिनट से भी कम
          लगते हैं।
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/find-tutors" size="lg">
            ट्यूटर देखें
          </Button>
          <Button href="/signup/tutor" size="lg" variant="outline">
            ट्यूटर बनें
          </Button>
        </div>
      </Container>
    </section>
  );
}
