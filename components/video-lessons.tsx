"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Clock, Star, Users, Search } from "lucide-react"

interface VideoLessonsProps {
  onSelectVideo?: (videoId: string) => void
  onViewAllVideos?: () => void
  showViewAllButton?: boolean
  showAllVideos?: boolean
  enableSearch?: boolean
}

const videos = [
  {
    id: "intro-fractions",
    title: "Introduction to Fractions",
    subject: "Mathematics",
    duration: "12 min",
    rating: 4.9,
    students: 1234,
    thumbnail: "from-chart-1 to-chart-1/70",
    icon: "1/2",
  },
  {
    id: "solar-system",
    title: "The Solar System",
    subject: "Science",
    duration: "18 min",
    rating: 4.8,
    students: 2156,
    thumbnail: "from-accent to-accent/70",
    icon: "🪐",
  },
  {
    id: "story-writing",
    title: "Story Writing Basics",
    subject: "English",
    duration: "15 min",
    rating: 4.7,
    students: 987,
    thumbnail: "from-chart-4 to-chart-4/70",
    icon: "✍️",
  },
  {
    id: "world-geography",
    title: "World Geography",
    subject: "Social Studies",
    duration: "20 min",
    rating: 4.9,
    students: 1567,
    thumbnail: "from-secondary to-secondary/70",
    icon: "🌍",
  },
  {
    id: "multiplication-magic",
    title: "Multiplication Magic",
    subject: "Mathematics",
    duration: "16 min",
    rating: 4.8,
    students: 1789,
    thumbnail: "from-primary to-primary/70",
    icon: "×",
  },
  {
    id: "plants-and-animals",
    title: "Plants and Animals",
    subject: "Science",
    duration: "14 min",
    rating: 4.7,
    students: 1432,
    thumbnail: "from-chart-2 to-chart-2/70",
    icon: "🌿",
  },
  {
    id: "reading-comprehension",
    title: "Reading Comprehension Skills",
    subject: "English",
    duration: "17 min",
    rating: 4.9,
    students: 1644,
    thumbnail: "from-chart-3 to-chart-3/70",
    icon: "📖",
  },
  {
    id: "maps-and-globes",
    title: "Maps and Globes",
    subject: "Social Studies",
    duration: "13 min",
    rating: 4.8,
    students: 1188,
    thumbnail: "from-secondary to-secondary/80",
    icon: "🗺️",
  },
]

export function VideoLessons({
  onSelectVideo,
  onViewAllVideos,
  showViewAllButton = true,
  showAllVideos = false,
  enableSearch = false,
}: VideoLessonsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All")
  const visibleVideos = showAllVideos ? videos : videos.slice(0, 4)
  const subjects = useMemo(() => ["All", ...new Set(visibleVideos.map((video) => video.subject))], [visibleVideos])
  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return visibleVideos.filter((video) => {
      const matchesQuery = !query || video.title.toLowerCase().includes(query)
      const matchesSubject = selectedSubject === "All" || video.subject === selectedSubject
      return matchesQuery && matchesSubject
    })
  }, [visibleVideos, searchQuery, selectedSubject])

  return (
    <section id="videos" className="py-12 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div>
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Featured Video Lessons
          </h2>
          <p className="text-muted-foreground text-lg">Watch and learn with our best teachers</p>
        </div>
        {showViewAllButton && (
          <Button variant="outline" className="mt-4 md:mt-0 rounded-full" onClick={onViewAllVideos}>
            View All Videos
          </Button>
        )}
      </div>

      {enableSearch && (
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-full lg:max-w-xl">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search video by name..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {subjects.map((subject) => (
              <Button
                key={subject}
                type="button"
                variant={selectedSubject === subject ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVideos.map((video, index) => (
          <Card
            key={index}
            className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => onSelectVideo?.(video.id)}
          >
            <div className={`relative h-40 bg-gradient-to-br ${video.thumbnail}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl">{video.icon}</span>
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                  <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                </div>
              </div>

              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-foreground">
                {video.subject}
              </div>

              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {video.title}
              </h3>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="font-medium text-foreground">{video.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{video.students.toLocaleString()} students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {enableSearch && filteredVideos.length === 0 && (searchQuery.trim() || selectedSubject !== "All") && (
        <p className="mt-6 text-sm text-muted-foreground">No videos found for this filter.</p>
      )}
    </section>
  )
}
