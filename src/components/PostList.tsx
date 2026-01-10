import { Link } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";

interface Post {
  _id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime?: string;
  tags: string[];
  excerpt?: string;
  image?: string;
}

interface PostListProps {
  posts: Post[];
  viewMode?: "list" | "cards";
  columns?: 2 | 3; // Number of columns for card view (default: 3)
  showExcerpts?: boolean; // Show excerpts in card view (default: true)
}

export default function PostList({
  posts,
  viewMode = "list",
  columns = 3,
  showExcerpts = true,
}: PostListProps) {
  const formatPostDate = (dateString: string) => {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return dateString;
    return format(parsed, "yyyy MM dd");
  };

  // Sort posts by date descending
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Card view: render all posts in a grid
  if (viewMode === "cards") {
    // Apply column class for 2 or 3 columns
    const cardGridClass =
      columns === 2 ? "post-cards post-cards-2col" : "post-cards";
    return (
      <div className={cardGridClass}>
        {sortedPosts.map((post) => (
          <Link key={post._id} to={`/${post.slug}`} className="post-card">
            {/* Thumbnail image displayed as square using object-fit: cover */}
            {post.image && (
              <div className="post-card-image-wrapper">
                <img
                  src={post.image}
                  alt={post.title}
                  className="post-card-image"
                  loading="lazy"
                />
              </div>
            )}
            <div className="post-card-content">
              <h3 className="post-card-title">{post.title}</h3>
              {/* Only show excerpt if showExcerpts is true */}
              {showExcerpts && (post.excerpt || post.description) && (
                <p className="post-card-excerpt">
                  {post.excerpt || post.description}
                </p>
              )}
              <div className="post-card-meta">
                <span className="post-card-date">
                  {formatPostDate(post.date)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // List view: flat list sorted by date
  return (
    <div className="post-list">
      <ul className="posts">
        {sortedPosts.map((post) => (
          <li key={post._id} className="post-item">
            <Link to={`/${post.slug}`} className="post-link">
              <span className="post-title">{post.title}</span>
              <span className="post-meta">
                <span className="post-date">
                  {formatPostDate(post.date)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
