import { DEFAULT_MODE, MODE_STORAGE_KEY } from "./config";

/**
 * Runs in <head> before first paint: applies the saved light/dark mode so the
 * page never flashes the wrong theme. Same key and default as ThemeContext.
 */
export const modeBootstrapScript = `(function(){try{
var m=localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});
if(m!=='light'&&m!=='dark'){m=${JSON.stringify(DEFAULT_MODE)};}
var r=document.documentElement;
r.classList.toggle('dark',m==='dark');
r.setAttribute('data-theme',m);
r.style.colorScheme=m;
}catch(e){}})();`;
