'use client';

import React, { useState } from 'react';
import {
  HubHeader,
  CategoryTabs,
  CardStack,
  SuggestionStack,
  type CardData,
} from '@/components/hub';
import type { Suggestion } from '@repo/core';

const mockCards: CardData[] = [
  {
    id: '1',
    type: 'message',
    title: 'Send project update',
    subtitle: 'Client follow-up',
    category: 'work',
    timestamp: 'Just now',
    recipient: 'John Doe',
    platform: 'whatsapp',
    priority: 'high',
  },
  {
    id: '2',
    type: 'approve',
    title: 'Approve expense request',
    subtitle: 'Marketing tools',
    category: 'finance',
    timestamp: '2h ago',
    priority: 'medium',
  },
];

// until backend is wired
const mockSuggestions: Suggestion[] = [];

export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<'tasks' | 'suggestions'>('tasks');

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <HubHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchFocused={isSearchFocused}
        onSearchFocus={() => setIsSearchFocused(true)}
        onSearchBlur={() => setIsSearchFocused(false)}
      />

<CategoryTabs
  activeCategory={activeCategory}
  onCategoryChange={(category) =>
    setActiveCategory(category as 'tasks' | 'suggestions')
  }
/>


      {activeCategory === 'tasks' ? (
        <CardStack
          cards={mockCards}
          activeCategory={activeCategory}
        />
      ) : (
        <SuggestionStack suggestions={mockSuggestions} />
      )}
    </main>
  );
}
