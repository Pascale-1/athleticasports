import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your App</h1>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">
              You're signed in as: {user.email || user.phone}
            </p>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">Get started by signing in</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
