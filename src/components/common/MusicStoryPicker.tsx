import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SYSTEM_MUSIC_TRACKS, MusicTrack } from '../../data/musicTracks';
import {
  Music,
  Play,
  Pause,
  Search,
  Check,
  Volume2,
  Sparkles,
  Link as LinkIcon,
  Flame,
  Radio,
  X,
} from 'lucide-react';

interface MusicStoryPickerProps {
  selectedMusicUrl?: string;
  selectedMusicTitle?: string;
  onSelectMusic: (url: string, title: string) => void;
}

export const MusicStoryPicker: React.FC<MusicStoryPickerProps> = ({
  selectedMusicUrl = '',
  selectedMusicTitle = '',
  onSelectMusic,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Audio Preview Player State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePreview = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(track.audioUrl);
      newAudio.volume = 0.7;
      newAudio.play().catch((e) => console.log('Audio autoplay error:', e));
      newAudio.onended = () => setPlayingTrackId(null);
      audioRef.current = newAudio;
      setPlayingTrackId(track.id);
    }
  };

  const handlePreviewCustomUrl = (url: string) => {
    if (!url.trim()) return;
    if (playingTrackId === 'custom') {
      if (audioRef.current) audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const newAudio = new Audio(url.trim());
      newAudio.volume = 0.7;
      newAudio.play().catch(() => alert('Không thể phát file nhạc từ đường link này. Vui lòng kiểm tra lại URL MP3.'));
      newAudio.onended = () => setPlayingTrackId(null);
      audioRef.current = newAudio;
      setPlayingTrackId('custom');
    }
  };

  const handleChooseTrack = (track: MusicTrack) => {
    onSelectMusic(track.audioUrl, track.title);
  };

  const categories = [
    { id: 'ALL', label: 'Tất Cả', icon: '✨' },
    { id: 'POPULAR', label: 'Thịnh Hành', icon: '🔥' },
    { id: 'BIRTHDAY', label: 'Sinh Nhật', icon: '🎂' },
    { id: 'LOVE', label: 'Tình Yêu', icon: '✨' },
    { id: 'WEDDING', label: 'Tiệc Cưới', icon: '💍' },
    { id: 'CHILL', label: 'Chill / Lofi', icon: '☕' },
  ];

  const filteredTracks = SYSTEM_MUSIC_TRACKS.filter((track) => {
    if (activeCategory === 'POPULAR' && !track.isPopular) return false;
    if (activeCategory !== 'ALL' && activeCategory !== 'POPULAR' && track.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Find currently selected track metadata
  const currentTrack = SYSTEM_MUSIC_TRACKS.find((t) => t.audioUrl === selectedMusicUrl);

  return (
    <div className="space-y-4">
      {/* Active Selected Song Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-slate-900 border-orange-500/30 shadow-lg'
          : 'bg-gradient-to-r from-orange-50 via-amber-50 to-amber-50/60 border-orange-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-orange-500/30 shadow-md">
              <img
                src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                alt="cover"
                className="w-full h-full object-cover"
              />
              {playingTrackId && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-0.5">
                  <div className="w-1 h-4 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-6 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-500">
                <Radio className="w-3 h-3 animate-pulse" /> Bài hát đang chọn
              </span>
              <h4 className="font-editorial text-sm sm:text-base font-bold truncate leading-tight">
                {currentTrack?.title || selectedMusicTitle || (selectedMusicUrl ? 'Nhạc Tùy Chỉnh (Custom Link)' : 'Chưa Chọn Bài Hát')}
              </h4>
              <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                {currentTrack?.artist || (selectedMusicUrl ? selectedMusicUrl : 'Hãy chọn một bài hát du dương bên dưới')}
              </p>
            </div>
          </div>

          {selectedMusicUrl && (
            <button
              type="button"
              onClick={() => {
                if (currentTrack) {
                  handleTogglePreview(currentTrack);
                } else {
                  handlePreviewCustomUrl(selectedMusicUrl);
                }
              }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:brightness-110 active:scale-95 transition shrink-0"
              title={playingTrackId ? 'Tạm dừng nghe thử' : 'Nghe thử bài hát'}
            >
              {playingTrackId ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Story-Style Music Selector Search & Filter */}
      <div className={`p-4 rounded-2xl border space-y-3.5 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
            <Music className="w-4 h-4" /> Kho Nhạc Không Bản Quyền Tuyển Chọn (Story Style)
          </div>

          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
              showCustomInput
                ? 'bg-orange-500 text-white border-orange-500'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showCustomInput ? 'Chọn Trong Kho' : 'Nhập Link Riêng'}</span>
          </button>
        </div>

        {showCustomInput ? (
          /* Custom MP3 URL Input Option */
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}>
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
              Dán đường link trực tiếp file nhạc MP3 của bạn:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/audio/my-song.mp3"
                className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                    : 'bg-white border-stone-200 text-stone-900 focus:border-orange-500'
                }`}
              />
              <button
                type="button"
                onClick={() => handlePreviewCustomUrl(customUrlInput)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1"
                title="Nghe thử link"
              >
                {playingTrackId === 'custom' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Nghe Thử</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customUrlInput.trim()) {
                    onSelectMusic(customUrlInput.trim(), 'Nhạc Tùy Chỉnh');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition active:scale-95"
              >
                Áp Dụng
              </button>
            </div>
          </div>
        ) : (
          /* Story Music Picker List */
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài hát, nghệ sĩ (ví dụ: Birthday, Piano, Lofi, Guitar)..."
                className={`w-full pl-8.5 pr-8 py-2 rounded-xl border text-xs focus:outline-none transition ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-orange-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 shadow-inner'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 flex items-center gap-1 shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                        : isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Song Cards List (Instagram / FB Story Style) */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredTracks.map((track) => {
                const isSelected = selectedMusicUrl === track.audioUrl;
                const isPlaying = playingTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                      isSelected
                        ? isDark
                          ? 'bg-orange-950/30 border-orange-500/60 shadow-md'
                          : 'bg-orange-50/90 border-orange-300 shadow-sm'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                        : 'bg-white border-stone-200 hover:border-orange-200 hover:bg-stone-50'
                    }`}
                  >
                    {/* Album Art with Play Overlay */}
                    <div
                      onClick={() => handleTogglePreview(track)}
                      className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer shadow group/art"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover/art:scale-110 transition duration-300"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center transition ${
                        isPlaying ? 'bg-black/60 opacity-100' : 'bg-black/40 opacity-0 group-hover/art:opacity-100'
                      }`}>
                        {isPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <div className="w-1 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1 h-2.5 bg-amber-400 rounded-full animate-bounce" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Track Info */}
                    <div
                      onClick={() => handleChooseTrack(track)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <h5 className={`font-editorial text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-orange-500' : ''
                        }`}>
                          {track.title}
                        </h5>
                        {track.isPopular && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold shrink-0">
                            HOT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] opacity-70 mt-0.5">
                        <span>{track.artist}</span>
                        <span>•</span>
                        <span>{track.duration}</span>
                        <span>•</span>
                        <span>{track.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Actions: Play Preview & Select */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePreview(track)}
                        className={`p-2 rounded-xl transition active:scale-95 ${
                          isPlaying
                            ? 'bg-orange-500 text-white shadow-sm'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                        title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChooseTrack(track)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-500'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Đã Chọn
                          </>
                        ) : (
                          'Chọn'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTracks.length === 0 && (
                <div className={`p-6 text-center text-xs rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}>
                  Không tìm thấy bài hát nào khớp với từ khóa "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
