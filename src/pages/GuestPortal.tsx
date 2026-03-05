import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, BookOpen, Calendar, Heart, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const GuestPortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Guest Portal</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Welcome! Limited access for visitors, donors & supporters</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-emerald transition-all">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display text-lg font-bold mb-2">Public Resources</h3>
              <p className="text-muted-foreground font-body text-sm mb-4">Explore our curated Islamic resources</p>
              <Button variant="outline" asChild><Link to="/resources">Browse Resources <ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-emerald transition-all">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-display text-lg font-bold mb-2">Events</h3>
              <p className="text-muted-foreground font-body text-sm mb-4">View upcoming community events</p>
              <Button variant="outline" asChild><Link to="/events">View Events <ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-emerald transition-all">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 text-destructive mb-3" />
              <h3 className="font-display text-lg font-bold mb-2">Donate</h3>
              <p className="text-muted-foreground font-body text-sm mb-4">Support our students with sadaqah</p>
              <Button variant="gold">Make a Donation</Button>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h3 className="font-display text-lg font-bold mb-2">Want Full Access?</h3>
              <p className="text-muted-foreground font-body text-sm mb-4">Register as a student to unlock all features</p>
              <Button variant="hero" asChild><Link to="/register">Register Now</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default GuestPortal;
