/**
 * Study Labs — Online E-Books & Digital Document Library Screen
 * Allows students to browse, search, download, read, and learn with AI from textbooks,
 * official syllabus manuals, and cyber security handbooks offline-first.
 */

import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EBookReaderModal } from '../components/ebooks/EBookReaderModal';
import { CURATED_EBOOKS } from '../data/ebooksData';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import type { EBook, EBookCategory, NavTab } from '../types';
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  Flame,
  HardDrive,
  Search,
  Sparkles,
  Star,
} from 'lucide-react-native';

interface EBooksScreenProps {
  onNavigate: (tab: NavTab) => void;
}

export const EBooksScreen: React.FC<EBooksScreenProps> = () => {
  const { colors, mode } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EBookCategory | 'all' | 'offline'>('all');
  const [books, setBooks] = useState<EBook[]>(CURATED_EBOOKS);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [activeReadingBook, setActiveReadingBook] = useState<EBook | null>(null);

  const categories: Array<{ id: EBookCategory | 'all' | 'offline'; label: string }> = [
    { id: 'all', label: 'All Catalog' },
    { id: 'offline', label: 'My Offline Bookshelf' },
    { id: 'jee_neet', label: 'JEE & NEET Handbooks' },
    { id: 'cyber_security', label: 'Cyber Defense & IT' },
    { id: 'computer_science', label: 'Computer Science' },
  ];

  const handleDownload = (bookId: string) => {
    if (downloadingIds[bookId] !== undefined) return;

    SoundManager.play('click');
    HapticManager.triggerSelection();

    // Animate fake download progress
    setDownloadingIds((prev) => ({ ...prev, [bookId]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadingIds((prev) => {
          const next = { ...prev };
          delete next[bookId];
          return next;
        });
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, isDownloaded: true } : b))
        );
        SoundManager.play('achievement');
        HapticManager.triggerSuccess();
      } else {
        setDownloadingIds((prev) => ({ ...prev, [bookId]: progress }));
      }
    }, 150);
  };

  const filteredBooks = books.filter((b) => {
    if (selectedCategory === 'offline' && !b.isDownloaded) return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'offline' && b.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const downloadedCount = books.filter((b) => b.isDownloaded).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {/* Header Hero Banner */}
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={[styles.heroIconBox, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
              <BookOpen size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  Digital E-Books & Reference Library
                </Text>
                <Badge label="AI Powered" variant="primary" size="sm" />
              </View>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Browse official syllabus blueprints, STEM textbooks & cyber security handbooks with built-in AI tutor
              </Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.statsRow}>
            <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.text }]}>{books.length}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Digital Books</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.primary }]}>{downloadedCount}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Offline Books</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Flame size={14} color={colors.warning} />
                <Text style={[styles.statVal, { color: colors.text }]}>100%</Text>
              </View>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Free Offline</Text>
            </View>
          </View>
        </Card>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Search size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search books, NCERT chapters, topics, author, tags..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                focusable={false}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  HapticManager.triggerSelection();
                }}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: active ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Books List Grid */}
        <View style={{ gap: 12 }}>
          {filteredBooks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <BookMarked size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Books Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {selectedCategory === 'offline'
                  ? 'Your offline bookshelf is empty. Tap "Download" on any book to read it completely offline!'
                  : `No books matching "${searchQuery}". Try different keywords.`}
              </Text>
            </Card>
          ) : (
            filteredBooks.map((book) => {
              const dlProg = downloadingIds[book.id];
              const isDl = book.isDownloaded;

              return (
                <Card key={book.id} style={styles.bookCard}>
                  <View style={styles.bookCardRow}>
                    {/* Book Cover Visual Box */}
                    <View
                      style={[
                        styles.coverBox,
                        {
                          backgroundColor:
                            book.category === 'cyber_security'
                              ? '#064E3B'
                              : book.category === 'jee_neet'
                              ? '#7C2D12'
                              : '#1E1B4B',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Image
                        source={require('../../assets/branding/default-book-cover.png')}
                        style={styles.coverImage}
                        resizeMode="cover"
                      />
                      <View style={styles.coverOverlay}>
                        <FileText size={18} color="#FFFFFF" />
                        <Text style={styles.coverTag} numberOfLines={1}>
                          {book.subject.split(',')[0]}
                        </Text>
                      </View>
                    </View>

                    {/* Book Metadata Column */}
                    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <Badge
                          label={
                            book.category === 'cyber_security'
                              ? 'Cyber Defense'
                              : book.category === 'jee_neet'
                              ? 'JEE / NEET'
                              : 'Computer Science'
                          }
                          variant={book.category === 'cyber_security' ? 'success' : 'primary'}
                          size="sm"
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>
                            {book.rating}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.bookCardTitle, { color: colors.text }]} numberOfLines={2}>
                        {book.title}
                      </Text>

                      <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                        {book.author} · {book.publisher}
                      </Text>

                      <Text style={[styles.bookDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {book.description}
                      </Text>

                      {/* Specs Row */}
                      <View style={styles.specsRow}>
                        <Text style={[styles.specText, { color: colors.textSecondary }]}>
                          {book.totalPages} pages
                        </Text>
                        <Text style={[styles.specDot, { color: colors.textSecondary }]}>·</Text>
                        <Text style={[styles.specText, { color: colors.textSecondary }]}>
                          {book.fileSizeFormatted}
                        </Text>
                        <Text style={[styles.specDot, { color: colors.textSecondary }]}>·</Text>
                        <Text style={[styles.specText, { color: colors.primary, fontWeight: '700' }]}>
                          {book.chapters.length} Chapters
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                    <Button
                      title="Read Online"
                      variant="primary"
                      size="sm"
                      icon={<BookOpen size={14} color="#FFFFFF" />}
                      onPress={() => {
                        setActiveReadingBook(book);
                        SoundManager.play('click');
                        HapticManager.triggerSelection();
                      }}
                      style={{ flex: 1 }}
                    />

                    {isDl ? (
                      <View style={[styles.downloadedBadge, { borderColor: colors.success }]}>
                        <CheckCircle2 size={13} color={colors.success} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>
                          Offline Ready
                        </Text>
                      </View>
                    ) : dlProg !== undefined ? (
                      <View style={[styles.downloadingBox, { borderColor: colors.primary }]}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                          Downloading {dlProg}%
                        </Text>
                      </View>
                    ) : (
                      <Button
                        title="Download"
                        variant="outline"
                        size="sm"
                        icon={<Download size={14} color={colors.text} />}
                        onPress={() => handleDownload(book.id)}
                      />
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Reader Modal */}
      {activeReadingBook && (
        <EBookReaderModal
          visible={Boolean(activeReadingBook)}
          book={activeReadingBook}
          onClose={() => setActiveReadingBook(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 14, gap: 12, paddingBottom: 30 },
  heroCard: { padding: 14, gap: 12 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 15, fontWeight: '900' },
  heroSubtitle: { fontSize: 11.5, marginTop: 2, lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statTile: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: { fontSize: 14, fontWeight: '900' },
  statLbl: { fontSize: 10, marginTop: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 13, height: '100%' },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
  },
  categoryPillText: { fontSize: 11.5, fontWeight: '700' },
  bookCard: { padding: 12, gap: 10 },
  bookCardRow: { flexDirection: 'row', gap: 12 },
  coverBox: {
    width: 76,
    height: 108,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 4,
  },
  coverTag: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  bookCardTitle: { fontSize: 13.5, fontWeight: '800', lineHeight: 18 },
  bookAuthor: { fontSize: 11, fontWeight: '600' },
  bookDesc: { fontSize: 11, lineHeight: 15 },
  specsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  specText: { fontSize: 10.5 },
  specDot: { fontSize: 10 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  downloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  downloadingBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptySub: { fontSize: 12, textAlign: 'center', maxWidth: 300 },
});
