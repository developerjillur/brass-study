"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import NeedHelpButton from "@/components/NeedHelpButton";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <Breadcrumbs />
      <main className="flex-1 page-enter">{children}</main>
      <NeedHelpButton />
      <SiteFooter />
    </div>
  );
};

export default PublicLayout;
