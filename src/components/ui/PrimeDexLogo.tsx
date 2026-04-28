interface PrimeDexLogoProps {
  className?: string;
}

export default function PrimeDexLogo({ className = 'w-10 h-10' }: PrimeDexLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-full bg-red-500/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Pokéball Main Body */}
      <div className="relative w-full h-full rounded-full border-2 border-black overflow-hidden shadow-lg bg-white">
        {/* Top Half (Red) */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-red-500 to-red-600 border-b-2 border-black" />
        
        {/* Shine Effect */}
        <div className="absolute top-[10%] left-[15%] w-[30%] h-[20%] bg-primary-foreground/35 rounded-full rotate-[-20deg]" />
        
        {/* Middle Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-black -translate-y-1/2" />
        
        {/* Center Button Housing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-black rounded-full flex items-center justify-center z-10 shadow-md">
          {/* Inner Button */}
          <div className="w-2/3 h-2/3 bg-white rounded-full border border-gray-400 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_5px_rgba(255,255,255,1)]" />
        </div>
      </div>

    </div>
  );
}
