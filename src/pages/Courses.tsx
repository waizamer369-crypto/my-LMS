import { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, Play, Clock, Eye, Star, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/lib/animations";

const SAMPLE_VIDEOS = [
  {
    id: 101, title: "Big Buck Bunny",
    subtitle: "A classic animated short film about a giant rabbit",
    category: "Animation", level: "beginner", priceCents: 0,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "9:56", views: "2.4M", rating: 4.8,
    instructorName: "Blender Foundation",
  },
  {
    id: 102, title: "Elephants Dream",
    subtitle: "The world's first open movie, made entirely with open source",
    category: "Animation", level: "intermediate", priceCents: 999,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "10:53", views: "1.8M", rating: 4.6,
    instructorName: "Blender Foundation",
  },
  {
    id: 103, title: "For Bigger Blazes",
    subtitle: "A demonstration of high-resolution video playback",
    category: "Technology", level: "beginner", priceCents: 0,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "0:15", views: "890K", rating: 4.2,
    instructorName: "Google",
  },
  {
    id: 104, title: "For Bigger Escapes",
    subtitle: "Stunning travel footage in ultra-high definition",
    category: "Travel", level: "beginner", priceCents: 499,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "0:15", views: "1.2M", rating: 4.5,
    instructorName: "Google",
  },
  {
    id: 105, title: "Sintel",
    subtitle: "A lonely young woman searching for a baby dragon",
    category: "Animation", level: "advanced", priceCents: 1299,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    duration: "14:48", views: "3.1M", rating: 4.9,
    instructorName: "Blender Foundation",
  },
  {
    id: 106, title: "Tears of Steel",
    subtitle: "A sci-fi thriller about warriors and scientists",
    category: "Sci-Fi", level: "intermediate", priceCents: 799,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: "12:14", views: "2.7M", rating: 4.7,
    instructorName: "Mango Open Movie",
  },
  {
    id: 107, title: "Volcano Eruption",
    subtitle: "Stunning footage of volcanic activity in 4K",
    category: "Nature", level: "beginner", priceCents: 0,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Volcano.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Volcano.mp4",
    duration: "0:15", views: "4.5M", rating: 4.4,
    instructorName: "NatGeo",
  },
  {
    id: 108, title: "We Are Going On Bullrun",
    subtitle: "An exciting automotive adventure documentary",
    category: "Automotive", level: "beginner", priceCents: 299,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    duration: "0:15", views: "650K", rating: 4.1,
    instructorName: "MotorTrend",
  },
  {
    id: 109, title: "What Car Can You Get For A Grand",
    subtitle: "Budget car buying guide and reviews",
    category: "Automotive", level: "intermediate", priceCents: 0,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    duration: "0:15", views: "920K", rating: 4.3,
    instructorName: "Top Gear",
  },
];

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
};

interface VideoPlayerModalProps {
  video: (typeof SAMPLE_VIDEOS)[0] | null;
  open: boolean;
  onClose: () => void;
}

function VideoPlayerModal({ video, open, onClose }: VideoPlayerModalProps) {
  if (!video) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg">{video.title}</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <video src={video.videoUrl} controls autoPlay className="h-full w-full" poster={video.thumbnail}>
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{video.subtitle}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline">{LEVEL_LABELS[video.level]}</Badge>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {video.views}</span>
                <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" /> {video.rating}</span>
              </div>
            </div>
            <span className={`font-bold text-lg ${video.priceCents === 0 ? "text-green-600" : ""}`}>
              {formatPrice(video.priceCents)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const category = params.get("category") ?? "All";
  const [selectedVideo, setSelectedVideo] = useState<(typeof SAMPLE_VIDEOS)[0] | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  const { data: categories } = trpc.lms.categories.useQuery();
  const { data: courses, isLoading } = trpc.lms.courses.useQuery({
    category: category === "All" ? undefined : category,
    search: search || undefined,
  });

  const allItems = [...SAMPLE_VIDEOS, ...(courses ?? [])];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = search
      ? item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = category !== "All" ? item.category === category : true;
    return matchesSearch && matchesCategory;
  });

  const handlePlayVideo = (video: (typeof SAMPLE_VIDEOS)[0]) => {
    setSelectedVideo(video);
    setPlayerOpen(true);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold">Explore Courses</h1>
          <p className="mt-2 text-muted-foreground">
            {filteredItems.length} course{filteredItems.length === 1 ? "" : "s"} available
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select
            value={category}
            onChange={(e) => {
              const v = e.target.value;
            if (v === "All") params.delete("category"); else params.set("category", v);
            setParams(params);
            }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-56"
            aria-label="Category"
          >
            <option value="All">All categories</option>
            {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </motion.div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <StaggerContainer className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <StaggerItem key={item.id}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.2 }}
                  className="group cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
                  onClick={() => { if ("videoUrl" in item) handlePlayVideo(item as (typeof SAMPLE_VIDEOS)[0]); }}>
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img src={item.thumbnail ?? ""} alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                        <Play className="h-7 w-7 ml-1" fill="currentColor" />
                      </motion.div>
                    </div>
                    {"duration" in item && (
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70">
                        {(item as (typeof SAMPLE_VIDEOS)[0]).duration}
                      </Badge>
                    )}
                    <Badge className="absolute left-2 top-2" variant="secondary">{item.category}</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    {item.subtitle && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.subtitle}</p>}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">{LEVEL_LABELS[item.level] ?? item.level}</Badge>
                      {"views" in item && <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(item as (typeof SAMPLE_VIDEOS)[0]).views}</span>}
                      {"rating" in item && <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" /> {(item as (typeof SAMPLE_VIDEOS)[0]).rating}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.instructorName ?? "LearnHub Team"}</span>
                      <span className={`font-bold text-sm ${item.priceCents === 0 ? "text-green-600" : ""}`}>
                        {formatPrice(item.priceCents)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 text-center text-muted-foreground">
            <p className="text-lg font-medium">No courses found</p>
            <p className="mt-1 text-sm">Try a different search or category.</p>
          </motion.div>
        )}
      </div>

      <VideoPlayerModal video={selectedVideo} open={playerOpen} onClose={() => { setPlayerOpen(false); setSelectedVideo(null); }} />
    </Layout>
  );
}
