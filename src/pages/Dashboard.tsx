import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const Dashboard = ({ username, onLogout }: DashboardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg text-center">
        <CardHeader>
          <CardTitle>Welcome, {username}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">You are logged in.</p>
          <Button variant="outline" onClick={onLogout} className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
