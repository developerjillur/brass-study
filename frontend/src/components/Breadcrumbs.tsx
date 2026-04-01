"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/daily-log": "Daily Log",
  "/lab-results": "Lab Results",
  "/assessments": "Assessments",
  "/messages": "Messages",
  "/profile": "My Profile",
  "/onboarding": "Join the Study",
  "/researcher/screening": "Screening Queue",
  "/researcher/participants": "Participants",
  "/researcher/assessments": "Assessment Rates",
  "/researcher/reports": "Dissertation Reports",
};

const Breadcrumbs = () => {
  const pathname = usePathname();
  const path = pathname;

  if (path === "/" || path === "/login" || path === "/forgot-password" || path === "/reset-password" || path === "/screener") {
    return null;
  }

  const label = ROUTE_LABELS[path];
  if (!label) return null;

  const isResearcherPage = path.startsWith("/researcher/");

  return (
    <nav aria-label="Breadcrumb" className="container pt-4 pb-0">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </li>
        {isResearcherPage && (
          <>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><span className="text-muted-foreground">Researcher</span></li>
          </>
        )}
        {path !== "/dashboard" && (
          <>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><span className="font-medium text-foreground">{label}</span></li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
