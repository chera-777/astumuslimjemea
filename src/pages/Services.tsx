import { NaturePageHeader } from "@/components/layout/NaturePageHeader";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SERVICES } from "@/lib/services";

const Services = () => {
  return (
    <AppLayout>
      <SEO title="Services — ASTU Muslim Jemea" description="Browse community services available to ASTU Muslim members." path="/services" />
      <div className="p-3 md:p-5 space-y-4 max-w-6xl mx-auto">
        <NaturePageHeader title="University Services" subtitle="Campus life, learning, and student support" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {SERVICES.map((s, i) => (
            <motion.div key={s.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Button
                variant="outline"
                asChild
                className="block w-full h-full min-h-48 whitespace-normal text-left p-5 bg-card border-border/60 hover:bg-secondary/60 hover:text-foreground hover:border-primary/40 shadow-leaf"
              >
                <Link to={`/services/${s.slug}`} aria-label={`Open ${s.title}`}>
                  <div className="flex h-full flex-col gap-3">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <p className="font-display text-lg font-bold leading-tight break-words">{s.title}</p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      {s.requestKinds ? (
                        <Badge variant="outline" className="font-body text-[10px]">Requests</Badge>
                      ) : (
                        <Badge variant="outline" className="font-body text-[10px]">Hub</Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Services;
