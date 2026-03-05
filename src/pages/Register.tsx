import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const universities = ["ASTU (Adama)", "AAU (Addis Ababa)", "JU (Jimma)", "BDU (Bahir Dar)", "HU (Haramaya)", "MU (Mekelle)"];
const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Medicine", "Business", "Law", "Architecture", "Other"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const Register = () => {
  const [isCafe, setIsCafe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registration submitted! Awaiting admin verification.");
  };

  return (
    <div className="min-h-screen bg-background islamic-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl gradient-emerald flex items-center justify-center mx-auto mb-4">
            <Moon className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Join the Community</h1>
          <p className="text-muted-foreground font-body text-sm mt-2">Register for ASTU Muslim Jemea</p>
        </div>

        <Card className="shadow-emerald">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="font-body text-sm">Full Name</Label>
                  <Input id="fullName" placeholder="Ahmed Mohammed" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="idNumber" className="font-body text-sm">ID Number</Label>
                  <Input id="idNumber" placeholder="ASTU/1234/15" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="font-body text-sm">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+251 9XX XXX XXX" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-sm">Gender</Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Brother</SelectItem>
                      <SelectItem value="female">Sister</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">University</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                  <SelectContent>
                    {universities.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-body text-sm">Department</Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-sm">Batch / Year</Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Checkbox id="cafe" checked={isCafe} onCheckedChange={(v) => setIsCafe(!!v)} />
                <Label htmlFor="cafe" className="font-body text-sm cursor-pointer">
                  I am a Café student (eligible for Ramadan meal card)
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">ID Card Upload (Verification)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body text-xs">Upload your student ID card for verification</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">Profile Photo (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <p className="text-muted-foreground font-body text-xs">Upload photo • Sisters' photos are private</p>
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg">
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
