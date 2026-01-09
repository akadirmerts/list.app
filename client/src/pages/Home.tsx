import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Share2, Zap, Users, Globe, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState<"1d" | "1w" | "1m" | "inf">("1w");
  const [isLoading, setIsLoading] = useState(false);
  const { lang, changeLang, t } = useLanguage();

  const createListMutation = trpc.lists.create.useMutation({
    onSuccess: (list) => {
      setTitle("");
      setLocation(`/list/${list.slug}`);
    },
    onError: (error) => {
      console.error("Failed to create list:", error);
    },
  });

  const handleCreateList = async () => {
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      const cleanPassword = password?.trim();
      const list = await createListMutation.mutateAsync({
        title: title.trim(),
        password: cleanPassword || undefined,
        expiresIn,
      });

      // Auto-save password to session storage to avoid asking the creator
      if (cleanPassword && list?.slug) {
        sessionStorage.setItem(`list-password-${list.slug}`, cleanPassword);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateList();
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeLang(lang === "tr" ? "en" : "tr")}
          className="bg-white/50 backdrop-blur-sm border border-foreground/10"
        >
          <Globe className="w-4 h-4 mr-2" />
          {lang === "tr" ? "TR" : "EN"}
        </Button>
      </div>

      {/* Memphis Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large circle - mint green */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary opacity-20" />

        {/* Triangle - lavender (using clip-path) */}
        <div
          className="absolute top-1/4 right-20 w-40 h-40 opacity-20"
          style={{
            background: "var(--color-secondary)",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* Rectangle - yellow */}
        <div className="absolute bottom-1/3 left-1/4 w-48 h-24 bg-accent opacity-20 transform -rotate-12" />

        {/* Small circles accent */}
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full border-4 border-primary opacity-30" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-secondary opacity-15" />

        {/* Dots pattern */}
        <div className="absolute top-20 right-1/3 flex gap-3">
          <div className="w-2 h-2 rounded-full bg-black opacity-40" />
          <div className="w-2 h-2 rounded-full bg-black opacity-40" />
          <div className="w-2 h-2 rounded-full bg-black opacity-40" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20 lg:py-28 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4 memphis-text-shadow">
            <span className="text-primary">{t.hero.title_1}</span>
            <br />
            <span className="text-secondary">{t.hero.title_2}</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 font-medium max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Create List Form */}
        <div className="w-full max-w-2xl mb-16 sm:mb-20">
          <div className="card-memphis bg-white">
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder={t.form.placeholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-memphis"
                disabled={isLoading}
              />
              <div className="flex gap-3">
                <Input
                  type="password"
                  placeholder={t.form.password_placeholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input-memphis flex-1"
                  disabled={isLoading}
                />

                {/* Duration Select */}
                <Select
                  value={expiresIn}
                  onValueChange={(val: any) => setExpiresIn(val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[140px] input-memphis bg-white">
                    <Clock className="w-4 h-4 mr-2 text-foreground/50" />
                    <SelectValue placeholder="Süre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">{t.duration.d1}</SelectItem>
                    <SelectItem value="1w">{t.duration.w1}</SelectItem>
                    <SelectItem value="1m">{t.duration.m1}</SelectItem>
                    <SelectItem value="inf">{t.duration.inf}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateList}
                disabled={!title.trim() || isLoading}
                className="btn-memphis bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2 rounded-xl mt-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isLoading ? t.form.creating : t.form.create_btn}
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="card-memphis bg-white hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase mb-2">{t.features.share_title}</h3>
                <p className="text-sm text-foreground/70">
                  {t.features.share_desc}
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card-memphis bg-white hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase mb-2">{t.features.realtime_title}</h3>
                <p className="text-sm text-foreground/70">
                  {t.features.realtime_desc}
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card-memphis bg-white hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase mb-2">{t.features.collab_title}</h3>
                <p className="text-sm text-foreground/70">
                  {t.features.collab_desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Decorations */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pointer-events-none">
          <div className="w-20 h-20 rounded-full border-4 border-primary opacity-20" />
          <div className="w-32 h-8 bg-secondary opacity-15 rounded-full" />
          <div className="w-20 h-20 rounded-full border-4 border-accent opacity-20" />
        </div>
      </div>
    </div>
  );
}
