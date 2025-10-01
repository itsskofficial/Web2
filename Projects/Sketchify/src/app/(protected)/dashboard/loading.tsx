import { Loader2 } from "lucide-react";

const LoadingDashboard = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
    </div>
  );
};

export default LoadingDashboard;