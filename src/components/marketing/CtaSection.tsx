import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section className="bg-surface py-20">
      <Container className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-brand-secondary-light px-8 py-16 text-center">
        <h2 className="max-w-xl font-display text-3xl font-bold text-brand-primary sm:text-4xl">
          Ready to find your perfect tuition match?
        </h2>
        <p className="max-w-lg text-text-secondary">
          Join students and tutors already connecting on NexTutorHub — it takes less than five
          minutes to get started.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/signup/student" size="lg">
            Find a tutor
          </Button>
          <Button href="/signup/tutor" size="lg" variant="outline">
            Become a tutor
          </Button>
        </div>
      </Container>
    </section>
  );
}
