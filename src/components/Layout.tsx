import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  GraduationCap, LogOut, LayoutDashboard, BookOpen, PenSquare,
  Home, Menu, Search, Bell, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/courses", label: "Courses", icon: BookOpen },
];

const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "My Learning", icon: LayoutDashboard },
  { to: "/teach", label: "Teach", icon: PenSquare },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allNavItems = [...NAV_ITEMS, ...(isAuthenticated ? AUTH_NAV_ITEMS : [])];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const goTo = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/home") return location.pathname === "/home" || location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-4 border-b">
        <button onClick={() => goTo("/home")} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-lg font-bold whitespace-nowrap overflow-hidden">
                LearnHub
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        {!mobile && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {allNavItems.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <button
              key={item.to}
              onClick={() => goTo(item.to)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-[18px] w-[18px]" />
              </motion.div>
              <AnimatePresence>
                {(!collapsed || mobile) && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (!collapsed || mobile) && (
                <motion.div layoutId="activeIndicator" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t p-3">
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {(user.name ?? "U").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <AnimatePresence>
                  {(!collapsed || mobile) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52" side="right">
              <DropdownMenuItem onClick={() => goTo("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> My Learning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("/courses")}>
                <BookOpen className="mr-2 h-4 w-4" /> Browse Courses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("/teach")}>
                <PenSquare className="mr-2 h-4 w-4" /> Instructor Studio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="w-full" size="sm" onClick={() => goTo("/login")}>
            <LogOut className="mr-2 h-4 w-4" />
            <AnimatePresence>
              {(!collapsed || mobile) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sign in
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <motion.aside initial={false}
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r bg-card/50 backdrop-blur-xl">
        <SidebarContent />
      </motion.aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      <motion.div initial={false}
        animate={{ marginLeft: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <form onSubmit={handleSearch} className="relative hidden sm:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {(user.name ?? "U").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => goTo("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> My Learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goTo("/courses")}>
                    <BookOpen className="mr-2 h-4 w-4" /> Browse Courses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goTo("/teach")}>
                    <PenSquare className="mr-2 h-4 w-4" /> Instructor Studio
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => goTo("/login")}>Sign in</Button>
            )}
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t py-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <GraduationCap className="h-4 w-4" /> LearnHub
            </div>
            <p>Learn anything. Teach everything.</p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}