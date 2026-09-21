import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <SEO
        title="Page not found | ASTU Muslim Jemea"
        description="The page you are looking for does not exist. Return to the ASTU Muslim Jemea home screen."
        path="/404"
      />
      <div className="max-w-sm w-full text-center space-y-4">
        <div
          className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
          aria-hidden="true"
        >
          <Compass className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Page not found</h1>
        <p className="font-body text-sm text-muted-foreground">
          We couldn't find that page. It may have moved, or the link might be out of date.
        </p>
        <Button asChild className="rounded-full gap-2">
          <Link to="/">
            <Home className="h-4 w-4" aria-hidden="true" /> Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
