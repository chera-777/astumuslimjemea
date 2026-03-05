import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Shield, Vote, Moon, Star, ArrowRight, Heart } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Islamic Resources", desc: "Qur'an, Hadith, Kitabs & Zikr tools" },
  { icon: Users, title: "Group System", desc: "Annual gender-segregated study groups" },
  { icon: Shield, title: "Multi-Portal Access", desc: "Amirs, Committee, Student & Guest portals" },
  { icon: Vote, title: "Governance", desc: "Transparent elections & decision-making" },
  { icon: Moon, title: "Ramadan Tools", desc: "Meal cards, calendars & Azan player" },
  { icon: Heart, title: "Support Programs", desc: "Mentoring, charity & community events" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden islamic-pattern">
        <div className="absolute inset-0 bg-emerald-gradient opacity-95" />
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-gold" />
              <span className="text-gold font-body text-sm font-semibold tracking-wide uppercase">
                بسم الله الرحمن الرحيم
              </span>
              <Star className="h-5 w-5 text-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              ASTU Muslim<br />
              <span className="text-gold">Jemea</span>
            </h1>
            <p className="font-body text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Strengthening the academic, spiritual, and social life of Muslim students 
              at Ethiopian universities — built on Islamic values.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="gold" className="text-base px-8">
                <Link to="/register">
                  Join the Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/portal/guest">Explore as Guest</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-16 md:h-20" preserveAspectRatio="none">
            <path fill="hsl(40,30%,97%)" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            One Platform, Complete Community
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Everything Muslim students need — from spiritual growth to academic excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border hover:shadow-emerald transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground font-body text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary islamic-pattern">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to Join?</h2>
          <p className="text-muted-foreground font-body mb-8 max-w-lg mx-auto">
            Register now and connect with your Muslim student community.
          </p>
          <Button asChild size="lg" variant="hero" className="px-10">
            <Link to="/register">Register Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-lg font-bold text-primary mb-1">ASTU Muslim Jemea</p>
          <p className="text-muted-foreground font-body text-sm">
            Built on Islamic values • Strengthening community
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
