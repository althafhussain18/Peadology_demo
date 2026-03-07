"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Clock, Star, Users, Share2, Bookmark, ThumbsUp } from "lucide-react"

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
    embedUrl: "https://www.youtube-nocookie.com/embed/p33BYf1NDAE",
    openUrl: "https://www.youtube.com/watch?v=p33BYf1NDAE",
    description: "Learn the basics of fractions in this fun and interactive lesson. We'll explore what fractions are, how to read them, and where we see them in everyday life.",
    instructor: "Ms. Sarah Chen",
    lessons: ["What is a Fraction?", "Parts of a Fraction", "Comparing Fractions", "Practice Problems"]
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
    embedUrl: "https://www.youtube-nocookie.com/embed/Qd6nLM2QlWw",
    openUrl: "https://www.youtube.com/watch?v=Qd6nLM2QlWw",
    description: "Embark on an exciting journey through our solar system! Discover all 8 planets, learn about the sun, and find out what makes Earth special.",
    instructor: "Prof. James Wilson",
    lessons: ["The Sun - Our Star", "Inner Planets", "Outer Planets", "Moons and Asteroids"]
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
    embedUrl: "https://www.youtube-nocookie.com/embed/QN3YV0oK714",
    openUrl: "https://www.youtube.com/watch?v=QN3YV0oK714",
    description: "Unlock your creativity and learn how to write amazing stories! This lesson covers the essential elements of storytelling that every young writer should know.",
    instructor: "Emma Thompson",
    lessons: ["Story Elements", "Creating Characters", "Building a Plot", "Writing Your First Story"]
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
    embedUrl: "https://www.youtube-nocookie.com/embed/relVaxISDNM",
    openUrl: "https://www.youtube.com/watch?v=relVaxISDNM",
    description: "Travel around the world without leaving your seat! Learn about continents, countries, oceans, and the amazing diversity of our planet.",
    instructor: "Michael Roberts",
    lessons: ["Continents & Oceans", "Countries & Capitals", "Landforms", "World Cultures"]
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
    embedUrl: "https://www.youtube-nocookie.com/embed/eW2dRLyoyds",
    openUrl: "https://www.youtube.com/watch?v=eW2dRLyoyds",
    description: "Understand multiplication through patterns, equal groups, and quick tricks that make problem solving faster and easier.",
    instructor: "Mr. Daniel Lee",
    lessons: ["Equal Groups", "Times Tables", "Word Problems", "Speed Practice"]
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
    embedUrl: "https://www.dailymotion.com/embed/video/x61tmgr",
    openUrl: "https://www.dailymotion.com/video/x61tmgr",
    description: "Learn how plants and animals grow, survive, and depend on each other in different ecosystems.",
    instructor: "Dr. Olivia Green",
    lessons: ["Plant Parts", "Animal Habitats", "Food Chains", "Life Cycles"]
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
    embedUrl: "https://www.youtube-nocookie.com/embed/ca0kqITqYAc",
    openUrl: "https://www.youtube.com/watch?v=ca0kqITqYAc",
    description: "Build confidence in reading by learning how to find main ideas, details, and meaning from stories and passages.",
    instructor: "Ms. Priya Nair",
    lessons: ["Main Idea", "Supporting Details", "Context Clues", "Quick Quiz"]
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
    embedUrl: "https://www.youtube-nocookie.com/embed/relVaxISDNM",
    openUrl: "https://www.youtube.com/watch?v=relVaxISDNM",
    description: "Discover how to read maps, use directions, and understand symbols to explore places around the world.",
    instructor: "Mr. Kevin Brooks",
    lessons: ["Cardinal Directions", "Map Symbols", "Scale and Distance", "Using a Globe"]
  },
]

interface VideoViewProps {
  videoId: string
  onBack: () => void
  onSelectVideo: (videoId: string) => void
}

export function VideoView({ videoId, onBack, onSelectVideo }: VideoViewProps) {
  const video = videos.find(v => v.id === videoId)
  const [isPlaying, setIsPlaying] = useState(false)
  const pendingSecondsRef = useRef(0)

  useEffect(() => {
    setIsPlaying(false)
    pendingSecondsRef.current = 0
  }, [videoId])

  useEffect(() => {
    return () => {
      void flushPendingWatch(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  useEffect(() => {
    if (!video || !isPlaying) {
      return
    }

    const interval = window.setInterval(() => {
      pendingSecondsRef.current += 15
      const fullMinutes = Math.floor(pendingSecondsRef.current / 60)
      if (fullMinutes > 0) {
        pendingSecondsRef.current -= fullMinutes * 60
        void trackVideoByMinutes(fullMinutes, false)
      }
    }, 15000)

    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, videoId])

  const trackVideoByMinutes = async (watchedMinutesDelta: number, completed = false) => {
    if (!video) {
      return
    }

    if (watchedMinutesDelta <= 0 && !completed) {
      return
    }

    await fetch("/api/student/activity/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: video.id,
        title: video.title,
        subject: video.subject,
        watchedMinutesDelta,
        completed,
      }),
      keepalive: true,
    })
  }

  const flushPendingWatch = async (completed = false) => {
    const remainingSeconds = pendingSecondsRef.current
    pendingSecondsRef.current = 0

    const partialMinute = remainingSeconds > 0 ? 1 : 0
    await trackVideoByMinutes(partialMinute, completed)
  }

  const handleSelectRelatedVideo = async (nextVideoId: string) => {
    await flushPendingWatch(false)
    onSelectVideo(nextVideoId)
  }

  const handleBack = async () => {
    await flushPendingWatch(false)
    onBack()
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Video not found</h1>
          <Button onClick={onBack}>Back to Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => void handleBack()} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <span className="text-sm text-muted-foreground">{video.subject}</span>
              <h1 className="text-xl font-bold text-foreground">{video.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className={`relative aspect-video rounded-2xl bg-gradient-to-br ${video.thumbnail} overflow-hidden`}>
              {isPlaying ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`${video.embedUrl}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl">{video.icon}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      onClick={() => setIsPlaying(true)}
                      aria-label={`Play ${video.title}`}
                    >
                      <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                    </button>
                  </div>
                </>
              )}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {video.duration}
              </div>
            </div>

            {/* Video Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {video.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="font-medium text-foreground">{video.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{video.students.toLocaleString()} students</span>
                </div>
                <span>Instructor: {video.instructor}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{video.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full gap-2">
                <ThumbsUp className="w-4 h-4" />
                Like
              </Button>
              <Button variant="outline" className="rounded-full gap-2">
                <Bookmark className="w-4 h-4" />
                Save
              </Button>
              <Button variant="outline" className="rounded-full gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" className="rounded-full gap-2" asChild>
                <a href={video.openUrl} target="_blank" rel="noreferrer">
                  <Play className="w-4 h-4" />
                  Open Video
                </a>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Chapters */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Lesson Chapters</h3>
                <div className="space-y-3">
                  {video.lessons.map((lesson, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{lesson}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Videos */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">More Videos</h3>
                <div className="space-y-4">
                  {videos.filter(v => v.id !== videoId).slice(0, 3).map((relatedVideo, index) => (
                    <button
                      key={index}
                      onClick={() => void handleSelectRelatedVideo(relatedVideo.id)}
                      className="w-full flex gap-3 text-left rounded-lg p-1 hover:bg-muted transition-colors"
                    >
                      <div className={`w-20 h-14 rounded-lg bg-gradient-to-br ${relatedVideo.thumbnail} flex items-center justify-center shrink-0`}>
                        <span className="text-2xl">{relatedVideo.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2">{relatedVideo.title}</h4>
                        <p className="text-xs text-muted-foreground">{relatedVideo.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
