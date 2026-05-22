export default function BlogPage() {
  const posts = [
    {
      id: '1',
      title: 'Getting Started with Catalyx Labs',
      excerpt: 'Learn how to get started with our products and services.',
      date: '2024-05-10',
      author: 'John Doe',
    },
    {
      id: '2',
      title: 'Best Practices for Product Usage',
      excerpt: 'Tips and tricks to maximize the benefits of our products.',
      date: '2024-05-05',
      author: 'Jane Smith',
    },
    {
      id: '3',
      title: 'Company Announcements',
      excerpt: 'Latest news and updates from Catalyx Labs.',
      date: '2024-04-30',
      author: 'Admin',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <div className="text-gray-500 text-sm mb-4">
              <span>{post.date}</span> • <span>By {post.author}</span>
            </div>
            <p className="text-gray-700 mb-4">{post.excerpt}</p>
            <button className="text-catalyx-purple hover:text-opacity-80 font-semibold transition">
              Read More →
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
