import { useState } from "react";
import {
  Search,
  Mail,
  MessageSquare,
  LogIn,
  ShieldCheck,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

export function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen text-foreground font-sans pb-20">
      {/* --- HERO SECTION --- */}
      <div className="w-full max-w-5xl mx-auto pt-16 pb-12 px-6 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          How can we help?
        </h1>
        <p className="text-lg text-muted-foreground">
          Find answers, guides, and contact support.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="h-14 pl-12 text-lg bg-card/50 border-border/50 rounded-xl focus-visible:ring-primary/50 shadow-sm"
            placeholder="Search articles, guides, and FAQs..."
            value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: FAQ Accordion (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="space-y-4">
            <FAQItem value="item-1" title="Getting Started">
              To get started, create an account using your email or Web3 wallet.
              Once verified, you can deposit funds via the "Account" tab and
              place your first prediction on any active market.
            </FAQItem>

            <FAQItem value="item-2" title="Account & Security">
              We recommend enabling 2FA (Two-Factor Authentication) immediately.
              Go to Settings &gt;? Security to set up Google Authenticator.
              Never share your private keys or passwords with anyone.
            </FAQItem>

            <FAQItem value="item-3" title="Deposits & Withdrawals">
              Deposits are processed instantly on supported chains (Base,
              Arbitrum, Optimism). Withdrawals typically take 5-10 minutes
              depending on network congestion. No fees are charged by the
              platform for deposits.
            </FAQItem>

            <FAQItem value="item-4" title="Trading & Markets">
              Markets are resolved based on real-world data sources (Oracles).
              You can trade "Yes" or "No" shares. Prices fluctuate based on
              market probability.
            </FAQItem>

            <FAQItem value="item-5" title="Market Resolution & Payouts">
              Once a market resolves, payouts are automatically credited to your
              wallet. If a market result is disputed, it enters a 24-hour review
              period by the governance council.
            </FAQItem>
          </Accordion>
        </div>

        {/* RIGHT COLUMN: Support Cards (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Contact Support */}
          <Card className="bg-card border-border shadow-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Contact Support</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Can't find what you're looking for? <br />
                Our team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                <Mail className="mr-2 h-4 w-4" /> Email Support
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 border-border/60 hover:bg-muted/50 justify-between group"
              >
                <span className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Live Chat
                </span>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Troubleshooting Guides */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Troubleshooting Guides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-0 pb-4">
              <GuideLink icon={LogIn} text="Login & Account Access Issues" />
              <GuideLink icon={ShieldCheck} text="How to Set Up 2FA" />
              <GuideLink
                icon={RefreshCcw}
                text="My Transaction is Not Showing"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// Custom styled accordion item to match the "boxed" look in the image
function FAQItem({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="border border-border/60 rounded-xl bg-card/40 px-4 transition-all data-[state=open]:bg-card/80 data-[state=open]:border-primary/20"
    >
      <AccordionTrigger className="hover:no-underline py-5 text-base font-medium">
        {title}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function GuideLink({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors group border-l-2 border-transparent hover:border-primary"
    >
      <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
        {text}
      </span>
    </a>
  );
}
