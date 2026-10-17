
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Banknote,
  Bot,
  ChevronsUpDown,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  MailPlus,
  Megaphone,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar";
import { authClient } from "~/lib/auth-client";
import type { CurrentUser } from "~/server/user";

type NavItem = {
  title: string;
  icon: LucideIcon;
  /** Route to link to, when the surface exists. */
  to?: "/" | "/compose" | "/recipients";
  /** Product surface that has no route yet. */
  soon?: boolean;
};

const workspaceNav: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { title: "Compose", icon: MailPlus, to: "/compose" },
  { title: "Drafts & templates", icon: FileText, soon: true },
  { title: "Recipients", icon: Users, to: "/recipients" },
  { title: "Send history", icon: History, soon: true },
];

// Standalone features — each is its own product surface, so each owns a group.
// The group names the domain; its items name destinations inside it.
const payrollNav: NavItem[] = [{ title: "Overview", icon: Banknote, soon: true }];
const marketingNav: NavItem[] = [{ title: "Overview", icon: Megaphone, soon: true }];
const whatsappNav: NavItem[] = [{ title: "Overview", icon: Bot, soon: true }];

const systemsNav: NavItem[] = [{ title: "Settings", icon: Settings, soon: true }];

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.to === pathname;

        if (item.to && !item.soon) {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link to={item.to} aria-current={isActive ? "page" : undefined}>
                  <Icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton disabled tooltip={`${item.title} — coming soon`}>
              <Icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>Soon</SidebarMenuBadge>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <NavList items={items} pathname={pathname} />
    </SidebarGroup>
  );
}

export function AppSidebar({ user }: { user: CurrentUser }) {
  const { isMobile } = useSidebar();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const initials = (user.name.trim()[0] ?? user.email[0] ?? "U").toUpperCase();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.invalidate();
      toast.success("Signed out successfully");
      navigate({ to: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Could not sign out", {
        description: "The backend may be unavailable. Try again shortly.",
      });
    }
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="NDMFB">
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Mail className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NDMFB</span>
                  <span className="truncate text-xs text-muted-foreground">Internal tool</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Workspace" items={workspaceNav} pathname={pathname} />
        <SidebarSeparator />
        <NavGroup label="Payroll" items={payrollNav} pathname={pathname} />
        <NavGroup label="Marketing" items={marketingNav} pathname={pathname} />
        <NavGroup label="WhatsApp bot" items={whatsappNav} pathname={pathname} />
        <SidebarSeparator />
        <NavGroup label="Systems" items={systemsNav} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user.name}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.image ?? ""} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
