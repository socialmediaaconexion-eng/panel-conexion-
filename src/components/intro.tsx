// Intro de marca en 3D: la C (con volumen) gira hacia el frente, hace "clic" hundiéndose,
// y de su centro nace la palabra. Solo CSS + un script mínimo: sin parpadeo.
// Una vez por sesión; ?intro=1 la repite. Respeta "reducir movimiento".
const decidir = `(function(){try{
  var d=document.documentElement;if(localStorage.getItem('cx-tema')==='dark')d.setAttribute('data-theme','dark');
  var q=location.search.indexOf('intro=1')>-1;
  var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!q&&(r||sessionStorage.getItem('cx-intro'))){d.classList.add('intro-skip');}
  sessionStorage.setItem('cx-intro','1');
}catch(e){}})();`;

const CAPAS = 14; // grosor del volumen (capas de canto)

export function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decidir }} />
      <div className="intro" aria-hidden="true">
        <div className="intro-logo">
          <div className="intro-3d">
            {Array.from({ length: CAPAS }, (_, i) => (
              <img key={i} className="intro-canto" src="/logo-c-mark-side.png" alt="" style={{ transform: `translateZ(${-(i + 1) * 1.4}px)` }} />
            ))}
            <img className="intro-frente" src="/logo-c-mark.png" alt="" />
            <span className="intro-ripple" />
            <span className="intro-word"><img src="/logo-c-word.png" alt="" /></span>
          </div>
        </div>
      </div>
    </>
  );
}
