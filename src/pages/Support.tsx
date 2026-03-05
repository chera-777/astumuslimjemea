import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Heart, DollarSign, Gift, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const campaigns = [
  { title: "Ramadan Iftar Fund", goal: 50000, raised: 32000, donors: 124, daysLeft: 12 },
  { title: "Scholarship for Students", goal: 100000, raised: 78000, donors: 89, daysLeft: 30 },
  { title: "Masjid Renovation", goal: 200000, raised: 45000, donors: 56, daysLeft: 60 },
];

const Support = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Heart className="h-6 w-6 text-destructive" />
            <h1 className="font-display text-2xl font-bold text-foreground">Support & Charity</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Donations, sadaqah programs & community support</p>
        </motion.div>

        {/* Quick Donate */}
        <Card className="border-accent/30">
          <CardContent className="p-6 text-center">
            <Gift className="h-10 w-10 text-accent mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Quick Sadaqah</h3>
            <p className="text-muted-foreground font-body text-sm mb-4">Every contribution matters</p>
            <div className="flex gap-2 justify-center flex-wrap mb-4">
              {[50, 100, 500, 1000].map((amt) => (
                <Button key={amt} variant="outline" size="sm" className="font-body">{amt} ETB</Button>
              ))}
            </div>
            <div className="flex gap-2 max-w-xs mx-auto">
              <Input placeholder="Custom amount" className="font-body" type="number" />
              <Button variant="gold" className="font-body">Donate</Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold">Active Campaigns</h3>
          {campaigns.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-base font-bold">{c.title}</h4>
                    <span className="font-body text-xs text-muted-foreground">{c.daysLeft} days left</span>
                  </div>
                  <Progress value={(c.raised / c.goal) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-body text-primary font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {c.raised.toLocaleString()} ETB
                    </span>
                    <span className="font-body text-muted-foreground">of {c.goal.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {c.donors} donors
                    </span>
                    <Button size="sm" variant="default" className="font-body text-xs">Contribute</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Support;
