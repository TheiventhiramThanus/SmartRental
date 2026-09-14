import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: '10 Essential Car Rental Tips for First-Time Renters',
      excerpt: 'Planning to rent a car for the first time? Here are essential tips to ensure a smooth rental experience, from booking to return.',
      image: 'https://images.unsplash.com/photo-1607261750900-00e36fe7f177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkcml2aW5nJTIwaGlnaHdheXxlbnwxfHx8fDE3Njg5NDA1MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Sarah Johnson',
      date: 'January 15, 2026',
      category: 'Rental Tips',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How IoT Technology is Revolutionizing Car Rentals',
      excerpt: 'Discover how Internet of Things (IoT) technology is transforming the car rental industry with real-time tracking and smart features.',
      image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhcnxlbnwxfHx8fDE3Njg5ODk2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Mike Chen',
      date: 'January 12, 2026',
      category: 'Technology',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Safe Driving Practices: A Complete Guide',
      excerpt: 'Stay safe on the road with our comprehensive guide to safe driving practices, from defensive driving to weather considerations.',
      image: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXYlMjBjYXJ8ZW58MXx8fHwxNzY4OTU5NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Emily Rodriguez',
      date: 'January 10, 2026',
      category: 'Safe Driving',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Top 5 Scenic Road Trips You Must Take This Year',
      excerpt: 'Pack your bags and hit the road! Explore breathtaking scenic routes perfect for your next road trip adventure.',
      image: 'https://images.unsplash.com/photo-1687993320725-c4c2708ef074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzY4OTYyNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'David Wilson',
      date: 'January 8, 2026',
      category: 'Travel Guides',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'Electric vs. Petrol Cars: Which Should You Rent?',
      excerpt: 'Comparing electric and petrol vehicles for your rental needs. Learn about costs, performance, and environmental impact.',
      image: 'https://images.unsplash.com/photo-1648178328042-b7c0f62e4181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3Njg5NjQ1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Sarah Johnson',
      date: 'January 5, 2026',
      category: 'Rental Tips',
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Understanding Your Rental Agreement: What to Look For',
      excerpt: 'Navigate rental agreements with confidence. Learn about key terms, coverage options, and what you need to know before signing.',
      image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY4OTczNjYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Mike Chen',
      date: 'January 3, 2026',
      category: 'Rental Tips',
      readTime: '6 min read'
    }
  ];

  const categories = ['All', 'Rental Tips', 'Safe Driving', 'Travel Guides', 'Technology'];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-center mb-4">Our Blog</h1>
          <p className="text-center text-primary-foreground/90 max-w-2xl mx-auto">
            Insights, tips, and guides for smarter car rentals and better travel experiences
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              className={category === 'All' ? 'bg-accent hover:bg-accent/90' : ''}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <img 
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              className="w-full h-full object-cover"
            />
            <CardContent className="p-8 flex flex-col justify-center">
              <div className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm mb-4 w-fit">
                Featured Post
              </div>
              <h2 className="mb-4">{blogPosts[0].title}</h2>
              <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
              <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{blogPosts[0].author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{blogPosts[0].date}</span>
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground w-fit">
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </div>
        </Card>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              <img 
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm mb-3 w-fit">
                  {post.category}
                </div>
                <h3 className="mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-4 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <Button variant="outline" className="w-full">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
              Get the latest rental tips, travel guides, and exclusive offers delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-foreground"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
