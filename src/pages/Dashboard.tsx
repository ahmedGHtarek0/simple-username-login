import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Camera, Save, User, Edit3, Clock, CalendarDays } from "lucide-react";

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const Dashboard = ({ username, onLogout }: DashboardProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    // Get user id
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (!userData) return;
    setUserId(userData.id);

    // Get or create profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      setDisplayName(profileData.display_name || "");
      setBio(profileData.bio || "");
      setAvatarUrl(profileData.avatar_url);
    } else {
      // Create profile
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ user_id: userData.id, display_name: username })
        .select()
        .single();

      if (newProfile) {
        setProfile(newProfile);
        setDisplayName(newProfile.display_name || username);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Remove old avatar
    await supabase.storage.from("avatars").remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("user_id", userId);

    setAvatarUrl(newUrl);
    setUploading(false);
    toast({ title: "Avatar updated!" });
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("user_id", userId);

    setSaving(false);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
      return;
    }

    setEditing(false);
    toast({ title: "Profile saved!" });
  };

  const initials = (displayName || username).slice(0, 2).toUpperCase();
  const joinDate = profile?.id ? new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">P</span>
            </div>
            Profile
          </h1>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Hero */}
        <Card className="overflow-hidden border-border/50 shadow-lg">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-accent to-primary/10" />
          <CardContent className="relative pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-28 h-28 border-4 border-card shadow-xl">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-card/30 border-t-card rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-card" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Name & Username */}
              <div className="text-center sm:text-left flex-1 sm:pb-1">
                <h2 className="text-2xl font-bold text-foreground">{displayName || username}</h2>
                <p className="text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                  <User className="w-3.5 h-3.5" />
                  @{username}
                </p>
              </div>

              {/* Edit button */}
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : editing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Details */}
          <Card className="md:col-span-2 border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Display Name</label>
                {editing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="h-11"
                  />
                ) : (
                  <p className="text-foreground py-2">{displayName || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bio</label>
                {editing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-foreground py-2 whitespace-pre-wrap">
                    {bio || <span className="text-muted-foreground italic">No bio yet</span>}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="text-sm font-medium text-foreground">{username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium text-foreground">{joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Online
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
