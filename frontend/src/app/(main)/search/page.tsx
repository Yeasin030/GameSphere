"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../../lib/axios';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any>({ users: [], games: [], groups: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: searchQuery } });
      setResults(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
    // Optionally update URL with Next.js router
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Search GameSphere</h1>
        <form onSubmit={onSubmit} className="flex max-w-2xl mx-auto gap-2">
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search for users, games, or groups..." 
            className="flex-1"
          />
          <Button type="submit" isLoading={loading}>Search</Button>
        </form>
      </div>

      <div className="space-y-8">
        {/* Games Results */}
        {results.games?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {results.games.map((game: any) => (
                <Link key={game.id} href={`/games/${game.slug}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader className="p-4"><CardTitle className="text-md line-clamp-1">{game.title}</CardTitle></CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Users Results */}
        {results.users?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.users.map((user: any) => (
                <Link key={user.id} href={`/profile/${user.username}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && query && results.users?.length === 0 && results.games?.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-8 px-4 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
