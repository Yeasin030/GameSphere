"use client";

import React, { useEffect, useState } from 'react';
import api from '../../../../lib/axios';

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await api.get(`/news/${params.slug}`);
        setArticle(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchArticle();
  }, [params.slug]);

  if (loading) return <div className="p-12 text-center">Loading article...</div>;
  if (!article) return <div className="p-12 text-center text-red-500">Article not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>
      <div className="text-sm text-muted-foreground">
        Published on {new Date(article.published_at).toLocaleDateString()} 
        {article.source && ` • Source: ${article.source.name}`}
      </div>
      
      <div className="prose prose-stone dark:prose-invert max-w-none">
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <p className="text-lg leading-relaxed">{article.summary}</p>
        )}
      </div>

      {article.url && (
        <div className="pt-8 border-t">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Read original article on {article.source?.name || 'source'}
          </a>
        </div>
      )}
    </div>
  );
}
