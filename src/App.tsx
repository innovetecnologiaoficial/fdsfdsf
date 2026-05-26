import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  Radio,
  Heart,
  Volume2,
  VolumeX,
  ShieldAlert,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Music,
  Clock,
  Send,
  Sparkles,
  MapPin,
  Megaphone,
  ExternalLink,
} from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl: string;
}

const topSongs = [
  {
    id: "01",
    title: 'Gusttavo Lima - Retrovisor | DVD "Feito à Mão"',
    image:
      "https://gusttavolima.com.br/wp-content/uploads/2026/02/feitoamao-vol-1.png",
  },
  {
    id: "02",
    title: "Luan Santana - OLHO MARROM (Ao Vivo em Lisboa)",
    image:
      "https://akamai.sscdn.co/uploadfile/letras/fotos/6/e/4/9/6e491e984b0c1185f4f80ba2102533eb.jpg",
  },
  {
    id: "03",
    title: "Henrique e Juliano - SEJA EX (Manifesto Musical 2)",
    image:
      "https://s2-oglobo.glbimg.com/J_2hss6ZHpV869-cOaAeEylQoDg=/0x0:1280x702/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_da025474c0c44edd99332dddb09cabe8/internal_photos/bs/2022/d/O/3FoGXxQ9KIqLFuc53XZg/99200009-sx-rio-de-janeiro-rj-20-05-2022-henrique-e-juliano-foto-flaney-universal-music-di.jpg",
  },
  {
    id: "04",
    title: "Grupo Menos É Mais, Simone Mendes - P do Pecado (Ao Vivo...",
    image:
      "https://akamai.sscdn.co/uploadfile/letras/fotos/1/c/d/9/1cd919356bf090366e52f2a0690718a4.jpg",
  },
];

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    fill="currentColor"
    {...props}
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const PlayStoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}
  >
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
  </svg>
);

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // States for Volume and Controls
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // States for Club VIP form
  const [clubeName, setClubeName] = useState("");
  const [clubeEmail, setClubeEmail] = useState("");
  const [clubePhone, setClubePhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Phone input formatting mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    let formatted = rawValue;
    if (rawValue.length > 0) {
      formatted = `(${rawValue.substring(0, 2)}`;
    }
    if (rawValue.length > 2) {
      formatted += `) ${rawValue.substring(2, 7)}`;
    }
    if (rawValue.length > 7) {
      formatted += `-${rawValue.substring(7, 11)}`;
    }
    setClubePhone(formatted);
  };

  const handleClubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubeEmail || !clubePhone) {
      return;
    }

    setIsSubmitting(true);

    // Dynamic professional whatsapp messages
    const nameStr = clubeName ? `\n👤 *Nome:* ${clubeName}` : "";
    const message = `✨ *Novo Cadastro - VIP Clube FM Criciúma* ✨${nameStr}\n📧 *E-mail:* ${clubeEmail}\n📱 *WhatsApp:* ${clubePhone}\n\nQuero participar das promoções e concorrer a prêmios! 🎁`;
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/5548991423040?text=${encodedMessage}`;

    // Smooth timing feedback
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = waUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();

      // Clear states & inputs
      setClubeName("");
      setClubeEmail("");
      setClubePhone("");
      setIsSubmitting(false);
    }, 1800);
  };

  // Syncing volume level and mute toggles with audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, isPlaying]);

  // Weather States
  const [weather, setWeather] = useState<{
    temp: number;
    apparentTemp: number;
    humidity: number;
    windSpeed: number;
    isDay: boolean;
    code: number;
    time: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  const fetchWeather = async () => {
    try {
      setIsRefreshingWeather(true);
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-28.6775&longitude=-49.3697&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=America/Sao_Paulo",
      );
      if (!res.ok) throw new Error("Erro ao buscar clima");
      const data = await res.json();

      const current = data.current;
      setWeather({
        temp: Math.round(current.temperature_2m),
        apparentTemp: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        isDay: current.is_day === 1,
        code: current.weather_code,
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setWeatherError(false);
    } catch (e) {
      console.error("Open-Meteo failed, using fallback:", e);
      setWeatherError(true);
      if (!weather) {
        setWeather({
          temp: 22,
          apparentTemp: 23,
          humidity: 78,
          windSpeed: 12,
          isDay: true,
          code: 2,
          time: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    } finally {
      setWeatherLoading(false);
      setIsRefreshingWeather(false);
    }
  };

  const getWeatherCondition = (code: number) => {
    switch (code) {
      case 0:
        return {
          text: "Céu Limpo",
          icon: "Sun",
          color: "text-amber-500 bg-amber-500/10",
          bgGradient: "from-amber-500/10 to-orange-500/5",
        };
      case 1:
      case 2:
        return {
          text: "Parcialmente Nublado",
          icon: "CloudSun",
          color: "text-sky-400 bg-sky-500/10",
          bgGradient: "from-sky-500/10 to-indigo-500/5",
        };
      case 3:
        return {
          text: "Encoberto",
          icon: "Cloud",
          color: "text-slate-400 bg-slate-550/10",
          bgGradient: "from-slate-500/10 to-zinc-500/5",
        };
      case 45:
      case 48:
        return {
          text: "Nevoeiro/Neblina",
          icon: "Cloud",
          color: "text-zinc-400 bg-zinc-400/10",
          bgGradient: "from-zinc-500/10 to-slate-500/5",
        };
      case 51:
      case 53:
      case 55:
        return {
          text: "Garoa Fina",
          icon: "CloudDrizzle",
          color: "text-teal-400 bg-teal-500/10",
          bgGradient: "from-teal-500/10 to-cyan-500/5",
        };
      case 61:
      case 63:
      case 65:
        return {
          text: "Chuva Fina",
          icon: "CloudRain",
          color: "text-blue-400 bg-blue-500/10",
          bgGradient: "from-blue-500/10 to-indigo-500/5",
        };
      case 80:
      case 81:
      case 82:
        return {
          text: "Pancadas de Chuva",
          icon: "CloudRain",
          color: "text-blue-500 bg-blue-600/10",
          bgGradient: "from-blue-600/10 to-violet-500/5",
        };
      case 95:
        return {
          text: "Chuva com Trovoadas",
          icon: "CloudLightning",
          color: "text-purple-500 bg-purple-650/15",
          bgGradient: "from-purple-600/15 to-indigo-500/5",
        };
      default:
        return {
          text: "Tempo Estável",
          icon: "Sun",
          color: "text-amber-500 bg-amber-500/10",
          bgGradient: "from-amber-500/10 to-orange-500/5",
        };
    }
  };

  const renderWeatherIcon = (
    iconName: string,
    className: string = "w-10 h-10",
  ) => {
    switch (iconName) {
      case "Sun":
        return (
          <Sun
            className={`${className} text-amber-500 animate-spin [animation-duration:20s]`}
          />
        );
      case "CloudSun":
        return <CloudSun className={`${className} text-sky-400`} />;
      case "Cloud":
        return <Cloud className={`${className} text-slate-400`} />;
      case "CloudDrizzle":
        return <CloudDrizzle className={`${className} text-teal-400`} />;
      case "CloudRain":
        return <CloudRain className={`${className} text-blue-400`} />;
      case "CloudLightning":
        return (
          <CloudLightning
            className={`${className} text-purple-400 animate-pulse`}
          />
        );
      default:
        return <Sun className={`${className} text-amber-500`} />;
    }
  };

  // In a real scenario, this would be the actual stream URL!
  const STREAM_URL = "https://servidor39-5.brlogic.com:8902/live";

  useEffect(() => {
    fetch("/api/news")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar notícias");
        return res.json();
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    fetchWeather();

    // Attempt to autoplay
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Autoplay prevent by browser:", err);
        });
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-16">
        {/* Hero Section / Player */}
        <section className="relative text-white flex flex-col items-center justify-center overflow-hidden min-h-[50vh] py-6 md:py-10">
          {/* YouTube Video Background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#663b86] z-0 overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/3KkCoYA40Ck?autoplay=1&mute=1&loop=1&controls=0&disablekb=1&playsinline=1&playlist=3KkCoYA40Ck&start=90&modestbranding=1&rel=0&iv_load_policy=3"
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 scale-[1.3] md:scale-[1.5] opacity-50 mix-blend-overlay"
              allow="autoplay; encrypted-media"
            ></iframe>
            {/* Color Overlay & Fade out */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#663b86]/95 via-[#663b86]/80 to-[#ff3e5e]/80"></div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-2 relative z-10 w-full px-5 flex flex-col items-center">
            <div className="w-full flex justify-center mb-0 md:mb-2">
              <img
                src="https://i.postimg.cc/tTQxJ0qH/Chat-GPT-Image-25-de-mai-de-2026-21-40-34-removebg-preview.png"
                alt="Clube 87.9 FM"
                className="h-24 sm:h-28 md:h-[10rem] w-auto object-contain drop-shadow-2xl animate-heartbeat scale-110 md:scale-125 origin-center"
              />
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-[900] tracking-tighter drop-shadow-2xl"
              style={{ textShadow: "0 8px 15px rgba(0,0,0,0.4)" }}
            >
              A sua rádio favorita <br /> em Criciúma!
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium drop-shadow-md pb-4 md:pb-6">
              A Rádio Clube FM Criciúma leva até você a melhor programação de
              Santa Catarina. Sucessos, prêmios e muita alegria o dia todo!
            </p>

            <button
              onClick={togglePlay}
              className="mt-2 md:mt-6 relative inline-flex items-center justify-center group w-[90%] sm:w-auto"
            >
              <div className="absolute inset-0 bg-[#fce315]/30 rounded-full animate-ping group-hover:bg-[#fce315]/40 transition-all duration-300"></div>
              <div className="relative bg-[#fce315] text-[#663b86] group-hover:bg-[#ffe83b] group-hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 pr-8 pl-6 py-4 md:pr-10 md:pl-8 md:py-5 rounded-full shadow-2xl font-[900] text-base md:text-xl uppercase tracking-wider w-full">
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current shrink-0" />
                    <span>Pausar Rádio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 md:w-8 md:h-8 fill-current shrink-0" />
                    <span>Ouvir ao Vivo</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </section>

         {/* Top 4 Mais Tocadas */}
        <section id="hits" className="max-w-7xl mx-auto px-4 py-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Top Hits da Rádio Clube FM Criciúma
            </h2>
            <div className="flex space-x-2">
              <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:text-[#ff3e5e] hover:border-[#ff3e5e] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-800 hover:text-[#ff3e5e] hover:border-[#ff3e5e] transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topSongs.map((song) => (
              <div key={song.id} className="group cursor-pointer">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-200 mb-4 relative">
                  <img
                    src={song.image}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 mt-1">
                  <span className="text-5xl md:text-6xl font-black text-[#ff3e5e] leading-none shrink-0 tracking-tighter mt-1">
                    {song.id}
                  </span>
                  <div>
                    <h3 className="text-slate-600 font-medium text-sm md:text-base leading-snug pt-1">
                      {song.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>



        {/* App Download Section */}
        <section
          id="app"
          className="max-w-5xl mx-auto px-4 py-16 md:py-24 mb-12"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#5c337c] via-[#713172] to-[#ff3e5e] px-8 py-16 md:py-20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 min-h-[420px]">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-[20rem] h-[20rem] bg-[#fce315]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[25rem] h-[25rem] bg-[#fce315]/10 rounded-full blur-3xl"></div>

            {/* Background Image on Right Side */}
            <div className="absolute right-0 bottom-0 top-0 w-full md:w-5/12 z-0 pointer-events-none select-none">
              <div
                className="w-full h-full bg-contain bg-right-bottom bg-no-repeat opacity-35 md:opacity-85 lg:opacity-100 transition-opacity duration-300"
                style={{
                  backgroundImage:
                    "url('https://i.postimg.cc/52kCLYmR/Chat-GPT-Image-25-de-mai-de-2026-22-27-14.png')",
                  filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.3))",
                }}
              ></div>
            </div>

            {/* Content Left Side */}
            <div className="relative z-10 max-w-xl flex flex-col items-center md:items-start text-center md:text-left w-full md:w-7/12">
              <h2 className="text-3xl sm:text-4xl md:text-[40px] font-[900] text-white leading-[1.2] mb-5 tracking-tight drop-shadow-sm">
                Leve a nossa energia <br />
                <span className="text-[#fce315]">no seu bolso.</span>
              </h2>

              <p className="text-white/95 text-sm md:text-base leading-relaxed mb-8 max-w-lg font-medium drop-shadow-sm">
                Ondas de alegria direto no seu smartphone. Baixe o App da Rádio
                Clube FM Criciúma e acompanhe a melhor rádio onde quer que você
                vá!
              </p>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 w-full sm:w-auto">
                <a
                  href="#"
                  className="group relative overflow-hidden flex items-center justify-center space-x-3 px-8 py-4 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 w-full sm:w-[210px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
                >
                  <AppleIcon className="w-7 h-7 text-[#1d1d1f] group-hover:scale-110 transition-transform duration-300" />
                  <div className="flex flex-col items-start pt-0.5">
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider leading-none mb-1 uppercase">
                      Baixar na
                    </span>
                    <span className="text-[#1d1d1f] font-black text-[15px] tracking-wide leading-none">
                      App Store
                    </span>
                  </div>
                </a>

                <a
                  href="https://play.google.com/store/apps/details?id=net.webappradio.radioclubecriciuma&hl=pt_BR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden flex items-center justify-center space-x-4 px-8 py-4 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 w-full sm:w-[210px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
                >
                  <PlayStoreIcon className="w-6 h-6 text-[#1d1d1f] group-hover:scale-110 transition-transform duration-300" />
                  <div className="flex flex-col items-start pt-0.5">
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider leading-none mb-1 uppercase">
                      Disponível no
                    </span>
                    <span className="text-[#1d1d1f] font-black text-[15px] tracking-wide leading-none">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Previsão do Tempo Criciúma Section */}
        <section id="previsao" className="max-w-7xl mx-auto px-4 pt-12 -mb-8">
          <div className="bg-gradient-to-r from-[#5c337c]/5 to-[#ff3e5e]/5 border border-slate-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(46,21,66,0.03)] backdrop-blur-3xl relative overflow-hidden">
            {/* Background absolute decor glow */}
            <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#fce315]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full md:w-auto">
              {/* Thermometer / Condition circular highlight */}
              <div className="flex items-center justify-center shrink-0 select-none">
                {weather ? (
                  renderWeatherIcon(
                    getWeatherCondition(weather.code).icon,
                    "w-14 h-14 drop-shadow-sm",
                  )
                ) : (
                  <Sun className="w-14 h-14 text-amber-500 animate-spin [animation-duration:20s]" />
                )}
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5c337c]/10 text-[#5c337c] text-xs font-extrabold rounded-full tracking-wider uppercase">
                    Clima Criciúma
                  </span>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-2 tracking-tight">
                  Estação de Monitoramento
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Informações meteorológicas em tempo real para a região
                  carbonífera
                </p>
              </div>
            </div>

            {/* Weather values card */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6 w-full md:w-auto z-10">
              {weatherLoading ? (
                <div className="flex items-center gap-3 py-4 px-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[#ff3e5e] animate-spin"></div>
                  <span className="text-sm font-semibold text-slate-500 font-medium">
                    Buscando temperatura atual...
                  </span>
                </div>
              ) : weather ? (
                <>
                  {/* Temp Main Badge */}
                  <div className="bg-white hover:bg-slate-50/50 hover:scale-102 transition-all duration-300 p-4 px-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-black text-[#ff3e5e] leading-none select-none tracking-tighter">
                        {weather.temp}°C
                      </span>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                        Criciúma SC
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-800">
                          {getWeatherCondition(weather.code).text}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                        Sensação:{" "}
                        <span className="text-slate-700 font-bold">
                          {weather.apparentTemp}°C
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Humidity Info Badge */}
                  <div className="bg-white/80 p-4 px-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center gap-1 min-w-[120px] text-center sm:text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      Umidade
                    </span>
                    <span className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">
                      {weather.humidity}%
                    </span>
                  </div>

                  {/* Manual trigger refresh button */}
                  <button
                    onClick={fetchWeather}
                    disabled={isRefreshingWeather}
                    className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 text-slate-400 hover:text-[#ff3e5e] flex items-center justify-center border border-slate-100 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                    title="Atualizar Clima"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${isRefreshingWeather ? "animate-spin text-[#ff3e5e]" : "group-hover:rotate-180 transition-transform duration-500"}`}
                    />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        {/* Portal Vitrine do Sul - RSS News */}
        <section id="noticias" className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-[32px] md:text-[40px] font-black text-[#5c3e7b] flex items-center space-x-3 tracking-tight">
                <Radio className="w-8 h-8 text-[#ff3e5e]" strokeWidth={2.5} />
                <span>Notícias da Clube FM Criciúma</span>
              </h2>
              <div className="w-16 h-1 bg-[#ff3e5e] mt-3"></div>
            </div>
            <a
              href="https://www.vitrinedosul.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 sm:mt-0 text-sm font-bold text-slate-500 hover:text-[#ff3e5e] transition-colors flex items-center space-x-1 group uppercase tracking-wider"
            >
              <span>Informação com Credibilidade</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-14 w-14 border-b-[3px] border-[#ff3e5e]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-8 rounded-3xl flex items-center space-x-4 border border-red-100">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              <p className="font-medium text-lg">
                Não conseguimos carregar as notícias no momento. Tente novamente
                mais tarde.
              </p>
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Highlight News (First Item) */}
              <a
                href={news[0].link}
                target="_blank"
                rel="noopener noreferrer"
                className="group lg:col-span-7 flex flex-col rounded-[2rem] overflow-hidden relative isolate min-h-[400px] lg:min-h-[500px]"
              >
                <img
                  src={news[0].imageUrl}
                  alt={news[0].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 -z-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent -z-10"></div>

                <div className="p-8 lg:p-10 flex flex-col justify-end h-full mt-auto">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-[#ff3e5e] text-white text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      DESTAQUE
                    </span>
                    <span className="text-white/80 text-sm font-semibold tracking-wide">
                      {new Date(news[0].pubDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-[#fce315] transition-colors leading-[1.15] tracking-tight">
                    {news[0].title}
                  </h3>
                  <p
                    className="text-white/80 text-sm sm:text-base line-clamp-2 md:line-clamp-3 font-medium max-w-2xl"
                    dangerouslySetInnerHTML={{ __html: news[0].description }}
                  ></p>
                </div>
              </a>

              {/* Side News (Next 2 Items) */}
              <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
                {news.slice(1, 3).map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-[2rem] p-4 flex flex-col sm:flex-row gap-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex-1"
                  >
                    <div className="w-full sm:w-2/5 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center py-2 sm:pr-4 flex-1">
                      <p className="text-[#ff3e5e] text-[11px] font-black uppercase tracking-wider mb-2">
                        {new Date(item.pubDate).toLocaleDateString("pt-BR")}
                      </p>
                      <h3 className="text-lg lg:text-xl font-bold text-[#5c3e7b] mb-3 group-hover:text-[#ff3e5e] transition-colors leading-tight line-clamp-3">
                        {item.title}
                      </h3>
                      <p
                        className="text-slate-500 text-sm line-clamp-2 font-medium"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      ></p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {/* Fully Responsive Audio Player System */}
      {/* Mobile/Tablet Bottom Sticky Bar (displays only on screens < md) */}
      <div className="fixed bottom-0 inset-x-0 w-full md:hidden bg-gradient-to-r from-[#4b2766]/98 to-[#2e1542]/98 backdrop-blur-xl border-t border-white/15 px-4 py-3.5 z-[60] flex items-center justify-between shadow-[0_-12px_30px_rgba(0,0,0,0.4)]">
        {/* Left: Radio identifier with heartbeat logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div
              className={`absolute -inset-1 bg-[#ff3e5e]/30 blur-sm rounded-full transition-opacity ${isPlaying ? "opacity-100" : "opacity-0"}`}
            ></div>
            <img
              src="https://i.postimg.cc/tTQxJ0qH/Chat-GPT-Image-25-de-mai-de-2026-21-40-34-removebg-preview.png"
              alt="Clube FM Logo"
              className={`w-9 h-9 object-contain relative z-10 ${isPlaying ? "animate-heartbeat" : ""}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black tracking-widest text-[#fce315] uppercase select-none leading-none">
              Clube FM
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isPlaying ? "" : "hidden"}`}
                ></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-white/75 uppercase tracking-wider">
                Ao Vivo
              </span>
            </div>
          </div>
        </div>

        {/* Center: Play/Pause trigger */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-gradient-to-tr from-[#ff3e5e] to-[#ff7a8e] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-white focus:outline-none"
            title={isPlaying ? "Pausar rádio" : "Ouvir ao vivo"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Right: Mute toggle & WhatsApp link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/5 text-white/80 active:scale-90 transition-all"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4.5 h-4.5 text-[#ff3e5e]" />
            ) : (
              <Volume2
                className={`w-4.5 h-4.5 ${isPlaying ? "text-[#fce315]" : ""}`}
              />
            )}
          </button>

          <a
            href="https://wa.me/5548991423040"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-tr from-[#128C7E] to-[#25D366] w-9 h-9 rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-all shadow-md"
            title="WhatsApp Clube"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-4.5 h-4.5"
            >
              <path d="M12.031 0A12 12 0 0 0 0 12c0 2.115.553 4.108 1.542 5.867L.18 23.518l5.807-1.514A11.972 11.972 0 0 0 12.031 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm6.657 17.15c-.279.79-1.343 1.517-2.072 1.637-.73.12-1.748.337-5.597-1.258-4.63-1.92-7.653-6.666-7.882-6.974-.23-.307-1.884-2.508-1.884-4.786s1.173-3.398 1.583-3.834c.41-.437.892-.547 1.19-.547.297 0 .596.012.86.026.275.014.646-.107.994.733.364.876 1.19 2.909 1.295 3.126.107.218.18.472.046.732-.132.261-.202.424-.4.636-.2.21-.418.468-.598.648-.198.196-.407.411-.18 2.015.632 1.748 1.83 2.998 3.018 3.996C14.07 15.358 14.887 15.228 15.118 14.935c.23-.294 1.01-1.178 1.288-1.582.277-.405.553-.338.92-.203.367.135 2.327 1.096 2.723 1.294.397.198.66.297.755.462.097.165.097.962-.182 1.75z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Desktop Side Fixed Player (hidden on mobile, visible on md+) */}
      <div className="hidden md:block fixed right-6 top-1/2 -translate-y-1/2 w-auto z-[60]">
        {/* Glow effect behind player */}
        <div
          className={`absolute inset-0 bg-[#ff3e5e]/20 blur-2xl rounded-full transition-opacity duration-1000 ${isPlaying ? "opacity-100" : "opacity-0"}`}
        ></div>

        <div className="relative bg-gradient-to-b from-[#4b2766]/95 to-[#2e1542]/95 backdrop-blur-xl border border-white/15 rounded-full shadow-[0_12px_40px_rgba(46,21,66,0.6)] p-3 flex flex-col items-center justify-between gap-5 transition-transform hover:scale-105 duration-300 group">
          {/* Play Button */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 flex-shrink-0 bg-gradient-to-tr from-[#ff3e5e] to-[#ff7a8e] rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(255,62,94,0.6)] transition-all relative focus:outline-none overflow-hidden group/play cursor-pointer"
          >
            {isPlaying && (
              <span className="absolute inset-0 rounded-full animate-ping bg-white opacity-20"></span>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover/play:bg-transparent transition-colors"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full rounded-full">
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white drop-shadow-md" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-1 drop-shadow-md" />
              )}
            </div>
          </button>

          {/* Interactive Volume Control */}
          <div
            className="relative flex flex-col items-center group/vol"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            {/* Expandable vertical mini-slider */}
            <div
              className={`absolute right-14 top-1/2 -translate-y-1/2 bg-[#2d143f]/95 backdrop-blur-md rounded-2xl px-3 py-3 border border-white/15 shadow-2xl transition-all duration-300 flex items-center gap-3 ${showVolumeSlider ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-90 pointer-events-none"}`}
            >
              <span className="text-[10px] font-black text-[#fce315] font-mono min-w-[28px] text-center">
                {isMuted ? "MUTE" : `${Math.round(volume * 100)}%`}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-white/20 accent-[#ff3e5e] rounded-full cursor-pointer"
              />
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/12 border border-white/5 transition-all text-white/80 hover:text-[#fce315] hover:scale-110 cursor-pointer"
              title={isMuted ? "Ativar som (Unmute)" : "Desativar som (Mute)"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-[#ff3e5e] animate-pulse" />
              ) : (
                <Volume2
                  className={`w-5 h-5 ${isPlaying ? "text-[#fce315]" : ""}`}
                />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col items-center gap-4 my-1">
            <span className="[writing-mode:vertical-rl] rotate-180 font-[900] text-[10px] text-white/70 tracking-[0.25em] uppercase drop-shadow-sm flex items-center gap-2 select-none">
              Clube FM
            </span>
            <div
              className={`flex flex-col items-center gap-2 transition-all duration-500 ${isPlaying ? "opacity-100" : "opacity-40 grayscale"}`}
            >
              <div className="flex items-end justify-center gap-1 h-5">
                <span
                  className={`w-1.5 bg-[#fce315] rounded-full ${isPlaying ? "animate-bounce [animation-delay:0ms] [animation-duration:1s]" : "h-1.5"}`}
                ></span>
                <span
                  className={`w-1.5 bg-[#fce315] rounded-full ${isPlaying ? "animate-bounce [animation-delay:200ms] [animation-duration:1s]" : "h-3.5"}`}
                ></span>
                <span
                  className={`w-1.5 bg-[#fce315] rounded-full ${isPlaying ? "animate-bounce [animation-delay:400ms] [animation-duration:1s]" : "h-2"}`}
                ></span>
              </div>
              <span className="text-[10px] font-black text-[#fce315] uppercase tracking-widest leading-none drop-shadow-sm">
                Ao vivo
              </span>
            </div>
          </div>

          {/* WhatsApp Button */}
          <div className="relative">
            <div className="absolute -inset-2 bg-[#25D366]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <a
              href="https://wa.me/5548991423040"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group/wa overflow-hidden bg-gradient-to-tr from-[#128C7E] to-[#25D366] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 shrink-0 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/wa:translate-y-0 transition-transform duration-300 ease-out"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                stroke="none"
                className="w-5 h-5 relative z-10 drop-shadow-md"
              >
                <path d="M12.031 0A12 12 0 0 0 0 12c0 2.115.553 4.108 1.542 5.867L.18 23.518l5.807-1.514A11.972 11.972 0 0 0 12.031 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm6.657 17.15c-.279.79-1.343 1.517-2.072 1.637-.73.12-1.748.337-5.597-1.258-4.63-1.92-7.653-6.666-7.882-6.974-.23-.307-1.884-2.508-1.884-4.786s1.173-3.398 1.583-3.834c.41-.437.892-.547 1.19-.547.297 0 .596.012.86.026.275.014.646-.107.994.733.364.876 1.19 2.909 1.295 3.126.107.218.18.472.046.732-.132.261-.202.424-.4.636-.2.21-.418.468-.598.648-.198.196-.407.411-.18 2.015.632 1.748 1.83 2.998 3.018 3.996C14.07 15.358 14.887 15.228 15.118 14.935c.23-.294 1.01-1.178 1.288-1.582.277-.405.553-.338.92-.203.367.135 2.327 1.096 2.723 1.294.397.198.66.297.755.462.097.165.097.962-.182 1.75z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Clube Maníacos Newsletter */}
      <section
        id="vip"
        className="relative bg-[#fce315] py-20 px-4 overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0 opacity-20 mix-blend-multiply"
          style={{
            backgroundImage:
              "url('https://img.nsctotal.com.br/wp-content/uploads/2024/06/Criciuma-apresenta-projeto-de-ampliacao-do-Heriberto-Hulse-13.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#663b86] mb-3">
            Comunidade VIP Clube FM Criciúma
          </h2>
          <div className="w-10 h-[2px] bg-[#663b86] mx-auto mb-8"></div>
          <p className="text-slate-700 font-semibold mb-12 max-w-lg mx-auto">
            Cadastre-se na Rádio Clube FM Criciúma e concorra a prêmios
            incríveis, ingressos e brindes exclusivos da nossa promoção.
          </p>

          <div className="relative rounded-[2rem] overflow-hidden p-1 max-w-4xl mx-auto">
            {/* Smooth transition glassmorphism submitting feedback */}
            {isSubmitting && (
              <div className="absolute inset-0 z-20 bg-[#5c337c]/95 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center gap-4 text-white animated-fade-in py-10 px-6">
                <div className="w-14 h-14 rounded-full border-4 border-[#fce315]/30 border-t-[#fce315] animate-spin"></div>
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-black text-[#fce315] tracking-tight">
                    Quase lá, {clubeName || "Amigo(a)"}!
                  </h3>
                  <p className="text-sm font-semibold text-white/90 max-w-md">
                    Estamos preparando seus dados. Nós iremos redirecionar você
                    para o WhatsApp em instantes...
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleClubeSubmit}
              className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 w-full"
            >
              <input
                type="text"
                required
                placeholder="Seu nome*"
                value={clubeName}
                onChange={(e) => setClubeName(e.target.value)}
                className="w-full md:w-1/4 px-6 py-3.5 rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#663b86] outline-none text-sm font-semibold text-slate-800 bg-white"
              />
              <input
                type="email"
                required
                placeholder="Seu melhor email*"
                value={clubeEmail}
                onChange={(e) => setClubeEmail(e.target.value)}
                className="w-full md:w-1/4 px-6 py-3.5 rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#663b86] outline-none text-sm font-semibold text-slate-800 bg-white"
              />
              <input
                type="tel"
                required
                placeholder="Seu telefone whatsapp*"
                value={clubePhone}
                onChange={handlePhoneChange}
                maxLength={15}
                className="w-full md:w-1/4 px-6 py-3.5 rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#663b86] outline-none text-sm font-semibold text-slate-800 bg-white"
              />
              <button
                type="submit"
                className="w-full md:w-1/4 bg-[#ff3864] text-white font-[950] rounded-full py-4 text-[11px] uppercase tracking-wider hover:bg-rose-500 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-300 cursor-pointer"
              >
                CADASTRE-SE NO VIP
              </button>
            </form>
          </div>

          <p className="text-[13px] text-slate-500/80 font-medium">
            Ao se cadastrar você concorda em enviar o convite pelo WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-[#4a245e] text-white pt-16 pb-24 sm:pb-12 border-t-[8px] border-[#ff3e5e] relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Decorative background blurs */}
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-[#ff3e5e] rounded-full blur-[140px] opacity-30 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-96 h-96 bg-[#fce315] rounded-full blur-[140px] opacity-20 pointer-events-none z-0"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          {/* Logo & Address */}
          <div className="flex flex-col items-center md:items-start md:w-1/2">
            <div className="text-center md:text-left space-y-1.5 w-full flex flex-col items-center md:items-start">
              <h3 className="font-extrabold text-lg text-white tracking-tight drop-shadow-sm">
                Rádio Clube FM Criciúma
              </h3>
              <p className="text-[13px] text-white/80 leading-relaxed font-medium">
                Rua Vendramino Dajori, 85 - Bairro Imigrantes
                <br />
                Fundos da Cermoful - Criciúma, SC, Brasil
              </p>

              <div className="flex flex-col items-center md:items-start pt-4 mt-4 border-t border-white/15 w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#fce315]/90 mb-2">
                  Parceiro Oficial
                </span>
                <a
                  href="https://www.vitrinedosul.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 group/partner shadow-sm"
                >
                  <img
                    src="https://www.vitrinedosul.com.br/img/f23f14e98b1633ae33c6df8188840cb21436602a.png"
                    alt="Portal Vitrine do Sul"
                    className="h-8 w-auto object-contain transition-transform duration-300 group-hover/partner:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-extrabold text-slate-200 group-hover/partner:text-[#fce315] transition-colors leading-none">
                      Vitrine do Sul
                    </span>
                    <span className="text-[8px] font-bold text-white/50 tracking-wider mt-1 uppercase">
                      Acessar Notícias
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Social Links & Slogan */}
          <div className="flex flex-col items-center md:items-end space-y-6 md:w-1/2 text-center md:text-right">
            <div className="max-w-xs">
              <h3 className="text-[#fce315] font-[900] text-xl uppercase tracking-widest drop-shadow-sm mb-3">
                A número um em Criciúma!
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed font-medium">
                Sintonize na frequência da alegria. Informação local, prêmios e
                a melhor seleção musical da sua vida.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.1em] text-white/80 mb-3">
                Siga nossas redes
              </h4>
              <div className="flex space-x-4 justify-center md:justify-end">
                <a
                  href="https://www.facebook.com/radioclubecriciumafm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#1877F2] hover:-translate-y-1 transition-all duration-300 shadow-md border border-white/20 hover:border-transparent"
                >
                  <Facebook className="w-5 h-5 fill-current" />
                </a>
                <a
                  href="https://instagram.com/radioclubecriciumafm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:-translate-y-1 transition-all duration-300 shadow-md border border-white/20 hover:border-transparent"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.youtube.com/@radioclubecriciumafm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#FF0000] hover:-translate-y-1 transition-all duration-300 shadow-md border border-white/20 hover:border-transparent"
                >
                  <Youtube className="w-5 h-5 fill-current" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="max-w-6xl mx-auto px-6 mt-12 relative z-10">
          <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70">
            <p className="font-semibold text-white/90">
              © {new Date().getFullYear()} Rádio Clube FM. Todos os direitos
              reservados.
            </p>
            <p className="mt-4 sm:mt-0 font-medium flex items-center justify-center sm:justify-start gap-1">
              Desenvolvido com{" "}
              <Heart className="w-3.5 h-3.5 fill-[#ff3e5e] text-[#ff3e5e]" />{" "}
              por{" "}
              <a
                href="https://www.innovetecnologia.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fce315] font-bold hover:underline transition-colors"
              >
                Innove Tecnologia
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="auto"
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
