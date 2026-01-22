import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, QuestionMarkIcon } from "@radix-ui/react-icons";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center">
      <div className="w-2/3 space-y-6">
        <QuestionMarkIcon className="w-24 h-24 mx-auto text-yellow-300" />
        <h1 className="text-9xl barrio text-yellow-300">404</h1>
        <h2 className="text-4xl font-bold">Page Not Found</h2>
        <p className="text-xl text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button
            className="rounded"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <ArrowLeftIcon className="mr-2" />
            Go Back
          </Button>
          <Button className="rounded" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
