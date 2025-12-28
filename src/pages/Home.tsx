import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostList from "../components/PostList";
import FeaturedCards from "../components/FeaturedCards";
import LogoMarquee from "../components/LogoMarquee";
import GitHubContributions from "../components/GitHubContributions";
import Footer from "../components/Footer";
import SocialFooter from "../components/SocialFooter";
import NewsletterSignup from "../components/NewsletterSignup";
import siteConfig from "../config/siteConfig";

// Local storage keys for preferences
const VIEW_MODE_KEY = "featured-view-mode";
const LANGUAGE_KEY = "language-filter";

// Pagination config
const POSTS_PER_PAGE = 5;

// Language filter type
type LanguageFilter = "all" | "en" | "ja";

export default function Home() {
  // Fetch published posts from Convex (only if showing on home)
  const posts = useQuery(
    api.posts.getAllPosts,
    siteConfig.postsDisplay.showOnHome ? {} : "skip",
  );

  // Fetch featured posts and pages from Convex (for list view)
  const featuredPosts = useQuery(api.posts.getFeaturedPosts);
  const featuredPages = useQuery(api.pages.getFeaturedPages);

  // State for view mode toggle (list or cards)
  const [viewMode, setViewMode] = useState<"list" | "cards">(
    siteConfig.featuredViewMode,
  );

  // State for language filter
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    if (savedViewMode === "list" || savedViewMode === "cards") {
      setViewMode(savedViewMode);
    }
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage === "all" || savedLanguage === "en" || savedLanguage === "ja") {
      setLanguageFilter(savedLanguage);
    }
  }, []);

  // Handle language filter change (reset to page 1)
  const handleLanguageChange = (lang: LanguageFilter) => {
    setLanguageFilter(lang);
    setCurrentPage(1);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  // Filter posts by language property
  const filteredPosts = posts?.filter((post) => {
    if (languageFilter === "all") return true;
    return post.language === languageFilter;
  });

  // Pagination calculations
  const totalPosts = filteredPosts?.length ?? 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts?.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Toggle view mode and save preference
  const toggleViewMode = () => {
    const newMode = viewMode === "list" ? "cards" : "list";
    setViewMode(newMode);
    localStorage.setItem(VIEW_MODE_KEY, newMode);
  };

  // Render logo gallery based on position config
  const renderLogoGallery = (position: "above-footer" | "below-featured") => {
    if (siteConfig.logoGallery.position === position) {
      return <LogoMarquee config={siteConfig.logoGallery} />;
    }
    return null;
  };

  // Build featured list for list view from Convex data
  const getFeaturedList = () => {
    if (featuredPosts === undefined || featuredPages === undefined) {
      return [];
    }

    // Combine posts and pages, sort by featuredOrder
    const combined = [
      ...featuredPosts.map((p) => ({
        title: p.title,
        slug: p.slug,
        featuredOrder: p.featuredOrder ?? 999,
      })),
      ...featuredPages.map((p) => ({
        title: p.title,
        slug: p.slug,
        featuredOrder: p.featuredOrder ?? 999,
      })),
    ];

    return combined.sort((a, b) => a.featuredOrder - b.featuredOrder);
  };

  const featuredList = getFeaturedList();
  const hasFeaturedContent = featuredList.length > 0;

  // Check if posts should be shown on homepage
  const showPostsOnHome = siteConfig.postsDisplay.showOnHome;

  return (
    <div className="home page-transition">
      {/* Hero banner image */}
      <div className="home-banner">
        <img src="/images/og-default.jpg" alt="Mountain landscape" />
      </div>

      {/* Site header */}
      <header className="home-header">
        <h1 className="home-name">Yuta Takasu</h1>
        <p className="home-bio">
          Thanks for stopping by. I'm an Executive Officer at <a href="https://www.atlas-tech.co.jp/" target="_blank" rel="noopener noreferrer">Atlas inc</a>, building <a href="https://www.eka.is/" target="_blank" rel="noopener noreferrer">Eka</a>—an AI publishing platform that frees the writer's mind. My writing might be messy and informal, but I love it. Writing clears my thoughts, and clarity brings confidence. I wanted a place to share what I learn and think, so here we are.
          <br /><br />
          初めまして。<a href="https://www.atlas-tech.co.jp/" target="_blank" rel="noopener noreferrer">Atlas株式会社</a>で執行役員をしながら、<a href="https://www.eka.is/" target="_blank" rel="noopener noreferrer">Eka</a>というAIパブリッシングツールを作っています。文章は拙いですが、書くことが好きです。書くと頭が整理されて、整理されると自信が湧いてくる。そんな気持ちで、学んだことや考えたことをここに残していこうと思います。
        </p>
        <div className="home-socials">
          <a href="https://x.com/YutaTakasu2" target="_blank" rel="noopener noreferrer">X</a>
          <span className="social-separator">·</span>
          <a href="https://www.linkedin.com/in/yuta-takasu-6a5845264/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </header>

      {/* Language filter tabs */}
      <div className="language-tabs">
        <button
          className={`language-tab ${languageFilter === "all" ? "active" : ""}`}
          onClick={() => handleLanguageChange("all")}
        >
          All
        </button>
        <button
          className={`language-tab ${languageFilter === "en" ? "active" : ""}`}
          onClick={() => handleLanguageChange("en")}
        >
          English
        </button>
        <button
          className={`language-tab ${languageFilter === "ja" ? "active" : ""}`}
          onClick={() => handleLanguageChange("ja")}
        >
          Japanese
        </button>
      </div>

      {/* Blog posts section - conditionally shown based on config */}
      {showPostsOnHome && (
        <section id="posts" className="home-posts">
          {paginatedPosts === undefined ? null : paginatedPosts.length === 0 ? (
            <p className="no-posts">No posts yet. Check back soon!</p>
          ) : (
            <>
              <PostList posts={paginatedPosts} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`pagination-page ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* GitHub contributions graph - above logo gallery */}
      {siteConfig.gitHubContributions?.enabled && (
        <GitHubContributions config={siteConfig.gitHubContributions} />
      )}

      {/* Logo gallery (above-footer position) */}
      {renderLogoGallery("above-footer")}

      {/* Newsletter signup (above-footer position) */}
      {siteConfig.newsletter?.enabled &&
        siteConfig.newsletter.signup.home.enabled &&
        siteConfig.newsletter.signup.home.position === "above-footer" && (
          <NewsletterSignup source="home" />
        )}

      {/* Footer section */}
      {siteConfig.footer.enabled && siteConfig.footer.showOnHomepage && (
        <Footer content={siteConfig.footer.defaultContent} />
      )}

      {/* Social footer section */}
      {siteConfig.socialFooter?.enabled &&
        siteConfig.socialFooter.showOnHomepage && <SocialFooter />}
    </div>
  );
}
