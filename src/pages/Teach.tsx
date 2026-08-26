import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Users, BookOpen, Award, PenSquare, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

export default function Teach() {
  const navigate = useNavigate();
  useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const { data: courses, isLoading } = trpc.lms.instructorCourses.useQuery();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "Web Development",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    price: "0",
    thumbnail: "",
  });

  const createMutation = trpc.lms.createCourse.useMutation({
    onSuccess: async (id) => {
      await utils.lms.instructorCourses.invalidate();
      toast.success("Course created — now add lessons!");
      setOpen(false);
      navigate(`/teach/${id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const togglePublish = trpc.lms.updateCourse.useMutation({
    onSuccess: () => utils.lms.instructorCourses.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const submit = () => {
    if (form.title.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    createMutation.mutate({
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      description: form.description.trim() || undefined,
      category: form.category,
      level: form.level,
      priceCents: Math.round(parseFloat(form.price || "0") * 100),
      thumbnail: form.thumbnail.trim() || undefined,
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Instructor Studio</h1>
            <p className="mt-2 text-muted-foreground">
              Create courses, manage lessons and quizzes, track your learners.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" /> New course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a new course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Intro to Figma"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="One-line pitch"
                  />
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What will students learn?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Level</Label>
                    <Select
                      value={form.level}
                      onValueChange={(v) => setForm({ ...form, level: v as typeof form.level })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD, 0 = free)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumb">Thumbnail URL</Label>
                    <Input
                      id="thumb"
                      value={form.thumbnail}
                      onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <Button className="w-full" disabled={createMutation.isPending} onClick={submit}>
                  {createMutation.isPending ? "Creating..." : "Create course"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug line-clamp-2">{c.title}</h3>
                    <Badge variant={c.published ? "default" : "secondary"}>
                      {c.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.category} · {formatPrice(c.priceCents)}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/60 py-2">
                      <p className="flex items-center justify-center gap-1 text-lg font-bold">
                        <Users className="h-4 w-4" /> {c.enrollmentCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Students</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 py-2">
                      <p className="flex items-center justify-center gap-1 text-lg font-bold">
                        <BookOpen className="h-4 w-4" /> {c.lessonCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Lessons</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 py-2">
                      <p className="flex items-center justify-center gap-1 text-lg font-bold">
                        <Award className="h-4 w-4" /> {c.certificateCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Certified</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="flex-1" size="sm" variant="outline" onClick={() => navigate(`/teach/${c.id}`)}>
                      <PenSquare className="mr-1 h-3.5 w-3.5" /> Manage
                    </Button>
                    <Button size="sm" variant="ghost" disabled={togglePublish.isPending}
                      onClick={() => togglePublish.mutate({ id: c.id, published: !c.published })}>
                      {c.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed py-16 text-center">
            <PenSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-medium">You haven't created any courses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Click "New course" to publish your first one.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}