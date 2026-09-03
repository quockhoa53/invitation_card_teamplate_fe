export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'BIRTHDAY' | 'LOVE' | 'WEDDING' | 'CHILL' | 'CELEBRATION';
  categoryLabel: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  isPopular?: boolean;
}

export const SYSTEM_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'bday-1',
    title: 'Happy Birthday Romantic Piano',
    artist: 'Pixabay Acoustic Lab',
    category: 'BIRTHDAY',
    categoryLabel: '🎂 Sinh Nhật',
    duration: '2:15',
    coverUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
    isPopular: true,
  },
  {
    id: 'bday-2',
    title: 'Happy Birthday Party Beat',
    artist: 'Festive Vibes Studio',
    category: 'BIRTHDAY',
    categoryLabel: '🎂 Sinh Nhật',
    duration: '2:40',
    coverUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=happy-birthday-party-10497.mp3',
    isPopular: true,
  },
  {
    id: 'love-1',
    title: 'Acoustic Love Guitar & Strings',
    artist: 'Sweet Romance Music',
    category: 'LOVE',
    categoryLabel: '💖 Tình Yêu',
    duration: '2:30',
    coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=love-acoustic-guitar-10874.mp3',
    isPopular: true,
  },
  {
    id: 'love-2',
    title: 'Gentle Love & Warm Memories',
    artist: 'Piano For Lovers',
    category: 'LOVE',
    categoryLabel: '💖 Tình Yêu',
    duration: '3:10',
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3?filename=romantic-piano-124977.mp3',
    isPopular: true,
  },
  {
    id: 'wedding-1',
    title: 'Wedding Waltz Orchestral',
    artist: 'Royal Philharmonic',
    category: 'WEDDING',
    categoryLabel: '💍 Tiệc Cưới',
    duration: '3:05',
    coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3490fd38ea.mp3?filename=wedding-waltz-7212.mp3',
    isPopular: true,
  },
  {
    id: 'wedding-2',
    title: 'Beautiful In White (Violin & Piano)',
    artist: 'Orchestral Strings',
    category: 'WEDDING',
    categoryLabel: '💍 Tiệc Cưới',
    duration: '2:50',
    coverUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c0c20a44ef.mp3?filename=cinematic-wedding-melody-126296.mp3',
  },
  {
    id: 'chill-1',
    title: 'Cozy Morning Coffee Lofi',
    artist: 'Chillhop Records',
    category: 'CHILL',
    categoryLabel: '☕ Chill / Lofi',
    duration: '2:20',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-study-112191.mp3',
    isPopular: true,
  },
  {
    id: 'chill-2',
    title: 'Carefree Ukulele Joy',
    artist: 'Sunny Acoustic',
    category: 'CHILL',
    categoryLabel: '☕ Chill / Lofi',
    duration: '2:10',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e3d14.mp3?filename=ukulele-trip-version-60s-9893.mp3',
  },
  {
    id: 'celeb-1',
    title: 'Celebration Fireworks Beat',
    artist: 'Party Anthem EDM',
    category: 'CELEBRATION',
    categoryLabel: '🎉 Sự Kiện & Hội',
    duration: '2:45',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=celebration-10707.mp3',
  },
];
