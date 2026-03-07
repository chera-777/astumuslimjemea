import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Users, Heart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to ASTU Muslim Jemea!",
    desc: "Your one-stop community platform for spiritual growth, academic excellence, and brotherhood/sisterhood.",
    gradient: "gradient-teal",
  },
  {
    icon: BookOpen,
    title: "Explore Resources",
    desc: "Access Qur'an, Hadith, Kitabs, video lectures, and attend Ders sessions with scholars.",
    gradient: "gradient-green",
  },
  {
    icon: Users,
    title: "Join Your Community",
    desc: "Connect with study groups, attend events, and engage in community activities within your university.",
    gradient: "gradient-blue",
  },
  {
    icon: Heart,
    title: "Give Back",
    desc: "Support fellow students through donations, volunteer as a Khadim during Ramadan, and build community.",
    gradient: "gradient-pink",
  },
];

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("msj-onboarding-seen");
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("msj-onboarding-seen", "true");
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="p-6 text-center"
          >
            <div className={`w-16 h-16 rounded-2xl ${current.gradient} flex items-center justify-center mx-auto mb-4`}>
              <current.icon className="h-8 w-8 text-primary-foreground" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="font-display text-xl text-center">{current.title}</DialogTitle>
              <DialogDescription className="font-body text-sm text-center mt-2">{current.desc}</DialogDescription>
            </DialogHeader>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 my-5">
              {steps.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-border"}`} />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              {step < steps.length - 1 ? (
                <>
                  <Button variant="ghost" onClick={handleClose} className="font-body text-sm">Skip</Button>
                  <Button onClick={handleNext} className="font-body text-sm">
                    Next <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="hero" onClick={handleClose} className="font-body text-sm px-8">
                  Get Started <Sparkles className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
