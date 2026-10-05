export const safe=(v:any)=>{const s=String(v??'');return /^[=+\-@]/.test(s)?"'"+s:s}  // CSV formula-injection guard
