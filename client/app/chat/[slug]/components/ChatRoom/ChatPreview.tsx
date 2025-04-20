// components/LinkPreview.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface LinkPreviewData {
  url: string;
  title?: string;
  siteName?: string;
  description?: string;
  images?: string[];
  favicon?: string;
}

interface LinkPreviewProps {
  url: string;
  className?: string;
}

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, className }) => {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/link-preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url]);

  useEffect(() => {
    // Fetches the link preview data when the URL prop changes
    const fetchData = async () => {
      try {
        const data = await fetch(`/api/link-preview?url=${url}`);

        setPreviewData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (loading) {
    return (
      <div
        className={`bg-gray-800 rounded-lg p-3 mt-2 w-full max-w-sm animate-pulse ${className}`}>
        <div className="h-32 bg-gray-700 rounded-t-lg"></div>
        <div className="p-3">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <a
        href={isValidUrl(url) ? url : "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-blue-400 hover:underline break-all ${className}`}>
        {url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-700 w-full max-w-sm ${className}`}>
      {(previewData.images ?? []).length > 0 && (
        <div className="relative h-32 overflow-hidden">
          {previewData.images && previewData.images.length > 0 && (
            <Image
              src={previewData.images[0]}
              alt={previewData.title || url}
              className="w-full h-full object-cover"
              fill
              onError={() => {
                console.error(
                  "Image failed to load:",
                  previewData.images?.[0] ?? "No image available"
                );
              }}
            />
          )}
        </div>
      )}
      <div className="p-3">
        {previewData.favicon && (
          <div className="flex items-center mb-2">
            <Image
              src={previewData.favicon}
              alt="favicon"
              className="w-4 h-4 mr-2"
              width={16}
              height={16}
              onError={() => {
                console.error("Favicon failed to load:", previewData.favicon);
              }}
            />
            <span className="text-xs text-gray-400 truncate">
              {previewData.siteName || new URL(url).hostname}
            </span>
          </div>
        )}
        {previewData.title && (
          <h3 className="font-medium text-sm text-white mb-1 line-clamp-2">
            {previewData.title}
          </h3>
        )}
        {previewData.description && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {previewData.description}
          </p>
        )}
      </div>
    </a>
  );
};

export const extractUrls = (text: string): string[] => {
  const urlRegex = /((https?:\/\/)?(www\.)?[^\s]+\.[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches
    .map((u) => (u.startsWith("http") ? u : `https://${u}`))
    .filter((url) => isValidUrl(url));
};

