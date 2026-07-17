import React, { useState, useRef, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, collection, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

// --- CONFIGURACIÓN Y CONSTANTES ---
const apiKey = ""; // Canvas inyectará la llave en entorno
const BASE_IMG_URL = "/mazo/";

// Inicialización diferida de Firebase (Soporte Offline/Puro)
let app, auth, db;
try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) { console.warn("Firebase no disponible en este entorno puro."); }

const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'arkyan-oracle';

// --- GLOSARIO OCULTISTA ---
const GLOSSARY = {
  "karma": "Ley cósmica de causa y efecto. Acciones pasadas que moldean tu presente.",
  "chakra": "Centro energético rotatorio en el cuerpo sutil humano.",
  "akáshico": "El plano etérico donde se guarda la memoria de cada alma y evento del universo.",
  "sombra": "Las partes reprimidas, ocultas o negadas de nuestra propia psique (psicología junguiana).",
  "sinastría": "El estudio de la compatibilidad energética y astrológica entre dos almas.",
  "mercurio": "Planeta de la mente y comunicación. Retrógrado indica revisión interna.",
  "aura": "Campo electromagnético y luminoso que rodea el cuerpo físico.",
  "alquimia": "Transmutación de la energía densa o negativa en luz y consciencia elevada."
};

// --- MOTOR ASTRONÓMICO Y NUMEROLÓGICO ---
const calculateAstroNumerology = (name, dobStr, timeStr = "12:00") => {
  if (!name || !dobStr) return {};
  
  // 1. ASTROLOGÍA DE PRECISIÓN
  const date = new Date(`${dobStr}T${timeStr}:00Z`);
  const d = date.getUTCDate(); const m = date.getUTCMonth() + 1; const y = date.getUTCFullYear();
  const h = date.getUTCHours();
  
  let zodiac = "Desconocido"; let planet = "Desconocido";
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) { zodiac = 'Aries'; planet = 'Marte'; }
  else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) { zodiac = 'Tauro'; planet = 'Venus'; }
  else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) { zodiac = 'Géminis'; planet = 'Mercurio'; }
  else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) { zodiac = 'Cáncer'; planet = 'Luna'; }
  else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) { zodiac = 'Leo'; planet = 'Sol'; }
  else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) { zodiac = 'Virgo'; planet = 'Mercurio'; }
  else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) { zodiac = 'Libra'; planet = 'Venus'; }
  else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) { zodiac = 'Escorpio'; planet = 'Plutón'; }
  else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) { zodiac = 'Sagitario'; planet = 'Júpiter'; }
  else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) { zodiac = 'Capricornio'; planet = 'Saturno'; }
  else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) { zodiac = 'Acuario'; planet = 'Urano'; }
  else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) { zodiac = 'Piscis'; planet = 'Neptuno'; }

  const a = Math.floor((14 - m) / 12);
  const yJ = y + 4800 - a;
  const mJ = m + 12 * a - 3;
  let jd = d + Math.floor((153 * mJ + 2) / 5) + 365 * yJ + Math.floor(yJ / 4) - Math.floor(yJ / 100) + Math.floor(yJ / 400) - 32045;
  const moonLong = (13.1763966 * jd + 318.3) % 360;
  const moonSigns = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
  const calcMoonIndex = Math.floor(moonLong / 30);
  const moonSign = moonSigns[calcMoonIndex >= 0 && calcMoonIndex < 12 ? calcMoonIndex : 0];

  const ascSigns = [...moonSigns];
  const ascOffset = Math.floor(h / 2) % 12;
  const ascSign = ascSigns[(ascSigns.indexOf(zodiac) + ascOffset) % 12];

  // 2. NUMEROLOGÍA PITAGÓRICA
  const pythagorean = { a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9, j:1, k:2, l:3, m:4, n:5, ñ:5, o:6, p:7, q:8, r:9, s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8 };
  const isVowel = (char) => ['a','e','i','o','u'].includes(char);
  
  const reduce = (num, keepMaster = true) => {
    if (!num) return 0;
    let current = parseInt(num, 10);
    while (current > 9 && (!keepMaster || ![11, 22, 33].includes(current))) {
        current = current.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    }
    return current;
  };

  const sumD = reduce(d, false); const sumM = reduce(m, false); const sumY = reduce(y, false);
  const lifePathRaw = sumD + sumM + sumY;
  const lifePath = reduce(lifePathRaw);
  const attitude = reduce(sumD + sumM, false);
  const generation = sumY;
  const birthDay = reduce(d);

  let karmicDebt = "Ninguna";
  if ([13, 14, 16, 19].includes(d)) karmicDebt = d.toString();
  else if ([13, 14, 16, 19].includes(lifePathRaw)) karmicDebt = lifePathRaw.toString();

  const cleanName = name.toLowerCase().replace(/[^a-zñ\s]/g, '');
  const nameParts = cleanName.split(/\s+/);
  let totalExp = 0, totalSoul = 0, totalPers = 0;
  let missing = [1,2,3,4,5,6,7,8,9];

  nameParts.forEach(part => {
      let pExp = 0, pSoul = 0, pPers = 0;
      part.split('').forEach(char => {
          const val = pythagorean[char] || 0;
          missing = missing.filter(n => n !== val);
          pExp += val;
          if(isVowel(char)) pSoul += val; else pPers += val;
      });
      totalExp += reduce(pExp); totalSoul += reduce(pSoul); totalPers += reduce(pPers);
  });

  const expression = reduce(totalExp);
  const soul = reduce(totalSoul);
  const personality = reduce(totalPers);
  const maturity = reduce(lifePath + expression);
  if (karmicDebt === "Ninguna" && [13, 14, 16, 19].includes(totalExp)) karmicDebt = totalExp.toString();

  const today = new Date();
  const personalYear = reduce(reduce(d) + reduce(m) + reduce(today.getFullYear()));
  const personalMonth = reduce(personalYear + (today.getMonth() + 1));
  const personalDaily = reduce(personalMonth + today.getDate());

  return { zodiac, planet, moonSign, ascSign, lifePath, attitude, generation, birthDay, expression, soul, personality, maturity, karmicLessons: missing.length ? missing.join(', ') : 'Ninguna', karmicDebt, personalYear, personalMonth, personalDaily };
};

const getPreciseMoonPhase = () => {
  const date = new Date();
  const synodicMonth = 29.53058867; 
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const diffDays = (date - knownNewMoon) / 86400000;
  const phase = diffDays % synodicMonth;
  
  let name = ''; let eclipse = false;
  if (phase < 1 || phase > 28.5) { name = '🌑 Luna Nueva'; eclipse = Math.random() > 0.8; }
  else if (phase < 7.4) name = '🌒 Creciente';
  else if (phase < 8.4) name = '🌓 Cuarto Creciente';
  else if (phase < 14) name = '🌔 Gibosa Creciente';
  else if (phase < 15.5) { name = '🌕 Luna Llena'; eclipse = Math.random() > 0.8; }
  else if (phase < 22) name = '🌖 Gibosa Menguante';
  else if (phase < 23) name = '🌗 Cuarto Menguante';
  else name = '🌘 Menguante';

  return { name, eclipseWarning: eclipse ? ' (Temporada de Eclipses)' : '' };
};

const getDailyPlanet = () => {
  const days = ['Sol ☀️ (Dom)', 'Luna 🌙 (Lun)', 'Marte 🔴 (Mar)', 'Mercurio ☿️ (Mié)', 'Júpiter ♃ (Jue)', 'Venus ♀️ (Vie)', 'Saturno ♄ (Sáb)'];
  return days[new Date().getDay()];
};

// --- BASE DE DATOS ULTRA-PREMIUM ---
const MAJOR_ARCANA = [
  { id: 'M0', number: 0, name: 'El Loco', icon: '🃏', vibe: 'neutral', element: 'Aire', planet: 'Urano', zodiac: 'Acuario', color: 'Amarillo', chakra: 'Corona', keyword: 'Libertad Cósmica', mantra: 'Yo confío en el salto hacia lo desconocido', meaning: 'Nuevos comienzos, espontaneidad, fe absoluta en el universo.', reversed: 'Temeridad, riesgo extremo, estancamiento.', crystal: 'Cuarzo Claro', aroma: 'Eucalipto', agesta: '45' },
  { id: 'M1', number: 1, name: 'El Mago', icon: '🪄', vibe: 'neutral', element: 'Aire', planet: 'Mercurio', zodiac: 'Géminis/Virgo', color: 'Amarillo', chakra: 'Tercer Ojo', keyword: 'Manifestación Pura', mantra: 'Yo creo mi realidad con mi voluntad consciente', meaning: 'Manifestación, recursos infinitos, poder personal.', reversed: 'Manipulación, talentos ocultos bloqueados.', crystal: 'Citrino', aroma: 'Menta', agesta: '541' },
  { id: 'M2', number: 2, name: 'La Sacerdotisa', icon: '🌙', vibe: 'mystic', element: 'Agua', planet: 'Luna', zodiac: 'Cáncer', color: 'Plata/Azul', chakra: 'Tercer Ojo', keyword: 'Intuición Profunda', mantra: 'Yo escucho la voz silenciosa de mi alma', meaning: 'Intuición, misterio, acceso a los registros akáshicos.', reversed: 'Secretos destructivos, intuición bloqueada.', crystal: 'Piedra Luna', aroma: 'Jazmín', agesta: '69' },
  { id: 'M3', number: 3, name: 'La Emperatriz', icon: '👑', vibe: 'warm', element: 'Tierra', planet: 'Venus', zodiac: 'Tauro/Libra', color: 'Verde/Rosa', chakra: 'Corazón', keyword: 'Abundancia Fértil', mantra: 'Yo nutro y doy vida a mis más hermosos sueños', meaning: 'Abundancia, fertilidad, creación exuberante.', reversed: 'Dependencia, bloqueo creativo.', crystal: 'Cuarzo Rosa', aroma: 'Rosa', agesta: '71269' },
  { id: 'M4', number: 4, name: 'El Emperador', icon: '🪑', vibe: 'neutral', element: 'Fuego', planet: 'Marte', zodiac: 'Aries', color: 'Rojo', chakra: 'Raíz', keyword: 'Estructura Divina', mantra: 'Yo construyo cimientos sólidos', meaning: 'Estructura, autoridad, orden, liderazgo protector.', reversed: 'Tiranía, rigidez, falta de disciplina.', crystal: 'Jaspe Rojo', aroma: 'Pino', agesta: '314' },
  { id: 'M5', number: 5, name: 'El Hierofante', icon: '🗝️', vibe: 'mystic', element: 'Tierra', planet: 'Venus', zodiac: 'Tauro', color: 'Dorado', chakra: 'Garganta', keyword: 'Guía Espiritual', mantra: 'Yo honro la sabiduría divina', meaning: 'Tradición, creencias espirituales, educación superior.', reversed: 'Rebelión ciega, ignorancia espiritual.', crystal: 'Lapislázuli', aroma: 'Mirra', agesta: '333' },
  { id: 'M6', number: 6, name: 'Los Enamorados', icon: '❤️', vibe: 'warm', element: 'Aire', planet: 'Mercurio', zodiac: 'Géminis', color: 'Naranja', chakra: 'Corazón', keyword: 'Elección de Alma', mantra: 'Yo elijo desde el amor puro', meaning: 'Elecciones cruciales, valores compartidos, amor profundo.', reversed: 'Desarmonía en vínculos, malas elecciones.', crystal: 'Ágata', aroma: 'Vainilla', agesta: '571' },
  { id: 'M7', number: 7, name: 'El Carro', icon: '🐎', vibe: 'active', element: 'Agua', planet: 'Luna', zodiac: 'Cáncer', color: 'Blanco', chakra: 'Plexo Solar', keyword: 'Victoria', mantra: 'Yo dirijo mi destino', meaning: 'Dirección, control de fuerzas opuestas, victoria a través de la disciplina.', reversed: 'Falta de dirección, obstáculos inamovibles.', crystal: 'Ojo de Tigre', aroma: 'Sándalo', agesta: '897' },
  { id: 'M8', number: 8, name: 'La Fuerza', icon: '🦁', vibe: 'warm', element: 'Fuego', planet: 'Sol', zodiac: 'Leo', color: 'Amarillo', chakra: 'Corazón', keyword: 'Coraje', mantra: 'Yo domino mis instintos con amor', meaning: 'Coraje, persuasión pacífica, compasión infinita.', reversed: 'Duda, dejarse consumir por pasiones.', crystal: 'Pirita', aroma: 'Naranja', agesta: '111' },
  { id: 'M9', number: 9, name: 'El Ermitaño', icon: '🏮', vibe: 'mystic', element: 'Tierra', planet: 'Mercurio', zodiac: 'Virgo', color: 'Gris', chakra: 'Tercer Ojo', keyword: 'Introspección', mantra: 'Yo soy mi propia luz', meaning: 'Guía interior profunda, sabiduría que llega en el silencio.', reversed: 'Aislamiento destructivo.', crystal: 'Amatista', aroma: 'Incienso', agesta: '725' },
  { id: 'M10', number: 10, name: 'La Rueda', icon: '🎡', vibe: 'active', element: 'Fuego', planet: 'Júpiter', zodiac: 'Sagitario', color: 'Morado', chakra: 'Sacro', keyword: 'Ciclos Kármicos', mantra: 'Yo fluyo con los cambios', meaning: 'Destino inevitable, puntos de inflexión y buena fortuna.', reversed: 'Resistencia terca al cambio.', crystal: 'Turquesa', aroma: 'Canela', agesta: '2190' },
  { id: 'M11', number: 11, name: 'La Justicia', icon: '⚖️', vibe: 'neutral', element: 'Aire', planet: 'Venus', zodiac: 'Libra', color: 'Verde', chakra: 'Corazón', keyword: 'Karma', mantra: 'Yo asumo responsabilidad', meaning: 'Verdad, equidad, balance kármico perfecto.', reversed: 'Injusticia, deshonestidad.', crystal: 'Jade', aroma: 'Lirio', agesta: '3128' },
  { id: 'M12', number: 12, name: 'El Colgado', icon: '🪢', vibe: 'mystic', element: 'Agua', planet: 'Neptuno', zodiac: 'Piscis', color: 'Azul', chakra: 'Tercer Ojo', keyword: 'Rendición', mantra: 'Yo observo desde otra perspectiva', meaning: 'Pausa necesaria, rendición espiritual, iluminación inversa.', reversed: 'Sacrificio inútil, estancamiento egoico.', crystal: 'Aguamarina', aroma: 'Loto', agesta: '427' },
  { id: 'M13', number: 13, name: 'La Muerte', icon: '💀', vibe: 'dark', element: 'Agua', planet: 'Plutón', zodiac: 'Escorpio', color: 'Negro', chakra: 'Raíz', keyword: 'Transmutación', mantra: 'Yo renazco en gloria', meaning: 'Finales necesarios, limpieza profunda, cambio radical.', reversed: 'Miedo irracional al cambio.', crystal: 'Obsidiana', aroma: 'Pachulí', agesta: '3333' },
  { id: 'M14', number: 14, name: 'La Templanza', icon: '🏺', vibe: 'mystic', element: 'Fuego', planet: 'Júpiter', zodiac: 'Sagitario', color: 'Arcoíris', chakra: 'Sacro', keyword: 'Alquimia', mantra: 'Yo alquimizo mi energía', meaning: 'Equilibrio perfecto, moderación, mezcla de opuestos.', reversed: 'Desequilibrio, excesos.', crystal: 'Fluorita', aroma: 'Manzanilla', agesta: '44' },
  { id: 'M15', number: 15, name: 'El Diablo', icon: '🐐', vibe: 'dark', element: 'Tierra', planet: 'Saturno', zodiac: 'Capricornio', color: 'Rojo Oscuro', chakra: 'Raíz', keyword: 'Sombra', mantra: 'Yo me libero de mis cadenas', meaning: 'Apegos tóxicos, ilusiones materiales, enfrentar la sombra.', reversed: 'Liberación inminente.', crystal: 'Turmalina Negra', aroma: 'Almizcle', agesta: '825' },
  { id: 'M16', number: 16, name: 'La Torre', icon: '⚡', vibe: 'dark', element: 'Fuego', planet: 'Marte', zodiac: 'Aries', color: 'Rojo/Negro', chakra: 'Raíz', keyword: 'Revelación Abrupta', mantra: 'Yo acepto la destrucción de la ilusión', meaning: 'Cambio caótico, revelación brutal pero necesaria.', reversed: 'Retrasar una crisis inevitable.', crystal: 'Cuarzo Ahumado', aroma: 'Clavo', agesta: '715' },
  { id: 'M17', number: 17, name: 'La Estrella', icon: '⭐', vibe: 'mystic', element: 'Aire', planet: 'Urano', zodiac: 'Acuario', color: 'Azul Claro', chakra: 'Garganta', keyword: 'Esperanza', mantra: 'Yo confío en la guía cósmica', meaning: 'Fe renovada, propósito de alma, sanación profunda.', reversed: 'Desesperanza, desconexión.', crystal: 'Celestina', aroma: 'Anís', agesta: '108' },
  { id: 'M18', number: 18, name: 'La Luna', icon: '🐺', vibe: 'mystic', element: 'Agua', planet: 'Neptuno', zodiac: 'Piscis', color: 'Púrpura', chakra: 'Sacro', keyword: 'Subconsciente', mantra: 'Yo navego mis sombras sin miedo', meaning: 'Ilusión, miedos ocultos, sueños vívidos.', reversed: 'Claridad súbita, liberación de confusiones.', crystal: 'Labradorita', aroma: 'Artemisa', agesta: '741' },
  { id: 'M19', number: 19, name: 'El Sol', icon: '☀️', vibe: 'warm', element: 'Fuego', planet: 'Sol', zodiac: 'Leo', color: 'Dorado', chakra: 'Plexo Solar', keyword: 'Vitalidad Radiante', mantra: 'Yo radio mi luz interior', meaning: 'Éxito rotundo, vitalidad, alegría pura.', reversed: 'Tristeza temporal, éxito retrasado.', crystal: 'Piedra del Sol', aroma: 'Limón', agesta: '199' },
  { id: 'M20', number: 20, name: 'El Juicio', icon: '📯', vibe: 'active', element: 'Fuego', planet: 'Plutón', zodiac: 'Escorpio', color: 'Blanco', chakra: 'Corona', keyword: 'Llamado del Alma', mantra: 'Yo respondo a mi llamado superior', meaning: 'Renacimiento espiritual, evaluación de vida.', reversed: 'Dudas asfixiantes.', crystal: 'Moldavita', aroma: 'Mirra', agesta: '999' },
  { id: 'M21', number: 21, name: 'El Mundo', icon: '🌍', vibe: 'warm', element: 'Tierra', planet: 'Saturno', zodiac: 'Capricornio', color: 'Verde', chakra: 'Corona', keyword: 'Plenitud Absoluta', mantra: 'Yo soy uno con el universo', meaning: 'Finalización de ciclo, integración perfecta.', reversed: 'Estancamiento antes de la meta.', crystal: 'Ópalo', aroma: 'Vetiver', agesta: '2190' }
].map(c => ({...c, type: 'tarot_mayor', isReversed: false}));

const SUITS_META = {
  'Copas': { icon: '🍷', element: 'Agua', planet: 'Luna/Neptuno', crystal: 'Amatista', aroma: 'Rosa', agesta: '71' },
  'Espadas': { icon: '⚔️', element: 'Aire', planet: 'Mercurio/Urano', crystal: 'Sodalita', aroma: 'Menta', agesta: '725' },
  'Bastos': { icon: '🌿', element: 'Fuego', planet: 'Marte/Sol', crystal: 'Cornalina', aroma: 'Canela', agesta: '897' },
  'Oros': { icon: '🪙', element: 'Tierra', planet: 'Venus/Saturno', crystal: 'Pirita', aroma: 'Pachulí', agesta: '541' }
};

const RANKS = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Sota', 'Caballo', 'Reina', 'Rey'];
const MINOR_ARCANA = Object.keys(SUITS_META).flatMap(suit => RANKS.map((rank, i) => {
  const meta = SUITS_META[suit];
  const numValue = i < 10 ? i + 1 : (i === 10 ? 11 : i === 11 ? 12 : i === 12 ? 13 : 14);
  return { 
    id: `m_${suit}_${i}`, name: `${rank} de ${suit}`, icon: meta.icon,
    vibe: 'neutral', element: meta.element, planet: meta.planet,
    numerology: numValue > 9 ? numValue.toString().split('').reduce((a,b)=>parseInt(a)+parseInt(b), 0) : numValue,
    keyword: `${rank} elemental`, mantra: `La energía del ${rank} fluye en el reino del ${meta.element}`,
    meaning: `Manifestación del ${rank} en el ámbito de las ${suit}. Flujo de energía específica.`, 
    reversed: `Advierte sobre un bloqueo o exceso de energía en las ${suit}.`, 
    suit: suit, type: 'tarot_menor', crystal: meta.crystal, aroma: meta.aroma, agesta: meta.agesta
  };
}));

const TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const RUNES = [
  { id: 'R1', name: 'Fehu', icon: 'ᚠ', element: 'Fuego', meaning: 'Riqueza material, abundancia móvil, energía dinámica.', reversed: 'Pérdida, problemas financieros.', mantra: 'La abundancia fluye hacia mí libremente', crystal: 'Pirita', aroma: 'Canela', agesta: '541' }, 
  { id: 'R2', name: 'Uruz', icon: 'ᚢ', element: 'Tierra', meaning: 'Fuerza física, salud robusta, vitalidad indomable.', reversed: 'Debilidad, enfermedad.', mantra: 'Mi fuerza interior es inquebrantable', crystal: 'Jaspe Rojo', aroma: 'Cedro', agesta: '900' }, 
  { id: 'R3', name: 'Thurisaz', icon: 'ᚦ', element: 'Fuego', meaning: 'Protección férrea, conflicto necesario.', reversed: 'Peligro inminente, vulnerabilidad.', mantra: 'Estoy protegido por fuerzas ancestrales', crystal: 'Obsidiana', aroma: 'Clavo', agesta: '615' },
  { id: 'R4', name: 'Ansuz', icon: 'ᚨ', element: 'Aire', meaning: 'Comunicación divina, sabiduría oral.', reversed: 'Engaño, malentendidos comunicativos.', mantra: 'Mi voz resuena con la verdad del universo', crystal: 'Lapislázuli', aroma: 'Menta', agesta: '525' }, 
  { id: 'R5', name: 'Raido', icon: 'ᚱ', element: 'Aire', meaning: 'Viaje físico o espiritual, evolución en movimiento.', reversed: 'Estancamiento absoluto, retrasos.', mantra: 'El camino se abre bajo mis pies', crystal: 'Turquesa', aroma: 'Incienso', agesta: '897' }, 
  { id: 'R6', name: 'Kenaz', icon: 'ᚲ', element: 'Fuego', meaning: 'Conocimiento iluminado, creatividad, antorcha.', reversed: 'Bloqueo creativo severo, ignorancia.', mantra: 'La luz de la sabiduría disipa mi oscuridad', crystal: 'Cornalina', aroma: 'Naranja', agesta: '411' },
  { id: 'R7', name: 'Gebo', icon: 'ᚷ', element: 'Aire', meaning: 'El regalo, la asociación perfecta, equilibrio.', reversed: 'Desequilibrio energético, deudas kármicas.', mantra: 'Doy y recibo en perfecta armonía', crystal: 'Cuarzo Rosa', aroma: 'Rosa', agesta: '571' },
  { id: 'R8', name: 'Wunjo', icon: 'ᚹ', element: 'Tierra', meaning: 'Alegría pura, éxito materializado, armonía.', reversed: 'Tristeza profunda, conflictos familiares.', mantra: 'La alegría es mi estado natural de ser', crystal: 'Citrino', aroma: 'Vainilla', agesta: '199' },
  { id: 'R9', name: 'Hagalaz', icon: 'ᚺ', element: 'Agua', meaning: 'Destrucción natural necesaria, cambio radical.', reversed: 'Desastre evitable, estancamiento.', mantra: 'El caos es el preámbulo de mi nueva creación', crystal: 'Turmalina', aroma: 'Pachulí', agesta: '3333' },
  { id: 'R10', name: 'Nauthiz', icon: 'ᚾ', element: 'Fuego', meaning: 'Necesidad apremiante, resistencia.', reversed: 'Restricción extrema, desesperación.', mantra: 'De la necesidad nace mi mayor fortaleza', crystal: 'Cuarzo Ahumado', aroma: 'Mirra', agesta: '715' },
  { id: 'R11', name: 'Isa', icon: 'ᛁ', element: 'Agua', meaning: 'El hielo, estancamiento total temporal.', reversed: 'Frialdad emocional hiriente.', mantra: 'En la quietud encuentro mi verdadero norte', crystal: 'Cuarzo Claro', aroma: 'Eucalipto', agesta: '725' },
  { id: 'R12', name: 'Jera', icon: 'ᛃ', element: 'Tierra', meaning: 'La cosecha abundante, ciclo anual completado.', reversed: 'Ciclos repetitivos negativos.', mantra: 'Cosecho con gratitud lo que siembro con amor', crystal: 'Ágata Musgosa', aroma: 'Manzanilla', agesta: '2190' },
  { id: 'R13', name: 'Eihwaz', icon: 'ᛇ', element: 'Tierra', meaning: 'Defensa mística, el árbol de la vida Yggdrasil.', reversed: 'Debilidad espiritual, miedo al cambio.', mantra: 'Mis raíces son profundas, mi espíritu alcanza las estrellas', crystal: 'Ojo de Tigre', aroma: 'Pino', agesta: '108' },
  { id: 'R14', name: 'Perthro', icon: 'ᛈ', element: 'Agua', meaning: 'El gran misterio, el destino hilado por las Nornas.', reversed: 'Secretos oscuros revelados.', mantra: 'Abrazo los misterios de mi destino', crystal: 'Piedra Luna', aroma: 'Loto', agesta: '69' },
  { id: 'R15', name: 'Algiz', icon: 'ᛉ', element: 'Aire', meaning: 'Protección divina inquebrantable, escudo espiritual.', reversed: 'Vulnerabilidad oculta.', mantra: 'Un escudo de luz divina rodea todo mi ser', crystal: 'Amatista', aroma: 'Salvia', agesta: '8888' },
  { id: 'R16', name: 'Sowilo', icon: 'ᛋ', element: 'Fuego', meaning: 'El Sol radiante, éxito garantizado, fuerza vital.', reversed: 'Falsas metas cegadoras, agotamiento.', mantra: 'La luz del éxito baña todos mis proyectos', crystal: 'Piedra del Sol', aroma: 'Limón', agesta: '2190' },
  { id: 'R17', name: 'Tiwaz', icon: 'ᛏ', element: 'Aire', meaning: 'Victoria justa, honor inquebrantable.', reversed: 'Injusticia cósmica, cobardía.', mantra: 'La justicia divina opera a mi favor', crystal: 'Hematita', aroma: 'Sangre de Drago', agesta: '3128' },
  { id: 'R18', name: 'Berkano', icon: 'ᛒ', element: 'Tierra', meaning: 'Renacimiento, fertilidad física y mental.', reversed: 'Estancamiento familiar.', mantra: 'Me abro a los nuevos comienzos con amor', crystal: 'Esmeralda', aroma: 'Ylang-Ylang', agesta: '71269' },
  { id: 'R19', name: 'Ehwaz', icon: 'ᛖ', element: 'Tierra', meaning: 'El caballo, progreso firme, asociación leal.', reversed: 'Falta de armonía grave, traición.', mantra: 'Avanzo en perfecta sincronía con mi entorno', crystal: 'Malaquita', aroma: 'Romero', agesta: '897' },
  { id: 'R20', name: 'Mannaz', icon: 'ᛗ', element: 'Aire', meaning: 'La humanidad, el yo superior, la comunidad.', reversed: 'Aislamiento severo, autoengaño.', mantra: 'Soy uno con toda la red de la humanidad', crystal: 'Sodalita', aroma: 'Lavanda', agesta: '741' },
  { id: 'R21', name: 'Laguz', icon: 'ᛚ', element: 'Agua', meaning: 'El agua que fluye, intuición profunda.', reversed: 'Miedo paralizante, tormenta emocional.', mantra: 'Fluyo sin resistencia por el río de la vida', crystal: 'Aguamarina', aroma: 'Jazmín', agesta: '427' },
  { id: 'R22', name: 'Inguz', icon: 'ᛝ', element: 'Tierra', meaning: 'Fertilidad masculina, nuevos comienzos potentes.', reversed: 'Impotencia creativa, esfuerzo que se disipa.', mantra: 'La semilla de mis sueños germina con fuerza', crystal: 'Jade', aroma: 'Pachulí', agesta: '444' },
  { id: 'R23', name: 'Othala', icon: 'ᛟ', element: 'Tierra', meaning: 'Herencia material y espiritual, el hogar ancestral.', reversed: 'Problemas familiares graves.', mantra: 'Honro mis raíces y bendigo mi linaje', crystal: 'Ámbar', aroma: 'Cedro', agesta: '314' },
  { id: 'R24', name: 'Dagaz', icon: 'ᛞ', element: 'Fuego', meaning: 'El nuevo día, despertar espiritual brusco.', reversed: 'Ceguera ante lo obvio, final inminente doloroso.', mantra: 'Un nuevo amanecer ilumina mi consciencia', crystal: 'Cuarzo Claro', aroma: 'Naranja', agesta: '69' }
].map(r => ({...r, type: 'runa'}));

const ANGEL_ORACLE = [
  { id: 'A1', name: 'Arcángel Miguel', icon: '🛡️', element: 'Fuego', vibe: 'active', meaning: 'Protección absoluta, valor indomable, fuerza.', reversed: 'Miedo irracional constante, vulnerabilidad psíquica.', mantra: 'La espada azul de Miguel me protege y me libera.', crystal: 'Lapislázuli', aroma: 'Romero', agesta: '19' },
  { id: 'A2', name: 'Arcángel Gabriel', icon: '🕊️', element: 'Agua', vibe: 'mystic', meaning: 'Comunicación divina clara, expresión artística.', reversed: 'Bloqueo creativo profundo, mala comunicación.', mantra: 'El rayo blanco de Gabriel ilumina mi verdad y mi voz.', crystal: 'Piedra Luna', aroma: 'Lirio', agesta: '881' },
  { id: 'A3', name: 'Arcángel Rafael', icon: '⚕️', element: 'Aire', vibe: 'warm', meaning: 'Sanación física, mental y espiritual.', reversed: 'Enfermedad desatendida por negligencia.', mantra: 'La luz esmeralda de Rafael sana cada célula de mi ser.', crystal: 'Malaquita', aroma: 'Pino', agesta: '29' },
  { id: 'A4', name: 'Arcángel Uriel', icon: '💡', element: 'Tierra', vibe: 'active', meaning: 'Iluminación repentina, ideas brillantes, provisión.', reversed: 'Confusión mental grave, ignorancia.', mantra: 'El rayo oro-rubí de Uriel trae paz y provisión a mi vida.', crystal: 'Citrino', aroma: 'Naranja', agesta: '4' },
  { id: 'A5', name: 'Arcángel Chamuel', icon: '💖', element: 'Fuego', vibe: 'warm', meaning: 'Amor incondicional profundo, encontrar lo perdido.', reversed: 'Desamor, pérdida dolorosa, desconexión del amor.', mantra: 'La luz rosa de Chamuel envuelve mi corazón en amor puro.', crystal: 'Cuarzo Rosa', aroma: 'Rosa', agesta: '725' },
  { id: 'A6', name: 'Arcángel Jofiel', icon: '✨', element: 'Aire', vibe: 'warm', meaning: 'Belleza, iluminación mental, pensamientos positivos.', reversed: 'Negatividad asfixiante, entorno caótico.', mantra: 'El rayo amarillo de Jofiel ilumina mi mente con sabiduría.', crystal: 'Ojo de Tigre', aroma: 'Limón', agesta: '521' },
  { id: 'A7', name: 'Arcángel Zadquiel', icon: '💜', element: 'Éter', vibe: 'mystic', meaning: 'Transmutación de energía negativa, perdón profundo.', reversed: 'Rencor paralizante, cargas del pasado.', mantra: 'La llama violeta de Zadquiel transmuta todo error en luz.', crystal: 'Amatista', aroma: 'Lavanda', agesta: '389' },
  { id: 'A8', name: 'Arcángel Metatrón', icon: '🌌', element: 'Éter', vibe: 'mystic', meaning: 'Geometría sagrada, acceso a los registros akáshicos.', reversed: 'Desorden espiritual grave, desconexión divina.', mantra: 'El cubo de Metatrón equilibra y purifica mi energía.', crystal: 'Cuarzo Claro', aroma: 'Incienso', agesta: '331' }
].map(a => ({...a, type: 'angeles'}));

const ALL_CARDS = [...TAROT_DECK, ...RUNES, ...ANGEL_ORACLE];

// --- CONFIGURACIONES ESTRUCTURALES Y GEOMETRÍA SAGRADA ---
const SPREADS = {
  diaria: { label: 'Carta Diaria', count: 1, positions: ['Mensaje del Día'], layout: 'linear' },
  tiempo: { label: 'Pasado, Presente, Futuro', count: 3, positions: ['Pasado', 'Presente', 'Futuro'], layout: 'linear' },
  cruz_celta: { label: 'Cruz Celta', count: 6, positions: ['Situación', 'Desafío', 'Base', 'Pasado', 'Cielo', 'Futuro'], layout: 'cross' },
  arbol: { label: 'Árbol de la Vida', count: 10, positions: ['Corona', 'Sabiduría', 'Entendimiento', 'Misericordia', 'Fuerza', 'Belleza', 'Victoria', 'Esplendor', 'Fundamento', 'Reino'], layout: 'tree' },
  hibrida: { label: 'Tirada + Runa', count: 4, positions: ['Pasado', 'Presente', 'Futuro', 'Runa Síntesis'], layout: 'linear' },
  zodiac_diario: { label: 'Zodiaco Diario', count: 1, positions: ['Energía del Día'], layout: 'linear' },
  zodiac_semanal: { label: 'Zodiaco Semanal', count: 3, positions: ['Inicio de Semana', 'Desarrollo', 'Fin de Semana'], layout: 'linear' },
  zodiac_mensual: { label: 'Zodiaco Mensual', count: 3, positions: ['Reto', 'Oportunidad', 'Resultado Final'], layout: 'linear' },
  zodiac_anual: { label: 'Zodiaco Anual', count: 4, positions: ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Trimestre 4'], layout: 'linear' }
};

const ZODIAC_SIGNS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
const ZODIAC_TIMES = ['Diario', 'Semanal', 'Mensual', 'Anual'];
const READING_THEMES = ['General', 'Amor', 'Trabajo', 'Salud', 'Dinero', 'Espiritualidad'];

// Componente para resaltar palabras del glosario
const GlossaryText = ({ text }) => {
  if (!text) return null;
  const keys = Object.keys(GLOSSARY).sort((a,b) => b.length - a.length).join('|');
  const regex = new RegExp(`(\\b(?:${keys})\\b)`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        if (GLOSSARY[lowerPart]) {
          return (
            <span key={i} className="relative group cursor-help text-[#d4af37] border-b border-[#d4af37]/30 hover:border-[#d4af37] transition-all">
              {part}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-black/95 backdrop-blur-xl border border-[#d4af37]/50 rounded-xl text-[10px] text-white/90 opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] z-[100]">
                <strong className="block uppercase text-[#d4af37] mb-1">{part}</strong>
                {GLOSSARY[lowerPart]}
              </span>
            </span>
          );
        }
        if (part.includes('<b>') || part.includes('</b>')) return <span key={i} dangerouslySetInnerHTML={{__html: part}} />
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// Conversor PCM a WAV para el TTS de Gemini
const pcmToWav = (base64Pcm) => {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  
  const sampleRate = 24000; const numChannels = 1;
  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);
  
  const writeString = (offset, str) => { for (let i=0; i<str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  
  writeString(0, 'RIFF'); view.setUint32(4, 36 + bytes.length, true);
  writeString(8, 'WAVE'); writeString(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, numChannels * 2, true); view.setUint16(34, 16, true);
  writeString(36, 'data'); view.setUint32(40, bytes.length, true);
  
  new Uint8Array(buffer, 44).set(bytes);
  return new Blob([view], { type: 'audio/wav' });
};

// --- COMPONENTE PRINCIPAL APP ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [profile, setProfile] = useState({ name: '', dob: '', time: '12:00' });
  const [astroData, setAstroData] = useState({});
  const [moonData, setMoonData] = useState(getPreciseMoonPhase());
  const [dailyPlanet, setDailyPlanet] = useState(getDailyPlanet());
  
  const [view, setView] = useState('auth'); 
  const [deckStyle, setDeckStyle] = useState('mystic'); 
  const [step, setStep] = useState('mode_select'); 
  const [mode, setMode] = useState('virtual'); 
  
  const [deckType, setDeckType] = useState('tarot'); 
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState('tiempo');
  const [readingTheme, setReadingTheme] = useState('General');
  const [zodiacSign, setZodiacSign] = useState('Aries');
  const [zodiacTime, setZodiacTime] = useState('Diario');
  
  const [deck, setDeck] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [journal, setJournal] = useState([]);
  
  const [isMediumMode, setIsMediumMode] = useState(false);
  const [auraContext, setAuraContext] = useState('');
  const [isJournalLocked, setIsJournalLocked] = useState(false); 
  const videoRef = useRef(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioObj, setAudioObj] = useState(null);
  const [solfeggioFreq, setSolfeggioFreq] = useState(0); 
  const [binauralAudio, setBinauralAudio] = useState(null);

  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);

  const [visionState, setVisionState] = useState('idle'); 
  const [visionUrl, setVisionUrl] = useState(null);
  const [altarItem, setAltarItem] = useState(null);
  
  const [libraryFilter, setLibraryFilter] = useState('todos');
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryCard, setSelectedLibraryCard] = useState(null);

  const [agestaCount, setAgestaCount] = useState(0);
  const [activeGrabovoi, setActiveGrabovoi] = useState('');
  const [compatNumber, setCompatNumber] = useState('1');
  
  // Novedad: Estado para la Tarjeta de Códigos Generada
  const [codeCardData, setCodeCardData] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const visionFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #grimorio-print, #grimorio-print * { visibility: visible; }
        #grimorio-print { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; font-family: serif; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    try {
      const savedUser = localStorage.getItem('arkyan_user_2026');
      const savedJournal = localStorage.getItem('arkyan_journal_2026');
      const savedAltar = localStorage.getItem('arkyan_altar_2026');
      if (savedUser) { 
        const parsed = JSON.parse(savedUser);
        setUser(parsed); setProfile(parsed);
        setAstroData(calculateAstroNumerology(parsed.name, parsed.dob, parsed.time));
        setView('reading'); 
      }
      if (savedJournal) {
         const parsedJ = JSON.parse(savedJournal);
         setJournal(Array.isArray(parsedJ) ? parsedJ : []);
      }
      if (savedAltar) setAltarItem(JSON.parse(savedAltar));
      
      if(localStorage.getItem('arkyan_secure') === 'true') setIsJournalLocked(true);
    } catch (e) { }

    if (auth && !auth.currentUser) {
      const initAuth = async () => {
         try {
           const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
           if (token) await signInWithCustomToken(auth, token);
           else await signInAnonymously(auth);
         } catch(e) { }
      };
      initAuth();
    }
  }, []);

  useEffect(() => {
    let stream = null;
    if (isMediumMode) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => { alert("Lente denegado."); setIsMediumMode(false); });
    }
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [isMediumMode]);

  const showNotification = (msg) => alert(`✧ ${msg} ✧`); 
  const triggerHaptic = (pattern) => { if (navigator.vibrate) navigator.vibrate(pattern); };

  const playSolfeggio = (freq) => {
    if (binauralAudio) { binauralAudio.osc.stop(); binauralAudio.ctx.close(); }
    if (freq === 0) { setBinauralAudio(null); setSolfeggioFreq(0); return; }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      setBinauralAudio({ ctx, osc });
      setSolfeggioFreq(freq);
    } catch(e) {}
  };

  const handleLogin = () => {
    if (!profile.name || !profile.dob) return alert('Se requieren tu nombre y fecha terrenal.');
    localStorage.setItem('arkyan_user_2026', JSON.stringify(profile));
    setUser(profile); setAstroData(calculateAstroNumerology(profile.name, profile.dob, profile.time)); setView('reading');
  };

  const callGeminiAPI = async (payload, isVoice = false, isRaw = false) => {
    setIsGenerating(true);
    const key = apiKey || "YOUR_KEY_HERE";
    if (key === "YOUR_KEY_HERE" && !apiKey) { setIsGenerating(false); return isRaw ? "{}" : "El cosmos requiere tu llave API para revelar sus secretos."; }

    const endpoint = isVoice ? 'gemini-2.5-flash-preview-tts:generateContent' : 'gemini-2.5-flash-preview-09-2025:generateContent';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}?key=${key}`;
    
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setIsGenerating(false);
      
      if (isVoice) return data.candidates[0].content.parts[0].inlineData.data; // Base64 PCM
      return data.candidates[0].content.parts[0].text;
    } catch (err) { setIsGenerating(false); return isRaw ? "{}" : "Interferencia astral detectada."; }
  };

  const speakTextGemini = async (text) => {
    if (!text) return;
    if (isSpeaking && audioObj) { audioObj.pause(); setIsSpeaking(false); return; }
    const payload = {
      contents: [{ parts: [{ text: text.substring(0, 800) }] }], 
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } } }
    };
    const pcmBase64 = await callGeminiAPI(payload, true);
    if (!pcmBase64 || pcmBase64.includes("Interferencia") || pcmBase64.includes("requiere")) {
       alert("Sintetizador Neuronal requiere conexión estable."); return;
    }
    
    const wavBlob = pcmToWav(pcmBase64);
    const url = URL.createObjectURL(wavBlob);
    const audio = new Audio(url);
    audio.onended = () => setIsSpeaking(false);
    audio.play();
    setAudioObj(audio); setIsSpeaking(true);
  };

  const captureAura = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const b64 = canvas.toDataURL('image/jpeg').split(',')[1];
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: "Lee la emoción y el aura de este rostro en 2 o 3 palabras (Ej: Paz profunda, Ansiedad oculta). Sin explicaciones." }, { inlineData: { mimeType: "image/jpeg", data: b64 } }] }]
    };
    setIsGenerating(true);
    const aura = await callGeminiAPI(payload, false);
    setAuraContext(aura); setIsMediumMode(false);
    alert(`Aura detectada: ${aura}`);
  };

  const createRoom = async () => {
    if (!auth?.currentUser || !db) return alert("Conexión Firebase no detectada.");
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomRef = doc(db, 'artifacts', getAppId(), 'public', 'data', 'rooms', code);
    await setDoc(roomRef, { host: user.name, guest: '', cards: [], active: true });
    setRoomCode(code); setIsInRoom(true);
    
    onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (data && data.cards && data.cards.length > 0) {
          setSelectedCards(prev => data.cards.length > prev.length ? data.cards : prev);
      }
      if (data && data.step) setStep(data.step);
    });
  };

  const joinRoom = async (code) => {
    if (!auth?.currentUser || !db || !code) return;
    const roomRef = doc(db, 'artifacts', getAppId(), 'public', 'data', 'rooms', code);
    await updateDoc(roomRef, { guest: user.name });
    setRoomCode(code); setIsInRoom(true);
    
    onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (data && data.cards && data.cards.length > 0) {
          setSelectedCards(prev => data.cards.length > prev.length ? data.cards : prev);
      }
      if (data && data.step) setStep(data.step);
    });
  };

  const unlockJournal = async () => {
    try {
      if (window.PublicKeyCredential) {
        const pin = prompt("Ingresa Sello Rúnico (PIN: 1111) para abrir el Grimorio:");
        if(pin === '1111') setIsJournalLocked(false);
        else alert("Sello incorrecto.");
      } else {
        setIsJournalLocked(false);
      }
    } catch(e) { setIsJournalLocked(false); }
  };

  const startTarotReading = () => {
    triggerHaptic([50, 50]);
    let newDeck = MAJOR_ARCANA.map(c => ({ 
      ...c, uid: Math.random().toString(36).substr(2, 9), 
      isReversed: Math.random() > 0.8, rotation: Math.random() * 20 - 10, xOffset: Math.random() * 40 - 20, yOffset: Math.random() * 40 - 20 
    }));
    
    setDeck(newDeck.sort(() => Math.random() - 0.5));
    setStep('shuffle'); setShufflePhase(1); 
    
    setTimeout(() => setShufflePhase(2), 400);
    setTimeout(() => setShufflePhase(3), 800);
    setTimeout(() => { 
       setStep('pick'); 
       if(isInRoom && db && roomCode) updateDoc(doc(db, 'artifacts', getAppId(), 'public', 'data', 'rooms', roomCode), { step: 'pick' });
    }, 1200);
  };

  const pickCard = (card) => {
    const req = SPREADS[spreadType]?.count || 1;
    if (selectedCards.length >= req) return;
    
    triggerHaptic(50);
    const sel = [...selectedCards, { ...card, position: SPREADS[spreadType]?.positions[selectedCards.length] || 'Destino', isFlipped: false }];
    setSelectedCards(sel); setDeck(deck.filter(c => c.uid !== card.uid));

    if(isInRoom && db && roomCode) updateDoc(doc(db, 'artifacts', getAppId(), 'public', 'data', 'rooms', roomCode), { cards: sel });
    if (sel.length === req) setTimeout(() => setStep('read'), 600);
  };

  const flipCard = async (index) => {
    if (selectedCards[index].isFlipped || isGenerating) return;
    triggerHaptic(80); 
    
    const upd = selectedCards.map((c, i) => i === index ? { ...c, isFlipped: true } : c);
    setSelectedCards(upd);
    if(isInRoom && db && roomCode) updateDoc(doc(db, 'artifacts', getAppId(), 'public', 'data', 'rooms', roomCode), { cards: upd });

    if (upd.every(c => c.isFlipped) && chatHistory.length === 0) {
      setIsGenerating(true);
      const pastCtx = journal.length > 0 ? `Contexto pasado: El usuario consultó sobre "${journal[0].theme}" hace poco.` : '';
      const auraStr = auraContext ? `Estado Áurico actual: ${auraContext}.` : '';
      const ctx = upd.map(c => `${c.position}: ${c.name} ${c.isReversed ? '(Inv)' : ''}`).join(' | ');
      
      const query = `[Consultante: ${user.name}, Ascendente: ${astroData.ascSign || '-'}, Luna: ${astroData.moonSign || '-'}]. ${pastCtx} ${auraStr} Lectura de ${spreadType}. Cartas: ${ctx}. Interpreta el destino. Mantén el misticismo. Escribe en párrafos estructurados y usa HTML básico para resaltar (<b>) palabras importantes.`;
      
      const text = await callGeminiAPI({ contents: [{ parts: [{ text: query }] }], systemInstruction: { parts: [{ text: "Eres el Oráculo ΛRKY∆N." }] } });
      triggerHaptic([100, 50, 100]); setChatHistory([{ role: 'model', text }]);
      
      try {
        const entry = { id: Date.now(), date: new Date().toLocaleDateString(), theme: SPREADS[spreadType]?.label || spreadType, cards: upd, text, notes: '' };
        const updated = [entry, ...journal].slice(0, 30);
        setJournal(updated); localStorage.setItem('arkyan_journal_2026', JSON.stringify(updated));
      } catch(e){}
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const newHist = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHist); setChatInput('');
    const res = await callGeminiAPI({ contents: [{ parts: [{ text: `Historial:\n${newHist.map(h => `${h.role}: ${h.text}`).join('\n')}\nResponde directo y místico.` }] }], systemInstruction: { parts: [{ text: "Eres el Oráculo ΛRKY∆N." }] } });
    setChatHistory([...newHist, { role: 'model', text: res }]);
  };

  const handleMysticQuery = async (moduleType, specificAspect = "", specificValue = "") => {
    setIsGenerating(true);
    const userCtx = `[Consultante: ${user.name}, Signo: ${astroData.zodiac}, Planeta: ${astroData.planet}, Camino Vida: ${astroData.lifePath}, Expresión: ${astroData.expression}, Deuda Kármica: ${astroData.karmicDebt}]`;
    
    // --- INTEGRACIÓN DE JSON SCHEMA PARA TARJETAS AGESTA/GRABOVOI ---
    if (moduleType === 'agesta' || moduleType === 'grabovoi') {
      const isAgesta = moduleType === 'agesta';
      setAgestaCount(0);
      const prompt = `${userCtx}. Genera un protocolo de ${isAgesta ? 'Códigos Sagrados de Agesta' : 'Secuencias Numéricas de Grabovoi'} para el tema: "${question || specificAspect}". Genera una lista de 3 a 6 códigos específicos. Devuelve el resultado ESTRICTAMENTE en JSON.`;

      const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      title: { type: "STRING", description: "Título breve y místico de la tarjeta" },
                      description: { type: "STRING", description: "Breve frase mística de introducción al protocolo" },
                      codes: {
                          type: "ARRAY",
                          items: {
                              type: "OBJECT",
                              properties: {
                                  code: { type: "STRING", description: "El número o secuencia exacta" },
                                  meaning: { type: "STRING", description: "Propósito o significado muy breve (ej. 'Amor propio')" }
                              }
                          }
                      }
                  },
                  required: ["title", "description", "codes"]
              }
          },
          systemInstruction: { parts: [{ text: "Eres Oráculo ΛRKY∆N, maestro esotérico." }] }
      };

      try {
          const jsonText = await callGeminiAPI(payload, false, true); // true flag for raw text return
          const parsedData = JSON.parse(jsonText);
          setCodeCardData({ type: moduleType, data: parsedData });
          setChatHistory([{ role: 'model', text: parsedData.description }]);
          if (!isAgesta && parsedData.codes.length > 0) {
              setActiveGrabovoi(parsedData.codes[0].code);
          }
      } catch (e) {
          console.error(e);
          setChatHistory([{ role: 'model', text: "Interferencia cuántica. El formato de la tarjeta se ha fragmentado. Intenta de nuevo." }]);
      }
      setIsGenerating(false);
      return;
    }

    // --- LOGICA NUMEROLOGÍA NORMAL ---
    let query = "";
    if (specificAspect === 'Compatibilidad') query = `${userCtx}. Haz un análisis de SINASTRÍA NUMEROLÓGICA. Mi Camino Vida es ${astroData.lifePath}. ¿Cómo vibro con alguien de número ${specificValue}?`;
    else if (specificAspect) query = `${userCtx}. Analiza mi numerología. Mi "${specificAspect}" tiene el valor de "${specificValue}". Explica su luz y sombra.`;
    else query = `${userCtx}. Haz un análisis numerológico general. Menciona mi Camino Vida (${astroData.lifePath}), Expresión (${astroData.expression}) y Karma.`;

    const text = await callGeminiAPI({ contents: [{ parts: [{ text: query }] }], systemInstruction: { parts: [{ text: "Eres Oráculo ΛRKY∆N, maestro esotérico." }] } });
    triggerHaptic([100, 50, 100]); setChatHistory([{ role: 'model', text }]);
  };

  const handleAgestaTap = () => {
    if (agestaCount >= 45) return;
    const newCount = agestaCount + 1;
    setAgestaCount(newCount); triggerHaptic(newCount === 45 ? [100, 100, 100] : 30);
    if (newCount === 45) { showNotification('¡Código Activado! El portal cuántico está abierto.'); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPhotoPreview(reader.result); setStep('read_photo');
      const b64 = reader.result.split(',')[1]; const mime = reader.result.split(';')[0].split(':')[1];
      const payload = {
         contents: [{ role: "user", parts: [{ text: `Pregunta: ${question}. Identifica las cartas de la imagen e interpreta su significado de manera directa.` }, { inlineData: { mimeType: mime, data: b64 } }] }],
         systemInstruction: { parts: [{ text: "Eres el Oráculo ΛRKY∆N." }] }
      };
      const text = await callGeminiAPI(payload, false);
      setChatHistory([{ role: 'model', text }]);
    };
    reader.readAsDataURL(file);
  };

  const executeVision = async (type, b64 = null, mime = null) => {
    setVisionState('generating');
    const interpretation = chatHistory[0]?.text || 'Destino místico y etéreo';
    const prompt = `Pintura esotérica y mística, óleo hiperrealista. Ilustra simbólicamente la siguiente interpretación: "${interpretation.substring(0, 300)}". Sin texto.`;
    const key = apiKey || "YOUR_KEY_HERE";
    try {
      let b64Img = null;
      if (type === 'ethereal') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instances: { prompt }, parameters: { sampleCount: 1 } }) });
        if (!res.ok) throw new Error('API');
        b64Img = (await res.json()).predictions[0].bytesBase64Encoded;
      } else {
        const full = `Transforma el rostro de esta foto en el protagonista de: ${prompt}. Mantén rasgos integrados en el arte.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: full }, { inlineData: { mimeType: mime, data: b64 } }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }) });
        if (!res.ok) throw new Error('API');
        const data = await res.json();
        b64Img = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
        if(!b64Img) throw new Error('No image returned');
      }
      setVisionUrl(`data:image/png;base64,${b64Img}`); setVisionState('done');
    } catch (err) { setVisionState('error'); }
  };

  // NATIVO: Generador y Descarga de Tarjetas Canvas
  const downloadGeneratedCard = () => {
     if (!codeCardData) return;
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     const width = 800; const height = 1200;
     canvas.width = width; canvas.height = height;

     // Background (Deep dark mystic)
     ctx.fillStyle = '#0a0510'; 
     ctx.fillRect(0, 0, width, height);

     // Decorative Borders
     ctx.strokeStyle = '#d4af37';
     ctx.lineWidth = 4;
     ctx.strokeRect(30, 30, width - 60, height - 60);
     ctx.lineWidth = 1;
     ctx.strokeRect(40, 40, width - 80, height - 80);

     // Header Text
     ctx.fillStyle = '#d4af37';
     ctx.textAlign = 'center';
     ctx.font = 'bold 36px sans-serif';
     const header = codeCardData.type === 'agesta' ? "CÓDIGOS SAGRADOS DE AGESTA" : "CREANDO CON GRABOVOI";
     ctx.fillText(header, width/2, 100);

     // Header Ornaments
     ctx.beginPath(); ctx.moveTo(width/2 - 250, 120); ctx.lineTo(width/2 + 250, 120); ctx.stroke();
     ctx.beginPath(); ctx.moveTo(width/2 - 200, 130); ctx.lineTo(width/2 + 200, 130); ctx.stroke();

     // Title
     ctx.font = 'italic 32px serif';
     ctx.fillStyle = '#e0d5c1';
     ctx.fillText(codeCardData.data.title.toUpperCase(), width/2, 180);

     // Codes List
     let yPos = 260;
     codeCardData.data.codes.forEach(c => {
        // Draw elegant box
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.fillRect(80, yPos, 640, 90);
        ctx.strokeRect(80, yPos, 640, 90);

        // Code
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 38px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(c.code, 110, yPos + 55);

        // Meaning
        ctx.fillStyle = '#e0d5c1';
        ctx.font = '24px serif';
        ctx.textAlign = 'right';
        ctx.fillText(c.meaning, 690, yPos + 52);

        yPos += 120;
     });

     // Footer
     ctx.fillStyle = '#d4af37';
     ctx.font = '22px serif';
     ctx.textAlign = 'center';
     const footer = codeCardData.type === 'agesta' ? "Repetir 45 veces · Oráculo ΛRKY∆N" : "Visualizar en esfera plateada · Oráculo ΛRKY∆N";
     ctx.fillText(footer, width/2, height - 60);

     // Trigger Download
     const url = canvas.toDataURL('image/jpeg', 0.95);
     const a = document.createElement('a');
     a.href = url;
     a.download = `Arkyan_${codeCardData.type}_${Date.now()}.jpg`;
     a.click();
  };

  const reset = () => {
    setStep('mode_select'); setMode('virtual'); setSelectedCards([]); setChatHistory([]); setQuestion(''); 
    setVisionState('idle'); setVisionUrl(null); setAgestaCount(0); setActiveGrabovoi('');
    setCodeCardData(null); // Resetear tarjeta
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioObj) { audioObj.pause(); setIsSpeaking(false); }
    if (isMediumMode) setIsMediumMode(false);
  };

  const anchorToAltar = (card) => {
      setAltarItem(card);
      localStorage.setItem('arkyan_altar_2026', JSON.stringify(card));
      alert('Manifestación anclada en tu altar.');
      setSelectedLibraryCard(null);
  };

  // Helper para mostrar imágenes correctas de Pollinations (Fallback Mágico IA)
  const getFallbackImageUrl = (cardName) => {
    const encoded = encodeURIComponent(`mystical ethereal esoteric tarot card showing ${cardName}, intricate details, golden ratio, deep colors`);
    return `https://image.pollinations.ai/prompt/${encoded}?width=400&height=600&nologo=true`;
  };

  const renderGeometrySpread = () => {
    const isTree = spreadType === 'arbol';
    const isCross = spreadType === 'cruz_celta';
    
    if(!isTree && !isCross) {
      return (
        <div className="flex flex-wrap gap-6 justify-center w-full relative">
          {selectedCards.map((c, i) => (
            <div key={c.uid} className="flex flex-col items-center w-28 md:w-36 z-10 shrink-0">
              <span className="text-[#d4af37] text-[8px] md:text-[9px] uppercase tracking-widest mb-3 h-6 text-center">{c.position}</span>
              <div onClick={() => flipCard(i)} className="cursor-pointer perspective-1000 w-full aspect-[2/3] hover:-translate-y-2 transition-transform">
                <div className={`relative w-full h-full transform-style-3d transition-transform duration-[1.2s] ${c.isFlipped ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden bg-[#05020a] border-2 border-[#d4af37]/80 rounded-[15px] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center"><span className="text-3xl opacity-30">✧</span></div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black border-2 border-[#d4af37] rounded-[15px] flex flex-col items-center justify-center text-center overflow-hidden bg-cover bg-center" style={{backgroundImage: c.img ? `url(${BASE_IMG_URL}${c.img}), url(${getFallbackImageUrl(c.name)})` : 'none', backgroundBlendMode: 'overlay'}}>
                     <div className="absolute inset-0 bg-black/60 z-0"></div>
                     <span className="text-4xl mt-2 z-10">{c.icon}</span>
                     <span className="text-[9px] md:text-[10px] font-bold text-[#d4af37] mt-auto uppercase leading-tight mb-2 z-10 bg-black/80 px-2 py-1 rounded-full">{c.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`relative w-full max-w-2xl mx-auto h-[450px] md:h-[600px] border border-white/5 rounded-[40px] bg-[radial-gradient(circle_at_center,_#d4af37_0%,_transparent_20%)] bg-opacity-10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]`}>
         {selectedCards.map((c, i) => {
            let top = '0%', left = '50%';
            if (isCross) {
               const pos = [{t:'40%', l:'45%'}, {t:'40%', l:'45%', r:90}, {t:'75%', l:'45%'}, {t:'40%', l:'15%'}, {t:'10%', l:'45%'}, {t:'40%', l:'80%'}];
               top = pos[i]?.t; left = pos[i]?.l;
            }
            if (isTree) {
               const pos = [{t:'5%',l:'50%'}, {t:'20%',l:'75%'}, {t:'20%',l:'25%'}, {t:'40%',l:'75%'}, {t:'40%',l:'25%'}, {t:'50%',l:'50%'}, {t:'70%',l:'75%'}, {t:'70%',l:'25%'}, {t:'80%',l:'50%'}, {t:'95%',l:'50%'}];
               top = pos[i]?.t; left = pos[i]?.l;
            }
            const extraRot = isCross && i === 1 && c.isFlipped ? ' rotate-90' : '';

            return (
              <div key={c.uid} onClick={() => flipCard(i)} className={`absolute w-16 md:w-24 aspect-[2/3] -translate-x-1/2 -translate-y-1/2 cursor-pointer perspective-1000 z-${i}`} style={{ top, left }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#d4af37] text-[6px] md:text-[7px] uppercase tracking-widest w-[150%] text-center">{c.position}</span>
                <div className={`relative w-full h-full transform-style-3d transition-transform duration-1000 ${c.isFlipped ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden bg-[#05020a] border-2 border-[#d4af37]/80 rounded-[10px] shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-black border border-[#d4af37] rounded-[10px] flex flex-col items-center justify-center p-1 text-center bg-cover bg-center ${extraRot}`} style={{backgroundImage: c.img ? `url(${BASE_IMG_URL}${c.img}), url(${getFallbackImageUrl(c.name)})` : 'none', backgroundBlendMode: 'overlay'}}>
                     <div className="absolute inset-0 bg-black/60 z-0 rounded-[10px]"></div>
                     <span className="text-2xl z-10">{c.icon}</span>
                     <span className="text-[6px] md:text-[7px] font-bold text-[#d4af37] leading-tight mt-1 truncate w-full px-1 z-10 bg-black/80 rounded-full">{c.name}</span>
                  </div>
                </div>
              </div>
            );
         })}
      </div>
    );
  };

  const filteredLibrary = useMemo(() => {
    let list = ALL_CARDS;
    if (libraryFilter === 'mayores') list = list.filter(c => c.type === 'tarot_mayor');
    else if (libraryFilter === 'menores') list = list.filter(c => c.type === 'tarot_menor');
    else if (libraryFilter === 'runas') list = list.filter(c => c.type === 'runa');
    else if (libraryFilter === 'angeles') list = list.filter(c => c.type === 'angeles');
    if (librarySearch) { const q = librarySearch.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.meaning.toLowerCase().includes(q)); }
    return list;
  }, [libraryFilter, librarySearch]);

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-[#05010a] text-[#e0d5c1] font-serif p-4 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md p-8 backdrop-blur-xl bg-black/40 border border-[#d4af37]/40 rounded-[40px] flex flex-col gap-6 relative z-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <h1 className="text-4xl tracking-[0.4em] text-[#d4af37] font-light">ΛRKY∆N</h1>
          <p className="text-[9px] uppercase tracking-widest opacity-60">Portal Integral 2026</p>
          <input type="text" placeholder="Tu Nombre Verdadero" onChange={e=>setProfile({...profile, name: e.target.value})} className="p-4 bg-white/5 border-b border-[#d4af37]/40 outline-none focus:border-[#d4af37] text-sm text-center" />
          <input type="date" onChange={e=>setProfile({...profile, dob: e.target.value})} className="p-4 bg-white/5 border-b border-[#d4af37]/40 outline-none focus:border-[#d4af37] text-sm text-center text-white/70" />
          <input type="time" onChange={e=>setProfile({...profile, time: e.target.value})} className="p-4 bg-white/5 border-b border-[#d4af37]/40 outline-none focus:border-[#d4af37] text-sm text-center text-white/70" />
          <button onClick={handleLogin} className="p-5 bg-[#d4af37]/10 border border-[#d4af37]/60 rounded-full uppercase tracking-widest text-xs hover:bg-[#d4af37]/20 w-full mt-4 transition-all">Cruzar el Umbral</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05010a] text-[#e0d5c1] font-serif p-2 sm:p-4 flex flex-col items-center relative overflow-x-hidden">
      
      {/* HEADER ULTRA-PREMIUM */}
      <header className="w-full max-w-6xl mb-6 flex flex-col items-center justify-center relative z-20 animate-fadeInUp mt-2 no-print">
        <div className="flex gap-4 mb-2 text-[#d4af37]/80 text-[9px] md:text-[10px] tracking-widest uppercase">
           <span>{moonData.name} {moonData.eclipseWarning}</span>
           <span className="border-l border-white/20 pl-4">{dailyPlanet}</span>
        </div>
        <h1 className="text-3xl md:text-5xl tracking-[0.4em] font-light text-[#d4af37] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">ΛRKY∆N</h1>
        {user && (
           <div className="flex flex-wrap justify-center gap-3 mt-3 text-[7px] md:text-[9px] uppercase tracking-widest opacity-70 border border-white/10 px-6 py-2 rounded-full bg-black/40">
             <span className="text-[#d4af37]">Ascendente: {astroData.ascSign || '-'}</span> • <span>Luna: {astroData.moonSign || '-'}</span> • <span>Misión: {astroData.lifePath || '-'}</span>
           </div>
        )}
        
        {/* NAVEGACIÓN COMPLETA */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-black/60 border border-[#d4af37]/20 p-2 md:px-6 md:py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-4">
          {['reading', 'library', 'altar', 'journal'].map(v => (
            <button key={v} onClick={() => { setView(v); setStep('mode_select'); reset(); }} className={`flex items-center gap-1 md:gap-2 text-[7px] md:text-[9px] tracking-widest uppercase px-3 py-2 md:px-4 rounded-full transition-all ${view === v ? 'text-[#d4af37] bg-white/5 border border-[#d4af37]/30' : 'text-white/40 hover:text-white/90'}`}>
              {v === 'reading' ? 'Planos' : v === 'library' ? 'Glosario' : v === 'altar' ? 'Altar' : 'Grimorio'}
            </button>
          ))}
          <button onClick={() => setShowSettings(true)} className="p-2 text-lg opacity-40 hover:opacity-100 hover:text-[#d4af37] ml-1 md:ml-2">⚙️</button>
        </div>
      </header>

      {/* MODALES ADAPTADOS */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#05020a] border border-[#d4af37]/40 p-8 rounded-[30px] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">Ajustes de Vibración</h2>
              <button onClick={() => setShowSettings(false)} className="text-2xl opacity-50 hover:opacity-100">×</button>
            </div>
            <div className="space-y-4">
               <div>
                 <span className="text-[10px] uppercase tracking-widest opacity-80 block mb-2">Frecuencias Solfeggio 🎶</span>
                 <div className="flex gap-2">
                   {[{f:0, l:'Silencio'}, {f:432, l:'432Hz (Sanación)'}, {f:528, l:'528Hz (Milagros)'}, {f:852, l:'852Hz (Intuición)'}].map(o => (
                      <button key={o.f} onClick={()=>playSolfeggio(o.f)} className={`flex-1 p-2 text-[7px] md:text-[8px] uppercase tracking-widest rounded-lg border transition-all ${solfeggioFreq === o.f ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'border-white/10 text-white/50'}`}>{o.l}</button>
                   ))}
                 </div>
               </div>
               <div>
                 <span className="text-[10px] uppercase tracking-widest opacity-80 block mb-2">Privacidad Akáshica 🔐</span>
                 <button onClick={()=> { localStorage.setItem('arkyan_secure', 'true'); alert('El grimorio requerirá tu sello al iniciar.'); }} className="w-full p-3 bg-white/5 border border-white/10 hover:border-[#d4af37]/50 rounded-lg text-[9px] uppercase tracking-widest transition-all">Activar Sello</button>
               </div>
               <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-4 mt-6 bg-red-900/20 border border-red-500/30 rounded-xl text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-900/40 transition-all">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}

      {selectedLibraryCard && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLibraryCard(null)}>
          <div className="w-full max-w-lg bg-[#05010a] border border-[#d4af37]/40 p-6 md:p-8 rounded-[30px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center animate-fadeInUp relative" onClick={e => e.stopPropagation()}>
            <div className="flex w-full justify-between items-start mb-4">
               <button onClick={() => anchorToAltar(selectedLibraryCard)} className="text-[14px] md:text-[18px] opacity-60 hover:opacity-100 hover:text-[#d4af37] transition-all p-2 rounded-full border border-white/20 bg-white/5" title="Anclar al Altar">🕯️</button>
               <button onClick={() => setSelectedLibraryCard(null)} className="text-xl opacity-50 hover:opacity-100">×</button>
            </div>
            
            {/* Imagen con Fallback API de Pollinations si falla o no existe img */}
            <div className="w-24 md:w-32 h-36 md:h-48 rounded-[15px] border border-[#d4af37]/50 overflow-hidden mb-4 bg-black flex items-center justify-center relative">
               <img src={`${BASE_IMG_URL}${selectedLibraryCard.img}`} onError={(e)=>{e.target.onerror=null; e.target.src=getFallbackImageUrl(selectedLibraryCard.name);}} alt={selectedLibraryCard.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
            </div>

            <h2 className="text-base md:text-lg uppercase tracking-[0.3em] text-[#d4af37] mb-1 text-center w-full truncate">{selectedLibraryCard.name}</h2>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4 w-full border-b border-white/10 pb-4">
              <span className="text-[7px] md:text-[8px] uppercase tracking-widest border border-white/20 bg-white/5 px-3 py-1 rounded-full">{selectedLibraryCard.element || 'Éter'}</span>
              <span className="text-[7px] md:text-[8px] uppercase tracking-widest border border-white/20 bg-white/5 px-3 py-1 rounded-full">{selectedLibraryCard.type.replace('_', ' ')}</span>
              {selectedLibraryCard.planet && <span className="text-[7px] md:text-[8px] uppercase tracking-widest border border-[#d4af37]/40 text-[#d4af37] px-3 py-1 rounded-full">{selectedLibraryCard.planet}</span>}
              {selectedLibraryCard.agesta && <span className="text-[7px] md:text-[8px] uppercase tracking-widest border border-blue-400/40 text-blue-300 px-3 py-1 rounded-full">Freq: {selectedLibraryCard.agesta}</span>}
            </div>

            <div className="w-full text-left space-y-4 text-xs md:text-sm leading-relaxed max-h-[40vh] overflow-y-auto custom-scrollbar pr-3 mb-4">
              {selectedLibraryCard.keyword && (
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                     <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white/50 block mb-1">Palabra Clave</span>
                     <p className="text-[#d4af37] font-bold tracking-widest">{selectedLibraryCard.keyword}</p>
                  </div>
              )}
              {selectedLibraryCard.mantra && (
                  <div><span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-[#d4af37] block mb-1">Mantra de Activación</span><p className="opacity-90 italic border-l-2 border-[#d4af37] pl-3">"{selectedLibraryCard.mantra}"</p></div>
              )}
              <div><span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white/50 block mb-1">Luz / Significado</span><p className="opacity-90 font-light">{selectedLibraryCard.meaning}</p></div>
              <div><span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-red-400/70 block mb-1">Sombra / Invertida</span><p className="opacity-80 font-light text-red-100">{selectedLibraryCard.reversed}</p></div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                 {selectedLibraryCard.crystal && <div><span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-[#a2c2e0]/80 block mb-1">Mineral Ancla</span><p className="opacity-90 text-[10px] md:text-[11px]">{selectedLibraryCard.crystal}</p></div>}
                 {selectedLibraryCard.aroma && <div><span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-[#a2c2e0]/80 block mb-1">Aroma Conector</span><p className="opacity-90 text-[10px] md:text-[11px]">{selectedLibraryCard.aroma}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL FLUIDO */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col items-center justify-start relative z-10 px-2 pb-10">
        
        {view === 'reading' && step !== 'mode_select' && (
          <div className="w-full max-w-6xl flex justify-start mb-4 md:mb-8 pl-2">
             <button onClick={reset} className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase bg-black/40 border border-white/20 px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-white/10 hover:border-[#d4af37]/50 transition-all backdrop-blur-md">← Retornar</button>
          </div>
        )}

        {/* --- VISTA: LECTURAS Y PANEL MAESTRO --- */}
        {view === 'reading' && (
           <div className="w-full flex flex-col items-center animate-fadeInUp">
              {step === 'mode_select' && (
                 <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2 mt-4">
                    
                    {/* BANNERS ULTRA-PREMIUM */}
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                       <div className="p-4 md:p-6 bg-black/40 border border-[#d4af37]/30 hover:border-[#d4af37]/80 rounded-[20px] text-center relative flex flex-col justify-center items-center transition-all">
                          {!isMediumMode ? (
                            <button onClick={()=>setIsMediumMode(true)} className="w-full h-full group py-4">
                              <span className="text-3xl block mb-2 opacity-60 group-hover:opacity-100 transition-all drop-shadow-[0_0_10px_#d4af37]">👁️</span>
                              <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#d4af37]">Lente del Alma (Médium)</h3>
                              <p className="text-[8px] opacity-50 mt-2">IA lee tu microexpresión antes de tirar.</p>
                            </button>
                          ) : (
                            <div className="w-full">
                               <video ref={videoRef} autoPlay playsInline className="w-full h-32 md:h-40 object-cover rounded-xl mb-4 opacity-70 border border-white/20" />
                               <button onClick={captureAura} className="px-6 py-3 bg-[#d4af37]/20 border border-[#d4af37] rounded-full text-[9px] uppercase tracking-widest text-[#d4af37] w-full hover:bg-[#d4af37]/30 transition-all">Capturar Aura</button>
                            </div>
                          )}
                       </div>

                       <div className="p-4 md:p-6 bg-black/40 border border-[#d4af37]/30 hover:border-[#d4af37]/80 rounded-[20px] flex flex-col justify-center transition-all">
                          <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#d4af37] text-center mb-4">Sinastría Cuántica (Multijugador)</h3>
                          {!isInRoom ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button onClick={createRoom} className="flex-1 p-3 md:p-4 bg-white/5 border border-white/20 rounded-xl text-[8px] md:text-[9px] uppercase tracking-widest text-white/80 hover:border-[#d4af37] transition-all">Crear Sala</button>
                                <div className="flex-1 flex gap-2">
                                   <input type="text" placeholder="CÓDIGO" onChange={(e)=>setRoomCode(e.target.value.toUpperCase())} className="w-20 p-3 md:p-4 bg-black border border-white/20 rounded-xl text-center uppercase text-[10px] outline-none focus:border-[#d4af37]" />
                                   <button onClick={()=>joinRoom(roomCode)} className="flex-1 p-3 md:p-4 bg-white/5 border border-white/20 rounded-xl text-[8px] md:text-[9px] uppercase tracking-widest text-white/80 hover:border-[#d4af37] transition-all">Unirse</button>
                                </div>
                              </div>
                          ) : (
                              <div className="p-4 border border-green-500/30 bg-green-900/10 text-green-400 text-center text-[10px] uppercase tracking-widest rounded-xl">Conexión Establecida: <span className="font-bold">{roomCode}</span></div>
                          )}
                       </div>
                    </div>

                    <div className="col-span-full text-center mb-1 mt-4"><h2 className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-[#d4af37]/70 border-b border-[#d4af37]/20 pb-2 inline-block px-8">Planos Divinatorios</h2></div>
                    
                    <button onClick={() => { setMode('virtual'); setDeckType('tarot'); setSpreadType('diaria'); startTarotReading(); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">⚡</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Carta Diaria</h3></div>
                    </button>
                    <button onClick={() => { setMode('virtual'); setStep('setup_virtual'); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">🎴</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Plano Virtual</h3></div>
                    </button>
                    <button onClick={() => { setMode('photo'); setStep('setup_photo'); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">👁️</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Plano Físico</h3></div>
                    </button>
                    <button onClick={() => { setMode('zodiac'); setStep('setup_zodiac'); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full sm:col-span-2 lg:col-span-1 xl:col-span-1">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">✨</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Astrología</h3></div>
                    </button>

                    <div className="col-span-full text-center mb-1 mt-6"><h2 className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-[#d4af37]/70 border-b border-[#d4af37]/20 pb-2 inline-block px-8">Herramientas Energéticas</h2></div>

                    <button onClick={() => { setStep('setup_numerology'); setChatHistory([]); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">🔢</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Numerología Expandida</h3></div>
                    </button>
                    <button onClick={() => { setStep('setup_agesta'); setChatHistory([]); setQuestion(''); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">📿</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Códigos Agesta (Cartas)</h3></div>
                    </button>
                    <button onClick={() => { setStep('setup_grabovoi'); setChatHistory([]); setQuestion(''); }} className="p-6 md:p-8 bg-black/40 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 rounded-[24px] flex flex-col items-center gap-3 group transition-all w-full sm:col-span-2 lg:col-span-1 xl:col-span-1">
                      <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform drop-shadow-md">🌌</span>
                      <div className="text-center"><h3 className="uppercase tracking-[0.2em] text-[10px] text-[#d4af37] mb-1">Pilotajes Grabovoi (Cartas)</h3></div>
                    </button>
                 </div>
              )}

              {/* PANEL VIRTUAL SETUP */}
              {step === 'setup_virtual' && (
                 <div className="w-full max-w-4xl flex flex-col gap-6 md:gap-8 mt-4 animate-fadeInUp backdrop-blur-xl bg-black/30 p-4 md:p-8 rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10">
                    <div className="flex gap-2 p-1 bg-black/40 rounded-full border border-white/5 w-full max-w-lg mx-auto">
                       {['tarot', 'runas', 'angeles'].map(t => (
                         <button key={t} onClick={() => setDeckType(t)} className={`flex-1 py-3 text-[8px] md:text-[9px] uppercase tracking-[0.2em] rounded-full transition-all ${deckType === t ? 'bg-[#d4af37] text-black font-bold' : 'text-white/40 hover:text-white/90'}`}>{t === 'angeles' ? 'Ángeles' : t}</button>
                       ))}
                    </div>
                    <div className="flex gap-3 items-center border-b border-white/20 pb-3 w-full px-2">
                       <span className="text-[#d4af37] opacity-60 text-lg">✧</span>
                       <input type="text" placeholder="Susurra una duda al cosmos..." value={question} onChange={e => setQuestion(e.target.value)} className="flex-1 p-2 bg-transparent text-center focus:outline-none text-sm md:text-base placeholder:text-white/20 text-white/90" />
                    </div>
                    <div className="w-full">
                       <label className="block text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-[#d4af37]/70 mb-3 text-center">Enfoque de Energía</label>
                       <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-start sm:justify-center">
                         {READING_THEMES.map(t => (
                           <button key={t} onClick={() => setReadingTheme(t)} className={`px-4 py-2 text-[8px] md:text-[9px] uppercase tracking-widest rounded-full transition-all whitespace-nowrap ${readingTheme === t ? 'border border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]' : 'border border-white/10 text-white/40'}`}>{t}</button>
                         ))}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full px-2">
                       {Object.entries(SPREADS).filter(([k]) => !k.startsWith('zodiac_')).map(([k, v]) => {
                         if (k === 'hibrida' && deckType !== 'tarot') return null;
                         return (
                           <button key={k} onClick={() => setSpreadType(k)} className={`p-4 text-center rounded-[16px] transition-all border flex flex-col justify-center items-center h-full ${spreadType === k ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 hover:border-white/30 text-white/50'}`}>
                             <div className="text-[8px] md:text-[9px] tracking-widest uppercase">{v.label}</div>
                             <div className="text-[7px] opacity-40 mt-1">{v.count} entes</div>
                           </button>
                         );
                       })}
                    </div>
                    <button onClick={startTarotReading} className="mt-4 p-4 bg-[#d4af37]/10 border border-[#d4af37]/50 rounded-full uppercase tracking-widest text-[9px] text-[#d4af37] hover:bg-[#d4af37]/20 w-full max-w-xs mx-auto">Manifestar Cartas</button>
                 </div>
              )}

              {/* PANEL ZODIACO SETUP */}
              {step === 'setup_zodiac' && (
                 <div className="w-full max-w-lg flex flex-col gap-8 mt-4 animate-fadeInUp backdrop-blur-xl bg-black/30 p-8 rounded-[30px] border border-white/10">
                    <h2 className="text-xl tracking-[0.3em] text-[#d4af37] uppercase text-center font-light">Astrología Divinatoria</h2>
                    <div>
                      <label className="block text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-[#d4af37] mb-3 text-center">Tu Signo Zodiacal</label>
                      <select value={zodiacSign} onChange={e => setZodiacSign(e.target.value)} className="w-full p-4 bg-black/40 border border-white/20 rounded-xl focus:border-[#d4af37] outline-none text-sm text-center">
                        {ZODIAC_SIGNS.map(z => <option key={z} value={z} className="bg-[#0a0515] text-white">{z}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-[#d4af37] mb-3 text-center">Ciclo Temporal</label>
                      <div className="grid grid-cols-2 gap-3">
                        {ZODIAC_TIMES.map(t => (
                          <button key={t} onClick={() => setZodiacTime(t)} className={`p-4 border rounded-xl transition-all ${zodiacTime === t ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 text-white/50'}`}>
                            <div className="text-[9px] tracking-widest uppercase">{t}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={()=>{
                       setMode('zodiac'); setDeckType('tarot');
                       const typeMap = { 'Diario': 'zodiac_diario', 'Semanal': 'zodiac_semanal', 'Mensual': 'zodiac_mensual', 'Anual': 'zodiac_anual' };
                       setSpreadType(typeMap[zodiacTime]);
                       startTarotReading();
                    }} className="mt-2 p-4 bg-[#d4af37]/10 border border-[#d4af37]/50 rounded-full uppercase tracking-widest text-[9px] text-[#d4af37] hover:bg-[#d4af37]/20 w-full">Sincronizar Astros</button>
                 </div>
              )}

              {/* PANEL NUMEROLOGÍA SETUP */}
              {step === 'setup_numerology' && (
                 <div className="w-full max-w-5xl flex flex-col gap-6 mt-4 animate-fadeInUp px-2">
                    <div className="text-center mb-2">
                      <h2 className="text-xl md:text-3xl tracking-[0.3em] text-[#d4af37] uppercase font-light drop-shadow-md">Panel Numérico Expandido</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                       
                       <div className="p-6 bg-black/40 border border-white/10 rounded-[20px] lg:col-span-1">
                          <h3 className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] mb-4 border-b border-white/10 pb-2 flex justify-between"><span>Números de Fecha</span><span>🌳</span></h3>
                          <div className="space-y-2">
                            {[{ label: 'Camino de Vida', val: astroData.lifePath }, { label: 'Actitud', val: astroData.attitude }, { label: 'Día Natal', val: astroData.birthDay }, { label: 'Generación', val: astroData.generation }].map(item => (
                              <button key={item.label} onClick={() => handleMysticQuery('numerology', item.label, item.val)} className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-[#d4af37]/20 border border-transparent rounded-[10px] transition-all group">
                                 <span className="text-[9px] uppercase tracking-widest text-white/80 group-hover:text-[#d4af37] text-left">{item.label}</span>
                                 <span className="text-lg text-[#d4af37] font-bold">{item.val}</span>
                              </button>
                            ))}
                          </div>
                       </div>
                       
                       <div className="p-6 bg-black/40 border border-white/10 rounded-[20px] lg:col-span-1">
                          <h3 className="text-[9px] uppercase tracking-[0.3em] text-[#a2c2e0] mb-4 border-b border-white/10 pb-2 flex justify-between"><span>Números del Nombre</span><span>✨</span></h3>
                          <div className="space-y-2">
                            {[{ label: 'Expresión', val: astroData.expression }, { label: 'Alma (Deseo)', val: astroData.soul }, { label: 'Personalidad', val: astroData.personality }].map(item => (
                              <button key={item.label} onClick={() => handleMysticQuery('numerology', item.label, item.val)} className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-[#a2c2e0]/20 border border-transparent rounded-[10px] transition-all group">
                                 <span className="text-[9px] uppercase tracking-widest text-white/80 group-hover:text-[#a2c2e0] text-left">{item.label}</span>
                                 <span className="text-lg text-[#a2c2e0] font-bold">{item.val}</span>
                              </button>
                            ))}
                          </div>
                       </div>

                       <div className="p-6 bg-black/40 border border-white/10 rounded-[20px] lg:col-span-1">
                          <h3 className="text-[9px] uppercase tracking-[0.3em] text-purple-400 mb-4 border-b border-white/10 pb-2 flex justify-between"><span>Kármicos y Madurez</span><span>🌌</span></h3>
                          <div className="space-y-2">
                             <button onClick={() => handleMysticQuery('numerology', 'Deuda Kármica', astroData.karmicDebt)} className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-red-500/20 rounded-[10px] transition-all group">
                                <span className="text-[9px] uppercase tracking-widest text-white/80 group-hover:text-red-300">Deuda Kármica</span>
                                <span className={`text-sm font-bold ${astroData.karmicDebt !== 'Ninguna' ? 'text-red-400 animate-pulse' : 'text-white/40'}`}>{astroData.karmicDebt}</span>
                             </button>
                             <button onClick={() => handleMysticQuery('numerology', 'Madurez', astroData.maturity)} className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-purple-500/20 rounded-[10px] transition-all group">
                                <span className="text-[9px] uppercase tracking-widest text-white/80 group-hover:text-purple-300">Madurez</span>
                                <span className="text-lg text-purple-300 font-bold">{astroData.maturity}</span>
                             </button>
                             <button onClick={() => handleMysticQuery('numerology', 'Lecciones Kármicas', astroData.karmicLessons)} className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-purple-500/20 rounded-[10px] transition-all group">
                                <span className="text-[9px] uppercase tracking-widest text-white/80 group-hover:text-purple-300">Faltantes</span>
                                <span className="text-xs text-purple-300 max-w-[50%] text-right truncate">{astroData.karmicLessons}</span>
                             </button>
                          </div>
                       </div>
                       
                       <div className="p-6 bg-black/40 border border-white/10 rounded-[20px] lg:col-span-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 mb-4 border-b border-white/10 pb-2"><span>Ciclos Temporales</span></h3>
                            <div className="grid grid-cols-3 gap-2">
                               {[{ label: 'Día', val: astroData.personalDaily }, { label: 'Mes', val: astroData.personalMonth }, { label: 'Año', val: astroData.personalYear }].map(item => (
                                 <button key={item.label} onClick={() => handleMysticQuery('numerology', `Ciclo Personal ${item.label}`, item.val)} className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-emerald-500/20 rounded-[10px] transition-all group">
                                    <span className="text-[8px] uppercase tracking-widest text-white/60 group-hover:text-emerald-300 mb-1">{item.label}</span>
                                    <span className="text-lg font-bold text-emerald-300">{item.val}</span>
                                 </button>
                               ))}
                            </div>
                          </div>
                       </div>

                       <div className="p-6 bg-black/40 border border-[#d4af37]/30 rounded-[20px] lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div>
                             <h3 className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/80 mb-3">Sinastría (Compatibilidad)</h3>
                             <div className="flex gap-2">
                                <select value={compatNumber} onChange={(e) => setCompatNumber(e.target.value)} className="w-1/3 p-3 bg-black/60 border border-white/20 rounded-xl text-center text-white outline-none">
                                   {[1,2,3,4,5,6,7,8,9,11,22,33].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <button onClick={() => handleMysticQuery('numerology', 'Compatibilidad', compatNumber)} className="flex-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/50 rounded-xl text-[9px] uppercase tracking-widest text-[#d4af37] transition-all">Analizar</button>
                             </div>
                          </div>
                       </div>
                    </div>
                    {isGenerating && <div className="text-[10px] text-center uppercase tracking-widest text-[#d4af37] animate-pulseEthereal my-4">Desentrañando la matriz...</div>}
                    {chatHistory.length > 0 && !codeCardData && (
                      <div className="text-left text-[14px] font-light leading-[1.8] p-6 md:p-8 border border-[#d4af37]/40 rounded-[20px] bg-black/60 whitespace-pre-wrap relative overflow-hidden break-words mt-4">
                        <button onClick={() => speakTextGemini(chatHistory[0].text)} className="absolute top-4 right-4 text-xl opacity-40 hover:opacity-100 hover:text-[#d4af37] transition-all bg-white/5 p-2 rounded-full z-10">{isSpeaking ? '⏸️' : '🔊'}</button>
                        <div className="pt-4"><GlossaryText text={chatHistory[0].text} /></div>
                      </div>
                    )}
                 </div>
              )}

              {/* PANEL AGESTA SETUP (CON TARJETA) */}
              {step === 'setup_agesta' && (
                 <div className="w-full max-w-4xl flex flex-col gap-6 mt-4 animate-fadeInUp bg-black/30 p-6 md:p-10 rounded-[30px] border border-white/10">
                    <h2 className="text-xl md:text-2xl tracking-[0.3em] text-[#d4af37] uppercase text-center font-light">Códigos de Agesta en Tarjetas</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <input type="text" placeholder="Ej: Curación de dolor de cabeza..." value={question} onChange={e=>setQuestion(e.target.value)} className="flex-1 p-4 bg-black/40 border border-white/20 rounded-full text-sm outline-none text-center" />
                      <button onClick={() => handleMysticQuery('agesta')} className="px-8 py-4 border border-[#d4af37]/50 bg-[#d4af37]/10 rounded-full text-[9px] tracking-[0.3em] uppercase text-[#d4af37] hover:bg-[#d4af37]/20">Crear Tarjeta</button>
                    </div>
                    
                    {isGenerating && <div className="text-[10px] text-center uppercase tracking-widest text-[#d4af37] animate-pulseEthereal my-4">Canalizando frecuencias...</div>}
                    
                    {codeCardData && codeCardData.type === 'agesta' && (
                      <div className="mt-8 flex flex-col items-center animate-fadeInUp w-full">
                         {/* Visual UI of the Card */}
                         <div id="agesta-card" className="w-full max-w-md bg-[#0a0510] border-2 border-[#d4af37] p-8 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.3)] relative overflow-hidden">
                              <div className="absolute inset-2 border border-[#d4af37]/30 rounded-xl pointer-events-none"></div>
                              <h3 className="text-[#d4af37] text-center text-xs tracking-[0.4em] uppercase font-bold mb-3 border-b border-[#d4af37]/40 pb-2">Códigos Sagrados de Agesta</h3>
                              <h4 className="text-[#e0d5c1] text-center text-xl italic mb-6">{codeCardData.data.title}</h4>
                              <div className="space-y-4">
                                  {codeCardData.data.codes.map((c, i) => (
                                      <div key={i} className="flex justify-between items-center bg-black/50 border border-[#d4af37]/40 p-4 rounded-xl hover:bg-[#d4af37]/10 transition-colors">
                                          <span className="text-[#d4af37] font-bold text-2xl tracking-widest">{c.code}</span>
                                          <span className="text-white/80 text-sm text-right max-w-[50%]">{c.meaning}</span>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-8 text-center text-[9px] text-[#d4af37]/70 uppercase tracking-[0.3em]">
                                  Repetir 45 veces · Oráculo ΛRKY∆N
                              </div>
                         </div>
                         <button onClick={downloadGeneratedCard} className="mt-6 px-8 py-4 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] rounded-full uppercase tracking-widest text-[10px] hover:bg-[#d4af37]/40 transition-all flex items-center gap-2">
                             ⬇️ Descargar Tarjeta de Poder
                         </button>

                         {/* Lógica Japa Mala y TTS opcional */}
                         <div className="flex flex-col items-center gap-4 bg-black/40 p-6 rounded-[20px] border border-[#d4af37]/20 w-full max-w-sm mt-8">
                           <h3 className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/80 flex justify-between w-full px-4">
                              <span>Japa Mala Digital</span>
                              <button onClick={() => speakTextGemini(chatHistory[0].text)} className="text-lg opacity-60 hover:opacity-100 transition-all">{isSpeaking ? '⏸️' : '🔊 Info'}</button>
                           </h3>
                           <div onClick={handleAgestaTap} className={`w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none ${agestaCount === 45 ? 'bg-[#d4af37] text-black shadow-[0_0_40px_rgba(212,175,55,0.8)]' : 'bg-transparent border-[3px] border-[#d4af37]/40 text-[#d4af37] hover:border-[#d4af37]'}`}>
                              <span className="text-5xl font-light">{agestaCount}</span>
                           </div>
                           <p className="text-[8px] uppercase tracking-widest opacity-50 mt-2">{agestaCount === 45 ? 'Portal Activado' : 'Toca para repetir 45 veces'}</p>
                         </div>
                      </div>
                    )}
                 </div>
              )}

              {/* PANEL GRABOVOI SETUP (CON TARJETA) */}
              {step === 'setup_grabovoi' && (
                 <div className="w-full max-w-4xl flex flex-col gap-6 mt-4 animate-fadeInUp bg-black/30 p-6 md:p-10 rounded-[30px] border border-white/10">
                    <h2 className="text-xl md:text-2xl tracking-[0.3em] text-[#d4af37] uppercase text-center font-light">Pilotajes Grabovoi en Tarjetas</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <input type="text" placeholder="Ej: Armonizar el hogar..." value={question} onChange={e=>setQuestion(e.target.value)} className="flex-1 p-4 bg-black/40 border border-white/20 rounded-full text-sm outline-none text-center" />
                      <button onClick={() => handleMysticQuery('grabovoi')} className="px-8 py-4 border border-[#d4af37]/50 bg-[#d4af37]/10 rounded-full text-[9px] tracking-[0.3em] uppercase text-[#d4af37] hover:bg-[#d4af37]/20">Crear Tarjeta</button>
                    </div>

                    {isGenerating && <div className="text-[10px] text-center uppercase tracking-widest text-[#d4af37] animate-pulseEthereal my-4">Construyendo arquitectura cuántica...</div>}
                    
                    {codeCardData && codeCardData.type === 'grabovoi' && (
                      <div className="mt-8 flex flex-col items-center animate-fadeInUp w-full">
                         {/* Visual UI of the Card */}
                         <div id="grabovoi-card" className="w-full max-w-md bg-[#0a0510] border-2 border-[#d4af37] p-8 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.3)] relative overflow-hidden">
                              <div className="absolute inset-2 border border-[#d4af37]/30 rounded-xl pointer-events-none"></div>
                              <h3 className="text-[#d4af37] text-center text-xs tracking-[0.4em] uppercase font-bold mb-3 border-b border-[#d4af37]/40 pb-2">Creando con Grabovoi</h3>
                              <h4 className="text-[#e0d5c1] text-center text-xl italic mb-6">{codeCardData.data.title}</h4>
                              <div className="space-y-4">
                                  {codeCardData.data.codes.map((c, i) => (
                                      <div key={i} className="flex justify-between items-center bg-black/50 border border-[#d4af37]/40 p-4 rounded-xl hover:bg-[#d4af37]/10 transition-colors">
                                          <span className="text-[#d4af37] font-bold text-xl md:text-2xl tracking-widest">{c.code}</span>
                                          <span className="text-white/80 text-sm text-right max-w-[50%]">{c.meaning}</span>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-8 text-center text-[9px] text-[#d4af37]/70 uppercase tracking-[0.3em]">
                                  Secuencias Cuánticas · Oráculo ΛRKY∆N
                              </div>
                         </div>
                         <button onClick={downloadGeneratedCard} className="mt-6 px-8 py-4 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] rounded-full uppercase tracking-widest text-[10px] hover:bg-[#d4af37]/40 transition-all flex items-center gap-2">
                             ⬇️ Descargar Tarjeta de Protocolo
                         </button>

                         {/* Esfera de Concentración */}
                         <div className="flex flex-col items-center w-full mt-10">
                           <h3 className="text-[9px] uppercase tracking-[0.4em] text-[#d4af37]/80 mb-6 flex justify-between w-full max-w-xs items-center">
                               <span>Esfera Plateada</span>
                               <button onClick={() => speakTextGemini(chatHistory[0].text)} className="text-lg opacity-60 hover:opacity-100 transition-all">{isSpeaking ? '⏸️' : '🔊 Info'}</button>
                           </h3>
                           <div className="w-56 h-56 rounded-full relative flex items-center justify-center animate-silverSphere bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#c0c0c0_40%,_#808080_60%,_#333333_100%)] shadow-[0_0_50px_rgba(192,192,192,0.6)] border border-white/20">
                              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulseEthereal"></div>
                              <input type="text" value={activeGrabovoi} onChange={e=>setActiveGrabovoi(e.target.value)} placeholder="Secuencia..." className="bg-transparent text-center text-white/90 font-bold tracking-[0.2em] outline-none w-3/4 z-10 text-xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]" />
                           </div>
                           <p className="text-[8px] uppercase tracking-widest opacity-60 mt-8 text-center max-w-xs leading-relaxed">Visualiza los números ingresando a la esfera e ilumínalos con luz plateada.</p>
                        </div>
                      </div>
                    )}
                 </div>
              )}

              {/* FASE SHUFFLE Y PICK */}
              {step === 'shuffle' && (
                 <div className="h-[400px] w-full flex items-center justify-center relative mt-12 perspective-1000">
                   <div className="absolute inset-0 bg-[#d4af37]/5 rounded-full blur-[100px] animate-pulseEthereal"></div>
                   {deck.map((c, i) => (
                       <div key={c.uid} className={`absolute w-16 h-28 flex items-center justify-center transition-all duration-700`} style={{ transform: `translate3d(${shufflePhase===3?0:c.xOffset*2}px, ${shufflePhase===3?0:c.yOffset*2}px, ${i}px) rotate(${shufflePhase===3?0:c.rotation}deg)` }}>
                          <div className="w-full h-full bg-[#05020a] border border-[#d4af37]/50 rounded-[10px]"></div>
                       </div>
                   ))}
                 </div>
              )}

              {step === 'pick' && (
                 <div className="w-full flex flex-col items-center mt-12 px-2 max-w-full overflow-hidden">
                   <p className="mb-10 text-[10px] uppercase tracking-widest text-[#d4af37] animate-pulseEthereal">Elige {SPREADS[spreadType]?.count - selectedCards.length} ecos de luz</p>
                   <div className="flex flex-wrap justify-center gap-y-4 max-w-4xl perspective-1000">
                     {deck.map((c, i) => (
                         <div key={c.uid} onClick={() => pickCard(c)} className={`cursor-pointer hover:-translate-y-6 transform-style-3d transition-transform w-12 h-20 md:w-16 md:h-28`} style={{ zIndex: i, transform: `rotate(${(i - deck.length/2)*2}deg) translateY(${Math.abs(i - deck.length/2)*2}px)` }}>
                            <div className="w-full h-full bg-[#05020a] border border-[#d4af37]/50 rounded-[10px] shadow-[0_0_10px_rgba(212,175,55,0.2)]"></div>
                         </div>
                     ))}
                   </div>
                 </div>
              )}

              {/* FASE READ */}
              {step === 'read' && (
                 <div className="w-full flex flex-col items-center mt-12 px-4">
                    {renderGeometrySpread()}
                    
                    {selectedCards.every(c => c.isFlipped) && (
                      <div className="w-full max-w-4xl mt-16 p-8 md:p-12 border border-[#d4af37]/30 bg-black/60 backdrop-blur-xl rounded-[40px] relative shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                        {isGenerating && chatHistory.length === 0 ? (
                           <div className="py-12 flex justify-center"><div className="w-8 h-8 border-t-2 border-[#d4af37] rounded-full animate-spin"></div></div>
                        ) : (
                           <div className="flex flex-col gap-6 relative pt-4">
                              <button onClick={() => speakTextGemini(chatHistory[chatHistory.length-1]?.text)} className="absolute -top-6 right-0 text-xl bg-white/5 p-3 rounded-full hover:bg-white/10 z-10 transition-all border border-white/10">{isSpeaking ? '⏸️' : '🔊'}</button>
                              
                              <div className="text-[14px] leading-loose font-light text-white/90 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                                 {chatHistory.map((msg, i) => (
                                    <p key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right opacity-60 italic' : ''}`}>
                                       <GlossaryText text={msg.text} />
                                    </p>
                                 ))}
                                 {isGenerating && <div className="text-[9px] uppercase tracking-widest text-[#d4af37] opacity-60 animate-pulseEthereal mt-4">El oráculo canaliza...</div>}
                              </div>

                              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end border-t border-white/10 pt-6">
                                 <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Haz una pregunta adicional a las cartas..." className="flex-1 w-full p-4 bg-white/5 border border-white/20 rounded-full text-sm outline-none text-center sm:text-left focus:border-[#d4af37]" />
                                 <button onClick={handleChat} className="px-8 py-4 border border-[#d4af37]/50 bg-[#d4af37]/10 rounded-full text-[9px] tracking-widest uppercase text-[#d4af37] hover:bg-[#d4af37]/20 w-full sm:w-auto">Consultar</button>
                              </div>

                              <div className="mt-6 border-t border-white/10 pt-6 w-full flex flex-col items-center">
                                {visionState === 'idle' && (
                                  <button onClick={() => setVisionState('choosing')} className="text-[8px] uppercase tracking-[0.4em] text-[#d4af37] border border-[#d4af37]/30 rounded-full px-6 py-3 hover:border-[#d4af37] transition-all">✨ Visión Cósmica</button>
                                )}
                                {visionState === 'choosing' && (
                                  <div className="flex gap-4 w-full justify-center">
                                    <button onClick={() => handleGenerateVision('ethereal')} className="flex-1 max-w-[200px] p-4 border border-white/20 bg-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-[#d4af37]/60">
                                      <span className="text-2xl">🌌</span><span className="text-[8px] uppercase tracking-widest text-[#d4af37]">Abstracta</span>
                                    </button>
                                    <input type="file" accept="image/*" className="hidden" ref={visionFileRef} onChange={(e) => handleGenerateVision('incarnate', e)} />
                                    <button onClick={() => visionFileRef.current?.click()} className="flex-1 max-w-[200px] p-4 border border-white/20 bg-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-[#d4af37]/60">
                                      <span className="text-2xl">👤</span><span className="text-[8px] uppercase tracking-widest text-[#d4af37]">Encarnar (Foto)</span>
                                    </button>
                                  </div>
                                )}
                                {visionState === 'generating' && <div className="py-4 text-[9px] uppercase tracking-widest text-[#d4af37] animate-pulseEthereal">Pintando el destino...</div>}
                                {visionState === 'error' && <div className="text-[9px] text-red-400 py-4">Fallo visual. <button onClick={()=>setVisionState('choosing')} className="underline">Reintentar</button></div>}
                                {visionState === 'done' && visionUrl && (
                                  <div className="flex flex-col items-center gap-4 w-full mt-4">
                                    <img src={visionUrl} alt="Visión" className="w-full max-w-sm border-2 border-[#d4af37]/50 rounded-[20px] object-cover" />
                                    <button onClick={() => setVisionState('idle')} className="text-[8px] uppercase tracking-widest text-white/50 border border-white/20 rounded-full px-6 py-2 hover:text-white">Cerrar Visión</button>
                                  </div>
                                )}
                              </div>
                           </div>
                        )}
                      </div>
                    )}
                 </div>
              )}
           </div>
        )}

        {/* --- VISTA: BIBLIOTECA (GLOSARIO) --- */}
        {view === 'library' && (
          <div className="w-full flex flex-col gap-6 md:gap-8 animate-fadeInUp mt-4">
            <div className="w-full flex flex-col gap-4 items-center px-2">
              <input type="text" placeholder="Buscar ecos..." value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} className="w-full max-w-lg p-4 bg-black/40 border border-[#d4af37]/40 rounded-full text-sm outline-none text-center" />
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-start md:justify-center w-full">
                {['todos', 'mayores', 'menores', 'runas', 'angeles'].map(f => (
                  <button key={f} onClick={() => setLibraryFilter(f)} className={`px-4 py-2 border rounded-full text-[8px] md:text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${libraryFilter === f ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-black/40 border-white/10 text-white/50'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 px-2">
              {filteredLibrary.map(c => (
                <div key={c.id} onClick={() => setSelectedLibraryCard(c)} className="p-4 bg-black/40 border border-white/10 rounded-[20px] flex flex-col items-center text-center cursor-pointer hover:border-[#d4af37]/50 transition-all overflow-hidden relative">
                  <div className="w-12 h-20 mb-3 rounded-[8px] overflow-hidden bg-black/60 relative border border-[#d4af37]/30 flex items-center justify-center">
                      <img src={`${BASE_IMG_URL}${c.img}`} onError={(e)=>{e.target.onerror=null; e.target.src=getFallbackImageUrl(c.name);}} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                      {!c.img && <span className="text-3xl z-10">{c.icon}</span>}
                  </div>
                  <span className="text-[8px] md:text-[9px] tracking-widest uppercase font-bold text-white/90 truncate w-full">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VISTA: DIARIO / GRIMORIO --- */}
        {view === 'journal' && (
           <main className="w-full max-w-4xl px-4 flex flex-col items-center mt-4">
              {isJournalLocked ? (
                 <div className="p-10 border border-[#d4af37]/30 bg-black/60 rounded-[30px] text-center mt-12 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <span className="text-4xl block mb-4">🔐</span>
                    <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] mb-6">Grimorio Sellado Biométricamente</h2>
                    <button onClick={unlockJournal} className="w-full py-4 bg-[#d4af37]/10 border border-[#d4af37]/50 rounded-xl text-[10px] uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37]/20">Abrir Sello Rúnico</button>
                 </div>
              ) : (
                 <div className="w-full" id="grimorio-print">
                    <div className="flex gap-4 mb-8 no-print justify-center w-full">
                       <button onClick={() => window.print()} className="flex-1 md:flex-none px-8 py-4 bg-white/5 border border-white/20 rounded-full text-[8px] md:text-[9px] uppercase tracking-widest text-white/80 hover:bg-white/10 transition-all text-center">Generar Pergamino (PDF)</button>
                    </div>
                    {journal.length === 0 && <p className="text-center text-[10px] uppercase tracking-widest text-white/40 mt-10">El Grimorio está en blanco.</p>}
                    {journal.map(j => (
                       <div key={j.id} className="p-6 md:p-8 mb-6 border border-[#d4af37]/20 bg-black/40 rounded-[30px] print:bg-transparent print:border-black print:text-black print:rounded-none">
                          <div className="flex justify-between items-center text-[8px] uppercase tracking-widest mb-4 print:text-black">
                             <span className="text-[#d4af37] print:text-black">{j.date} • {j.theme}</span>
                          </div>
                          <div className="text-[13px] md:text-[14px] leading-loose font-light print:text-black break-words"><GlossaryText text={j.text} /></div>
                       </div>
                    ))}
                 </div>
              )}
           </main>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.7s forwards; }
        
        @keyframes pulseEthereal { 0%, 100% { opacity: 0.5; filter: brightness(1); } 50% { opacity: 1; filter: brightness(1.3); } }
        .animate-pulseEthereal { animation: pulseEthereal 4s ease-in-out infinite; }
        
        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-floatSlow { animation: floatSlow 6s ease-in-out infinite; }

        @keyframes spinReverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .animate-spinReverse { animation: spinReverse 8s linear infinite; display: inline-block; }

        @keyframes silverSphere { 0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(192,192,192,0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(192,192,192,0.8); } }
        .animate-silverSphere { animation: silverSphere 4s ease-in-out infinite; }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 3px; }

        .bg-stars {
          background-image: radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #d4af37, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.8), rgba(0,0,0,0)), radial-gradient(1px 1px at 250px 180px, #ffffff, rgba(0,0,0,0));
          background-repeat: repeat; background-size: 600px 300px;
        }
      `}} />
    </div>
  );
}