// Intro de marca: la C entra como un "clic" y la palabra sale desde el centro de la C.
// Solo CSS (sin JS de React) para que no haya parpadeo. Se ve una vez por sesión;
// ?intro=1 en la URL la repite. Respeta "reducir movimiento".
const decidir = `(function(){try{
  var d=document.documentElement,q=location.search.indexOf('intro=1')>-1;
  var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!q&&(r||sessionStorage.getItem('cx-intro'))){d.classList.add('intro-skip');}
  sessionStorage.setItem('cx-intro','1');
}catch(e){}})();`;

export function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decidir }} />
      <div className="intro" aria-hidden="true">
        <div className="intro-logo">
          <span className="intro-word"><img src="/logo-c-word.png" alt="" /></span>
          <span className="intro-ripple" />
          <img className="intro-mark" src="/logo-c-mark.png" alt="" />
        </div>
      </div>
    </>
  );
}
