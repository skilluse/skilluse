"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

// Always use production URL for sharing to avoid hydration mismatch
const SITE_URL = "https://skilluse.dev";

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = `${SITE_URL}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/s\ring/share-offsite/?url=${encodedUrl}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm text-muted-foreground">Share this post</p>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Twitter className="size-4" />
        <span>Twitter</span>
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Linkedin className="size-4" />
        <span>LinkedIn</span>
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? (
          <>
            <Check className="size-4 text-green-500" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="size-4" />
            <span>Copy link</span>
          </>
        )}
      </button>
    </div>
  );
}
