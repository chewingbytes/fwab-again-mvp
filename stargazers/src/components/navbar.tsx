import { useLocation } from "react-router-dom";
import { PersonIcon, UnderlineIcon, StackIcon, HomeIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  console.log("Current Path:", location.pathname);

  const activeLinkStyle = "text-gray-500";

  return (
    <>
      <TooltipProvider>
        <div className="flex justify-around items-center border border-gray-800 w-auto h-auto space-x-6 rounded-xl py-4 px-9">
          <Tooltip>
            <TooltipTrigger>
              <a
                href="/profile"
                className={currentPath === "/profile" ? activeLinkStyle : ""}
              >
                <PersonIcon className="w-6 h-6" />
              </a>
            </TooltipTrigger>
            <TooltipContent>Your profile</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <a
                href="/userdashboard"
                className={
                  currentPath === "/userdashboard" ? activeLinkStyle : ""
                }
              >
                <UnderlineIcon className="w-6 h-6"/>
              </a>
            </TooltipTrigger>
            <TooltipContent>User dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <a
                href="/eventdashboard"
                className={
                  currentPath === "/eventdashboard" ? activeLinkStyle : ""
                }
              >
                <StackIcon className="w-6 h-6"/>
              </a>
            </TooltipTrigger>
            <TooltipContent>Event dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <a
                href="/"
                className={
                  currentPath === "/" ? activeLinkStyle : ""
                }
              >
                <HomeIcon className="w-6 h-6"/>
              </a>
            </TooltipTrigger>
            <TooltipContent>Event dashboard</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}
