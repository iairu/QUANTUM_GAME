'use strict';
// Poznatky navyše podľa obťažnosti:
//  THEORY  — „📐 Teória a rovnice“ v paneli levelu (normálna: len jadro, ťažká/prastará: jadro + krok)
//  TRAPS_HARD    — extra otázky s rovnicami na konci levelu (ťažká, prastará)
// Farby: α je vždy modrá, β červená — rovnako ako v pohľadoch 👁, aby sa symbol dal spojiť s obrázkom.

const cA = '<i class="ca">α</i>', cB = '<i class="cb">β</i>';
const EQ = (h) => `<div class="eq eqb">${h}</div>`; // eqb = blok rovnice s vlastným pozadím
const pick = (pair) => (Array.isArray(pair) ? tr(...pair) : pair);

// každá položka: [slovensky, anglicky, ukrajinsky]; voliteľne views: { krok: 'pohľad' } = tlačidlo „👁 ukáž“
const THEORY = {
  1: {
    views: { setHand: 'hands', timesI: 'hands', interference: 'hands' },
    core: [
      `Amplitúda je komplexné číslo v polárnom tvare ${EQ(`${cA} = |${cA}|·e<sup>iφ</sup> = |${cA}|(cos φ + i sin φ)`)}Bornovo pravidlo: ${EQ(`P = |${cA}|² = ${cA}·${cA}* = (Re ${cA})² + (Im ${cA})²`)}Fáza φ v jednej amplitúde sa v P stratí; prejaví sa až pri sčítaní amplitúd.`,
      `An amplitude is a complex number in polar form ${EQ(`${cA} = |${cA}|·e<sup>iφ</sup> = |${cA}|(cos φ + i sin φ)`)}The Born rule: ${EQ(`P = |${cA}|² = ${cA}·${cA}* = (Re ${cA})² + (Im ${cA})²`)}The phase φ of a single amplitude is lost in P; it only shows up when amplitudes are added.`,
      `Амплітуда — комплексне число в полярній формі ${EQ(`${cA} = |${cA}|·e<sup>iφ</sup> = |${cA}|(cos φ + i sin φ)`)}Правило Борна: ${EQ(`P = |${cA}|² = ${cA}·${cA}* = (Re ${cA})² + (Im ${cA})²`)}Фаза φ окремої амплітуди в P губиться; вона проявляється лише під час додавання амплітуд.`],
    setHand: [
      `Násobenie fázovým faktorom zachová veľkosť: ${EQ(`|e<sup>iφ</sup>${cA}| = |e<sup>iφ</sup>|·|${cA}| = |${cA}|`)}Kartézsky tvar cieľa: Re = |${cA}| cos φ, Im = |${cA}| sin φ. Pre 0,7·e<sup>i3π/4</sup>: Re ≈ −0,49, Im ≈ 0,49.`,
      `Multiplying by a phase factor keeps the magnitude: ${EQ(`|e<sup>iφ</sup>${cA}| = |e<sup>iφ</sup>|·|${cA}| = |${cA}|`)}Cartesian form of the target: Re = |${cA}| cos φ, Im = |${cA}| sin φ. For 0.7·e<sup>i3π/4</sup>: Re ≈ −0.49, Im ≈ 0.49.`,
      `Множення на фазовий множник зберігає модуль: ${EQ(`|e<sup>iφ</sup>${cA}| = |e<sup>iφ</sup>|·|${cA}| = |${cA}|`)}Декартова форма цілі: Re = |${cA}| cos φ, Im = |${cA}| sin φ. Для 0,7·e<sup>i3π/4</sup>: Re ≈ −0,49, Im ≈ 0,49.`],
    timesI: [
      `${EQ('i = e<sup>iπ/2</sup> ⇒ i·z = |z|·e<sup>i(φ + π/2)</sup>')}Mocniny i sú body na jednotkovej kružnici: i⁰ = 1, i¹ = i, i² = −1, i³ = −i, i⁴ = 1. Eulerova identita ${EQ('e<sup>iπ</sup> + 1 = 0')}spája päť základných konštánt.`,
      `${EQ('i = e<sup>iπ/2</sup> ⇒ i·z = |z|·e<sup>i(φ + π/2)</sup>')}Powers of i are points on the unit circle: i⁰ = 1, i¹ = i, i² = −1, i³ = −i, i⁴ = 1. Euler’s identity ${EQ('e<sup>iπ</sup> + 1 = 0')}links five fundamental constants.`,
      `${EQ('i = e<sup>iπ/2</sup> ⇒ i·z = |z|·e<sup>i(φ + π/2)</sup>')}Степені i — точки на одиничному колі: i⁰ = 1, i¹ = i, i² = −1, i³ = −i, i⁴ = 1. Тотожність Ейлера ${EQ('e<sup>iπ</sup> + 1 = 0')}пов’язує п’ять фундаментальних сталих.`],
    interference: [
      `Pre dve nerozlíšiteľné cesty: ${EQ('P = |A₁ + A₂|² = |A₁|² + |A₂|² + 2 Re(A₁A₂*)')}Posledný člen je <b>interferenčný</b>. Pre |A₁| = |A₂| = ½ a relatívnu fázu Δφ: ${EQ('P = ½(1 + cos Δφ) = cos²(Δφ/2)')}Klasicky (rozlíšiteľné cesty) ostane len |A₁|² + |A₂|² = ½.`,
      `For two indistinguishable paths: ${EQ('P = |A₁ + A₂|² = |A₁|² + |A₂|² + 2 Re(A₁A₂*)')}The last term is the <b>interference</b> term. For |A₁| = |A₂| = ½ and relative phase Δφ: ${EQ('P = ½(1 + cos Δφ) = cos²(Δφ/2)')}Classically (distinguishable paths) only |A₁|² + |A₂|² = ½ remains.`,
      `Для двох нерозрізненних шляхів: ${EQ('P = |A₁ + A₂|² = |A₁|² + |A₂|² + 2 Re(A₁A₂*)')}Останній доданок — <b>інтерференційний</b>. Для |A₁| = |A₂| = ½ і відносної фази Δφ: ${EQ('P = ½(1 + cos Δφ) = cos²(Δφ/2)')}Класично (розрізненні шляхи) лишається тільки |A₁|² + |A₂|² = ½.`],
  },
  2: {
    views: { twoSpots: 'bases', sequences: 'bases', predict: 'bloch2d' },
    core: [
      `Spin ½ v magnetickom poli: energia ${EQ('E = −μ·B, &nbsp; F<sub>z</sub> = μ<sub>z</sub> ∂B<sub>z</sub>/∂z')}Sila vzniká len v <b>nehomogénnom</b> poli. Kvantovo má S<sub>z</sub> iba dve hodnoty: ${EQ('S<sub>z</sub> = ±ħ/2, &nbsp; ħ = h/2π ≈ 1,055·10⁻³⁴ J·s')}`,
      `A spin ½ in a magnetic field: energy ${EQ('E = −μ·B, &nbsp; F<sub>z</sub> = μ<sub>z</sub> ∂B<sub>z</sub>/∂z')}A force appears only in an <b>inhomogeneous</b> field. Quantum mechanically S<sub>z</sub> has only two values: ${EQ('S<sub>z</sub> = ±ħ/2, &nbsp; ħ = h/2π ≈ 1.055·10⁻³⁴ J·s')}`,
      `Спін ½ у магнітному полі: енергія ${EQ('E = −μ·B, &nbsp; F<sub>z</sub> = μ<sub>z</sub> ∂B<sub>z</sub>/∂z')}Сила виникає лише в <b>неоднорідному</b> полі. Квантово S<sub>z</sub> має лише два значення: ${EQ('S<sub>z</sub> = ±ħ/2, &nbsp; ħ = h/2π ≈ 1,055·10⁻³⁴ Дж·с')}`],
    twoSpots: [
      `Klasický náhodný magnetík by mal μ<sub>z</sub> = μ cos ϑ s rovnomerne rozdeleným cos ϑ ∈ [−1, 1] → spojitý pás. Nepolarizovaný zväzok je kvantovo ${EQ(`ρ = ½|0⟩⟨0| + ½|1⟩⟨1| = I/2`)}— stred Blochovej sféry, a v <i>každej</i> osi dáva 50 : 50.`,
      `A classical randomly oriented magnet would have μ<sub>z</sub> = μ cos ϑ with cos ϑ uniform in [−1, 1] → a continuous band. An unpolarised beam is, quantum mechanically, ${EQ(`ρ = ½|0⟩⟨0| + ½|1⟩⟨1| = I/2`)}— the centre of the Bloch sphere, giving 50 : 50 along <i>every</i> axis.`,
      `Класичний навмання орієнтований магніт мав би μ<sub>z</sub> = μ cos ϑ з cos ϑ, рівномірно розподіленим на [−1, 1] → суцільна смуга. Неполяризований пучок квантово — це ${EQ(`ρ = ½|0⟩⟨0| + ½|1⟩⟨1| = I/2`)}— центр сфери Блоха, що дає 50 : 50 уздовж <i>кожної</i> осі.`],
    sequences: [
      `Báza X vyjadrená cez bázu Z: ${EQ(`|±x⟩ = (|0⟩ ± |1⟩)/√2 &nbsp;⇒&nbsp; |⟨0|+x⟩|² = ½`)}Meranie je projekcia: po výsledku „+x“ je stav |+x⟩ bez ohľadu na minulosť. Preto Z+ → X+ → Z dá znova ½ : ½. Operátory S<sub>x</sub>, S<sub>z</sub> nekomutujú: ${EQ('[S<sub>x</sub>, S<sub>z</sub>] = −iħ S<sub>y</sub> ≠ 0')}`,
      `The X basis expressed in the Z basis: ${EQ(`|±x⟩ = (|0⟩ ± |1⟩)/√2 &nbsp;⇒&nbsp; |⟨0|+x⟩|² = ½`)}A measurement is a projection: after the result “+x” the state is |+x⟩ regardless of its past. That is why Z+ → X+ → Z gives ½ : ½ again. The operators S<sub>x</sub>, S<sub>z</sub> do not commute: ${EQ('[S<sub>x</sub>, S<sub>z</sub>] = −iħ S<sub>y</sub> ≠ 0')}`,
      `Базис X, виражений у базисі Z: ${EQ(`|±x⟩ = (|0⟩ ± |1⟩)/√2 &nbsp;⇒&nbsp; |⟨0|+x⟩|² = ½`)}Вимірювання — це проєкція: після результату «+x» стан є |+x⟩ незалежно від свого минулого. Тому Z+ → X+ → Z знову дає ½ : ½. Оператори S<sub>x</sub>, S<sub>z</sub> не комутують: ${EQ('[S<sub>x</sub>, S<sub>z</sub>] = −iħ S<sub>y</sub> ≠ 0')}`],
    predict: [
      `Stav |+z⟩ meraný pozdĺž osi n odklonenej o uhol ϑ: ${EQ('P(+n) = |⟨+n|+z⟩|² = cos²(ϑ/2) = (1 + cos ϑ)/2')}Polovičný uhol je podpis spinu ½: otočenie o 360° vynásobí stav číslom −1 (globálna fáza), až 720° ho vráti presne.`,
      `The state |+z⟩ measured along an axis n tilted by ϑ: ${EQ('P(+n) = |⟨+n|+z⟩|² = cos²(ϑ/2) = (1 + cos ϑ)/2')}The half angle is the signature of spin ½: a 360° rotation multiplies the state by −1 (a global phase); only 720° brings it back exactly.`,
      `Стан |+z⟩, виміряний уздовж осі n, нахиленої на ϑ: ${EQ('P(+n) = |⟨+n|+z⟩|² = cos²(ϑ/2) = (1 + cos ϑ)/2')}Половинний кут — ознака спіну ½: поворот на 360° множить стан на −1 (глобальна фаза); точно повертає його лише 720°.`],
  },
  3: {
    views: { puzzles: 'bloch2d', measure: 'bases', lab: 'all' },
    core: [
      `Každý čistý stav qubitu: ${EQ(`|ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup> sin(θ/2)|1⟩, &nbsp; ${cA} = cos(θ/2), ${cB} = e<sup>iφ</sup> sin(θ/2)`)}Blochov vektor: ${EQ('r = (sin θ cos φ, sin θ sin φ, cos θ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩)')}Hradlo = rotácia: ${EQ('R<sub>n</sub>(α) = e<sup>−iα n·σ/2</sup> = cos(α/2) I − i sin(α/2) (n·σ)')}`,
      `Every pure qubit state: ${EQ(`|ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup> sin(θ/2)|1⟩, &nbsp; ${cA} = cos(θ/2), ${cB} = e<sup>iφ</sup> sin(θ/2)`)}Bloch vector: ${EQ('r = (sin θ cos φ, sin θ sin φ, cos θ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩)')}A gate = a rotation: ${EQ('R<sub>n</sub>(α) = e<sup>−iα n·σ/2</sup> = cos(α/2) I − i sin(α/2) (n·σ)')}`,
      `Кожен чистий стан кубіта: ${EQ(`|ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup> sin(θ/2)|1⟩, &nbsp; ${cA} = cos(θ/2), ${cB} = e<sup>iφ</sup> sin(θ/2)`)}Вектор Блоха: ${EQ('r = (sin θ cos φ, sin θ sin φ, cos θ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩)')}Гейт = поворот: ${EQ('R<sub>n</sub>(α) = e<sup>−iα n·σ/2</sup> = cos(α/2) I − i sin(α/2) (n·σ)')}`],
    puzzles: [
      `Pauliho matice: ${EQ('X = [[0,1],[1,0]], &nbsp; Y = [[0,−i],[i,0]], &nbsp; Z = [[1,0],[0,−1]], &nbsp; H = (X + Z)/√2')}Dôležité identity: ${EQ('X² = Y² = Z² = H² = I, &nbsp; HXH = Z, &nbsp; HZH = X, &nbsp; XY = iZ')}S = diag(1, i) = √Z, T = diag(1, e<sup>iπ/4</sup>) = √S. Ako rotácie: X = −i·R<sub>x</sub>(π) ∼ R<sub>x</sub>(π).`,
      `Pauli matrices: ${EQ('X = [[0,1],[1,0]], &nbsp; Y = [[0,−i],[i,0]], &nbsp; Z = [[1,0],[0,−1]], &nbsp; H = (X + Z)/√2')}Key identities: ${EQ('X² = Y² = Z² = H² = I, &nbsp; HXH = Z, &nbsp; HZH = X, &nbsp; XY = iZ')}S = diag(1, i) = √Z, T = diag(1, e<sup>iπ/4</sup>) = √S. As rotations: X = −i·R<sub>x</sub>(π) ∼ R<sub>x</sub>(π).`,
      `Матриці Паулі: ${EQ('X = [[0,1],[1,0]], &nbsp; Y = [[0,−i],[i,0]], &nbsp; Z = [[1,0],[0,−1]], &nbsp; H = (X + Z)/√2')}Ключові тотожності: ${EQ('X² = Y² = Z² = H² = I, &nbsp; HXH = Z, &nbsp; HZH = X, &nbsp; XY = iZ')}S = diag(1, i) = √Z, T = diag(1, e<sup>iπ/4</sup>) = √S. Як повороти: X = −i·R<sub>x</sub>(π) ∼ R<sub>x</sub>(π).`],
    measure: [
      `Projektívne meranie v báze Z: ${EQ(`P(0) = |${cA}|² = cos²(θ/2), &nbsp; P(1) = |${cB}|² = sin²(θ/2), &nbsp; ⟨Z⟩ = P(0) − P(1) = cos θ`)}Z N meraní je odhad P zaťažený štatistickou chybou ${EQ('σ ≈ √(P(1 − P)/N) &nbsp; (N = 100, P = ½ ⇒ σ = 5 %)')}φ sa dá zistiť len meraním ⟨X⟩ = sin θ cos φ a ⟨Y⟩ = sin θ sin φ — teda v iných bázach (tomografia).`,
      `Projective measurement in the Z basis: ${EQ(`P(0) = |${cA}|² = cos²(θ/2), &nbsp; P(1) = |${cB}|² = sin²(θ/2), &nbsp; ⟨Z⟩ = P(0) − P(1) = cos θ`)}From N measurements the estimate of P carries a statistical error ${EQ('σ ≈ √(P(1 − P)/N) &nbsp; (N = 100, P = ½ ⇒ σ = 5 %)')}φ can only be found by measuring ⟨X⟩ = sin θ cos φ and ⟨Y⟩ = sin θ sin φ — i.e. in other bases (tomography).`,
      `Проєктивне вимірювання в базисі Z: ${EQ(`P(0) = |${cA}|² = cos²(θ/2), &nbsp; P(1) = |${cB}|² = sin²(θ/2), &nbsp; ⟨Z⟩ = P(0) − P(1) = cos θ`)}З N вимірювань оцінка P має статистичну похибку ${EQ('σ ≈ √(P(1 − P)/N) &nbsp; (N = 100, P = ½ ⇒ σ = 5 %)')}φ можна знайти лише вимірюванням ⟨X⟩ = sin θ cos φ і ⟨Y⟩ = sin θ sin φ — тобто в інших базисах (томографія).`],
    lab: [
      `Meranie pozdĺž osi m: ${EQ('P(+m) = (1 + r·m)/2 = cos²(γ/2), &nbsp; γ = uhol medzi r a m')}Rotácia stavu (Rodriguesov vzorec): ${EQ('r′ = r cos α + (n × r) sin α + n (n·r)(1 − cos α)')}Ľubovoľné hradlo sa dá rozložiť na tri rotácie: U = e<sup>iγ</sup> R<sub>z</sub>(a) R<sub>y</sub>(b) R<sub>z</sub>(c).`,
      `Measurement along an axis m: ${EQ('P(+m) = (1 + r·m)/2 = cos²(γ/2), &nbsp; γ = angle between r and m')}Rotating the state (Rodrigues’ formula): ${EQ('r′ = r cos α + (n × r) sin α + n (n·r)(1 − cos α)')}Any gate decomposes into three rotations: U = e<sup>iγ</sup> R<sub>z</sub>(a) R<sub>y</sub>(b) R<sub>z</sub>(c).`,
      `Вимірювання вздовж осі m: ${EQ('P(+m) = (1 + r·m)/2 = cos²(γ/2), &nbsp; γ = кут між r і m')}Поворот стану (формула Родрігеса): ${EQ('r′ = r cos α + (n × r) sin α + n (n·r)(1 − cos α)')}Будь-який гейт розкладається на три повороти: U = e<sup>iγ</sup> R<sub>z</sub>(a) R<sub>y</sub>(b) R<sub>z</sub>(c).`],
  },
  4: {
    views: { pure: 'rho', withMeasure: 'rho', deco: 'rho' },
    core: [
      `Matica hustoty a Blochov vektor: ${EQ(`ρ = |ψ⟩⟨ψ| = [[|${cA}|², ${cA}${cB}*], [${cA}*${cB}, |${cB}|²]] = ½(I + r·σ)`)}Diagonála = populácie, mimodiagonála ρ₀₁ = (r<sub>x</sub> − i r<sub>y</sub>)/2 = koherencia. Čistota ${EQ('Tr ρ² = (1 + |r|²)/2 &nbsp; (1 = čistý, ½ = maximálne zmiešaný)')}`,
      `The density matrix and the Bloch vector: ${EQ(`ρ = |ψ⟩⟨ψ| = [[|${cA}|², ${cA}${cB}*], [${cA}*${cB}, |${cB}|²]] = ½(I + r·σ)`)}Diagonal = populations, off-diagonal ρ₀₁ = (r<sub>x</sub> − i r<sub>y</sub>)/2 = coherence. Purity ${EQ('Tr ρ² = (1 + |r|²)/2 &nbsp; (1 = pure, ½ = maximally mixed)')}`,
      `Матриця густини та вектор Блоха: ${EQ(`ρ = |ψ⟩⟨ψ| = [[|${cA}|², ${cA}${cB}*], [${cA}*${cB}, |${cB}|²]] = ½(I + r·σ)`)}Діагональ = заселеності, позадіагональ ρ₀₁ = (r<sub>x</sub> − i r<sub>y</sub>)/2 = когерентність. Чистота ${EQ('Tr ρ² = (1 + |r|²)/2 &nbsp; (1 = чистий, ½ = максимально змішаний)')}`],
    pure: [
      `${EQ('|0⟩ →H→ (|0⟩ + |1⟩)/√2 →H→ ½(|0⟩ + |1⟩) + ½(|0⟩ − |1⟩) = |0⟩')}Amplitúdy k |1⟩ (+½ a −½) sa vyrušia — dve „cesty“ s opačnou fázou. Vo ρ po prvom H: všetky štyri prvky ½ → koherencie ρ₀₁ = ½ sú maximálne.`,
      `${EQ('|0⟩ →H→ (|0⟩ + |1⟩)/√2 →H→ ½(|0⟩ + |1⟩) + ½(|0⟩ − |1⟩) = |0⟩')}The amplitudes towards |1⟩ (+½ and −½) cancel — two “paths” with opposite phase. In ρ after the first H: all four elements are ½ → the coherences ρ₀₁ = ½ are maximal.`,
      `${EQ('|0⟩ →H→ (|0⟩ + |1⟩)/√2 →H→ ½(|0⟩ + |1⟩) + ½(|0⟩ − |1⟩) = |0⟩')}Амплітуди до |1⟩ (+½ і −½) гасяться — два «шляхи» з протилежною фазою. У ρ після першого H: усі чотири елементи дорівнюють ½ → когерентності ρ₀₁ = ½ максимальні.`],
    withMeasure: [
      `Neselektívne meranie (výsledok zabudnutý) = projekcia na diagonálu: ${EQ('ρ → Σ<sub>k</sub> P<sub>k</sub> ρ P<sub>k</sub> = [[ρ₀₀, 0], [0, ρ₁₁]]')}Pre ρ = ½[[1,1],[1,1]] vznikne I/2 a HIH† = I ⇒ P(0) = ½. Superpozícia a zmes majú rovnakú diagonálu, líšia sa len mimodiagonálou.`,
      `A non-selective measurement (result forgotten) = projection onto the diagonal: ${EQ('ρ → Σ<sub>k</sub> P<sub>k</sub> ρ P<sub>k</sub> = [[ρ₀₀, 0], [0, ρ₁₁]]')}For ρ = ½[[1,1],[1,1]] this gives I/2, and HIH† = I ⇒ P(0) = ½. A superposition and a mixture share the diagonal; they differ only off the diagonal.`,
      `Неселективне вимірювання (результат забуто) = проєкція на діагональ: ${EQ('ρ → Σ<sub>k</sub> P<sub>k</sub> ρ P<sub>k</sub> = [[ρ₀₀, 0], [0, ρ₁₁]]')}Для ρ = ½[[1,1],[1,1]] це дає I/2, а HIH† = I ⇒ P(0) = ½. Суперпозиція й суміш мають спільну діагональ; різняться лише поза нею.`],
    deco: [
      `Kanál defázovania (phase damping) a fázový posun: ${EQ('ρ₀₁ → (1 − p) e<sup>−iφ</sup> ρ₀₁, &nbsp; ρ₀₀, ρ₁₁ nezmenené')}Po druhom H: ${EQ('P(0) = ½ (1 + (1 − p) cos φ)')}Viditeľnosť interferenčných prúžkov V = (P<sub>max</sub> − P<sub>min</sub>)/(P<sub>max</sub> + P<sub>min</sub>) = 1 − p = 2|ρ₀₁|. V čase: |ρ₀₁(t)| = |ρ₀₁(0)| e<sup>−t/T₂</sup>.`,
      `The dephasing (phase-damping) channel plus a phase shift: ${EQ('ρ₀₁ → (1 − p) e<sup>−iφ</sup> ρ₀₁, &nbsp; ρ₀₀, ρ₁₁ unchanged')}After the second H: ${EQ('P(0) = ½ (1 + (1 − p) cos φ)')}The fringe visibility V = (P<sub>max</sub> − P<sub>min</sub>)/(P<sub>max</sub> + P<sub>min</sub>) = 1 − p = 2|ρ₀₁|. In time: |ρ₀₁(t)| = |ρ₀₁(0)| e<sup>−t/T₂</sup>.`,
      `Канал дефазування (фазового згасання) плюс фазовий зсув: ${EQ('ρ₀₁ → (1 − p) e<sup>−iφ</sup> ρ₀₁, &nbsp; ρ₀₀, ρ₁₁ не змінюються')}Після другого H: ${EQ('P(0) = ½ (1 + (1 − p) cos φ)')}Видимість смуг V = (P<sub>max</sub> − P<sub>min</sub>)/(P<sub>max</sub> + P<sub>min</sub>) = 1 − p = 2|ρ₀₁|. У часі: |ρ₀₁(t)| = |ρ₀₁(0)| e<sup>−t/T₂</sup>.`],
  },
  5: {
    views: { tasks: 'notation' },
    core: [
      `Rozmerová kontrola ako pri maticiach: ket = n×1, bra = 1×n, operátor = n×n. ${EQ('⟨φ| = (|φ⟩)† = (φ₀*, φ₁*), &nbsp; ⟨φ|ψ⟩ = Σ<sub>k</sub> φ<sub>k</sub>* ψ<sub>k</sub> ∈ ℂ')}Vlastnosti: ⟨φ|ψ⟩ = ⟨ψ|φ⟩*, ⟨ψ|ψ⟩ = 1, úplnosť ${EQ('Σ<sub>k</sub> |k⟩⟨k| = I')}`,
      `Dimension check like for matrices: ket = n×1, bra = 1×n, operator = n×n. ${EQ('⟨φ| = (|φ⟩)† = (φ₀*, φ₁*), &nbsp; ⟨φ|ψ⟩ = Σ<sub>k</sub> φ<sub>k</sub>* ψ<sub>k</sub> ∈ ℂ')}Properties: ⟨φ|ψ⟩ = ⟨ψ|φ⟩*, ⟨ψ|ψ⟩ = 1, completeness ${EQ('Σ<sub>k</sub> |k⟩⟨k| = I')}`,
      `Перевірка розмірностей, як для матриць: кет = n×1, бра = 1×n, оператор = n×n. ${EQ('⟨φ| = (|φ⟩)† = (φ₀*, φ₁*), &nbsp; ⟨φ|ψ⟩ = Σ<sub>k</sub> φ<sub>k</sub>* ψ<sub>k</sub> ∈ ℂ')}Властивості: ⟨φ|ψ⟩ = ⟨ψ|φ⟩*, ⟨ψ|ψ⟩ = 1, повнота ${EQ('Σ<sub>k</sub> |k⟩⟨k| = I')}`],
    tasks: [
      `Spektrálny rozklad pozorovateľnej a stredná hodnota: ${EQ('A = Σ<sub>a</sub> a |a⟩⟨a|, &nbsp; ⟨A⟩ = ⟨ψ|A|ψ⟩ = Σ<sub>a</sub> a |⟨a|ψ⟩|² = Tr(ρA)')}Projektor P = |ψ⟩⟨ψ| spĺňa P² = P, P† = P. Tenzorový súčin: ${EQ('(|a⟩ ⊗ |b⟩)<sub>ij</sub> = a<sub>i</sub> b<sub>j</sub>, &nbsp; dim(H<sub>A</sub> ⊗ H<sub>B</sub>) = dim H<sub>A</sub> · dim H<sub>B</sub>')}Vlnová funkcia: ψ(x) = ⟨x|ψ⟩, ∫|ψ(x)|² dx = 1.`,
      `Spectral decomposition of an observable and the expectation value: ${EQ('A = Σ<sub>a</sub> a |a⟩⟨a|, &nbsp; ⟨A⟩ = ⟨ψ|A|ψ⟩ = Σ<sub>a</sub> a |⟨a|ψ⟩|² = Tr(ρA)')}The projector P = |ψ⟩⟨ψ| satisfies P² = P, P† = P. Tensor product: ${EQ('(|a⟩ ⊗ |b⟩)<sub>ij</sub> = a<sub>i</sub> b<sub>j</sub>, &nbsp; dim(H<sub>A</sub> ⊗ H<sub>B</sub>) = dim H<sub>A</sub> · dim H<sub>B</sub>')}Wave function: ψ(x) = ⟨x|ψ⟩, ∫|ψ(x)|² dx = 1.`,
      `Спектральний розклад спостережуваної та середнє значення: ${EQ('A = Σ<sub>a</sub> a |a⟩⟨a|, &nbsp; ⟨A⟩ = ⟨ψ|A|ψ⟩ = Σ<sub>a</sub> a |⟨a|ψ⟩|² = Tr(ρA)')}Проєктор P = |ψ⟩⟨ψ| задовольняє P² = P, P† = P. Тензорний добуток: ${EQ('(|a⟩ ⊗ |b⟩)<sub>ij</sub> = a<sub>i</sub> b<sub>j</sub>, &nbsp; dim(H<sub>A</sub> ⊗ H<sub>B</sub>) = dim H<sub>A</sub> · dim H<sub>B</sub>')}Хвильова функція: ψ(x) = ⟨x|ψ⟩, ∫|ψ(x)|² dx = 1.`],
  },
  6: {
    views: { precession: 'hands', piPulse: 'bloch2d', halfPulse: 'bases', tuning: 'bloch2d', t2: 'rho' },
    core: [
      `Spin v poli B₀ (Zeemanove hladiny, Larmorova frekvencia): ${EQ('H = −γ B₀ S<sub>z</sub> = −(ħω₀/2) Z, &nbsp; ω₀ = γB₀, &nbsp; ΔE = ħω₀')}Pre protón γ/2π ≈ 42,58 MHz/T ⇒ pri 1 T ω₀/2π ≈ 42,6 MHz. Časový vývoj: |ψ(t)⟩ = e<sup>−iHt/ħ</sup>|ψ(0)⟩ = rotácia okolo z s uhlovou rýchlosťou ω₀.`,
      `A spin in the field B₀ (Zeeman levels, Larmor frequency): ${EQ('H = −γ B₀ S<sub>z</sub> = −(ħω₀/2) Z, &nbsp; ω₀ = γB₀, &nbsp; ΔE = ħω₀')}For a proton γ/2π ≈ 42.58 MHz/T ⇒ at 1 T, ω₀/2π ≈ 42.6 MHz. Time evolution: |ψ(t)⟩ = e<sup>−iHt/ħ</sup>|ψ(0)⟩ = a rotation about z at angular speed ω₀.`,
      `Спін у полі B₀ (зееманівські рівні, ларморова частота): ${EQ('H = −γ B₀ S<sub>z</sub> = −(ħω₀/2) Z, &nbsp; ω₀ = γB₀, &nbsp; ΔE = ħω₀')}Для протона γ/2π ≈ 42,58 МГц/Тл ⇒ за 1 Тл ω₀/2π ≈ 42,6 МГц. Часова еволюція: |ψ(t)⟩ = e<sup>−iHt/ħ</sup>|ψ(0)⟩ = поворот навколо z з кутовою швидкістю ω₀.`],
    precession: [
      `${EQ(`${cB}(t) = ${cB}(0) e<sup>iω₀t</sup> &nbsp;⇒&nbsp; |${cB}(t)|² = konšt., &nbsp; φ(t) = φ(0) + ω₀t`)}V pohľade 👁 „ručičky“: ${cB} sa točí oproti ${cA}, ich dĺžky sa nemenia. Rotujúci rámec: |ψ̃⟩ = e<sup>−iω₀tZ/2</sup>|ψ⟩ — v ňom precesia zmizne.`,
      `${EQ(`${cB}(t) = ${cB}(0) e<sup>iω₀t</sup> &nbsp;⇒&nbsp; |${cB}(t)|² = const., &nbsp; φ(t) = φ(0) + ω₀t`)}In the 👁 “hands” view: ${cB} turns relative to ${cA}, their lengths stay the same. The rotating frame: |ψ̃⟩ = e<sup>−iω₀tZ/2</sup>|ψ⟩ — in it the precession disappears.`,
      `${EQ(`${cB}(t) = ${cB}(0) e<sup>iω₀t</sup> &nbsp;⇒&nbsp; |${cB}(t)|² = const., &nbsp; φ(t) = φ(0) + ω₀t`)}У погляді 👁 «стрілки»: ${cB} обертається відносно ${cA}, їхні довжини лишаються. Обертова система: |ψ̃⟩ = e<sup>−iω₀tZ/2</sup>|ψ⟩ — у ній прецесія зникає.`],
    piPulse: [
      `RF pole B₁ cos(ωt) v rotujúcom rámci (aproximácia rotujúcej vlny): ${EQ('H̃ = (ħ/2)(Δ Z + Ω<sub>R</sub> X), &nbsp; Ω<sub>R</sub> = γB₁, &nbsp; Δ = ω₀ − ω')}V rezonancii (Δ = 0): ${EQ('P<sub>1</sub>(t) = sin²(Ω<sub>R</sub>t/2)')}π-impulz: Ω<sub>R</sub>t = π ⇒ |0⟩ → −i|1⟩ ∼ |1⟩.`,
      `An RF field B₁ cos(ωt) in the rotating frame (rotating-wave approximation): ${EQ('H̃ = (ħ/2)(Δ Z + Ω<sub>R</sub> X), &nbsp; Ω<sub>R</sub> = γB₁, &nbsp; Δ = ω₀ − ω')}At resonance (Δ = 0): ${EQ('P<sub>1</sub>(t) = sin²(Ω<sub>R</sub>t/2)')}A π pulse: Ω<sub>R</sub>t = π ⇒ |0⟩ → −i|1⟩ ∼ |1⟩.`,
      `РЧ-поле B₁ cos(ωt) в обертовій системі (наближення обертової хвилі): ${EQ('H̃ = (ħ/2)(Δ Z + Ω<sub>R</sub> X), &nbsp; Ω<sub>R</sub> = γB₁, &nbsp; Δ = ω₀ − ω')}У резонансі (Δ = 0): ${EQ('P<sub>1</sub>(t) = sin²(Ω<sub>R</sub>t/2)')}π-імпульс: Ω<sub>R</sub>t = π ⇒ |0⟩ → −i|1⟩ ∼ |1⟩.`],
    halfPulse: [
      `${EQ('R<sub>x</sub>(π/2)|0⟩ = (|0⟩ − i|1⟩)/√2 = |−i⟩')}Stav na rovníku: P(0) = P(1) = ½, ale |⟨X⟩|² + |⟨Y⟩|² = 1 — maximálna priečna magnetizácia, teda najsilnejší NMR signál. Preto sa NMR experiment začína π/2-impulzom.`,
      `${EQ('R<sub>x</sub>(π/2)|0⟩ = (|0⟩ − i|1⟩)/√2 = |−i⟩')}A state on the equator: P(0) = P(1) = ½, but |⟨X⟩|² + |⟨Y⟩|² = 1 — maximal transverse magnetisation, hence the strongest NMR signal. That is why an NMR experiment starts with a π/2 pulse.`,
      `${EQ('R<sub>x</sub>(π/2)|0⟩ = (|0⟩ − i|1⟩)/√2 = |−i⟩')}Стан на екваторі: P(0) = P(1) = ½, але |⟨X⟩|² + |⟨Y⟩|² = 1 — максимальна поперечна намагніченість, а отже, найсильніший ЯМР-сигнал. Тому ЯМР-експеримент починається π/2-імпульсом.`],
    tuning: [
      `Mimo rezonancie (Rabiho vzorec): ${EQ('P<sub>1</sub>(t) = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + Δ²) · sin²(√(Ω<sub>R</sub>² + Δ²) · t/2)')}Os rotácie je naklonená o uhol tan ϑ = Δ/Ω<sub>R</sub>, takže šípka nikdy nedosiahne južný pól. Šírka rezonancie ≈ Ω<sub>R</sub> — slabší impulz = ostrejšia rezonancia.`,
      `Off resonance (Rabi’s formula): ${EQ('P<sub>1</sub>(t) = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + Δ²) · sin²(√(Ω<sub>R</sub>² + Δ²) · t/2)')}The rotation axis is tilted by tan ϑ = Δ/Ω<sub>R</sub>, so the arrow never reaches the south pole. The resonance width ≈ Ω<sub>R</sub> — a weaker pulse means a sharper resonance.`,
      `Поза резонансом (формула Рабі): ${EQ('P<sub>1</sub>(t) = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + Δ²) · sin²(√(Ω<sub>R</sub>² + Δ²) · t/2)')}Вісь обертання нахилена на tan ϑ = Δ/Ω<sub>R</sub>, тож стрілка ніколи не досягає південного полюса. Ширина резонансу ≈ Ω<sub>R</sub> — слабший імпульс означає гостріший резонанс.`],
    t2: [
      `Blochove rovnice (1946): ${EQ('dM<sub>⊥</sub>/dt = … − M<sub>⊥</sub>/T₂, &nbsp; dM<sub>z</sub>/dt = … − (M<sub>z</sub> − M₀)/T₁')}FID signál: S(t) ∝ M<sub>⊥</sub>(0) cos(ω₀t) e<sup>−t/T₂</sup>. Vždy platí T₂ ≤ 2T₁. Spinové echo (Hahn 1950): π-impulz v čase τ obráti rozbiehanie fáz z nehomogenity poľa.`,
      `The Bloch equations (1946): ${EQ('dM<sub>⊥</sub>/dt = … − M<sub>⊥</sub>/T₂, &nbsp; dM<sub>z</sub>/dt = … − (M<sub>z</sub> − M₀)/T₁')}The FID signal: S(t) ∝ M<sub>⊥</sub>(0) cos(ω₀t) e<sup>−t/T₂</sup>. Always T₂ ≤ 2T₁. Spin echo (Hahn 1950): a π pulse at time τ reverses the dephasing caused by field inhomogeneity.`,
      `Рівняння Блоха (1946): ${EQ('dM<sub>⊥</sub>/dt = … − M<sub>⊥</sub>/T₂, &nbsp; dM<sub>z</sub>/dt = … − (M<sub>z</sub> − M₀)/T₁')}Сигнал FID: S(t) ∝ M<sub>⊥</sub>(0) cos(ω₀t) e<sup>−t/T₂</sup>. Завжди T₂ ≤ 2T₁. Спінове луна (Хан 1950): π-імпульс у момент τ обертає назад дефазування, спричинене неоднорідністю поля.`],
  },
  7: {
    views: { build: 'hands', noSignal: 'bases', chsh: 'bases' },
    core: [
      `Dva qubity žijú v ℂ² ⊗ ℂ² (4 amplitúdy). Produktový stav: (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩); previazaný stav sa tak napísať nedá. Kritérium pre ${EQ('|Ψ⟩ = Σ ψ<sub>ij</sub>|ij⟩: &nbsp; produkt ⇔ ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = 0')}Redukovaný stav: ρ<sub>A</sub> = Tr<sub>B</sub> |Ψ⟩⟨Ψ|.`,
      `Two qubits live in ℂ² ⊗ ℂ² (4 amplitudes). A product state: (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩); an entangled state cannot be written that way. The criterion for ${EQ('|Ψ⟩ = Σ ψ<sub>ij</sub>|ij⟩: &nbsp; product ⇔ ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = 0')}The reduced state: ρ<sub>A</sub> = Tr<sub>B</sub> |Ψ⟩⟨Ψ|.`,
      `Два кубіти живуть у ℂ² ⊗ ℂ² (4 амплітуди). Добутковий стан: (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩); сплутаний стан так записати не можна. Критерій для ${EQ('|Ψ⟩ = Σ ψ<sub>ij</sub>|ij⟩: &nbsp; добуток ⇔ ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = 0')}Редукований стан: ρ<sub>A</sub> = Tr<sub>B</sub> |Ψ⟩⟨Ψ|.`],
    build: [
      `${EQ('|00⟩ →H⊗I→ (|00⟩ + |10⟩)/√2 →CNOT→ (|00⟩ + |11⟩)/√2 = |Φ⁺⟩')}Pre |Φ⁺⟩: ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ½ ≠ 0 ⇒ previazaný. ${EQ('ρ<sub>A</sub> = ρ<sub>B</sub> = I/2, &nbsp; S(ρ<sub>A</sub>) = −Tr ρ<sub>A</sub> log₂ ρ<sub>A</sub> = 1 bit')}Entropia previazanosti 1 bit = maximum pre dva qubity.`,
      `${EQ('|00⟩ →H⊗I→ (|00⟩ + |10⟩)/√2 →CNOT→ (|00⟩ + |11⟩)/√2 = |Φ⁺⟩')}For |Φ⁺⟩: ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ½ ≠ 0 ⇒ entangled. ${EQ('ρ<sub>A</sub> = ρ<sub>B</sub> = I/2, &nbsp; S(ρ<sub>A</sub>) = −Tr ρ<sub>A</sub> log₂ ρ<sub>A</sub> = 1 bit')}An entanglement entropy of 1 bit is the maximum for two qubits.`,
      `${EQ('|00⟩ →H⊗I→ (|00⟩ + |10⟩)/√2 →CNOT→ (|00⟩ + |11⟩)/√2 = |Φ⁺⟩')}Для |Φ⁺⟩: ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ½ ≠ 0 ⇒ сплутаний. ${EQ('ρ<sub>A</sub> = ρ<sub>B</sub> = I/2, &nbsp; S(ρ<sub>A</sub>) = −Tr ρ<sub>A</sub> log₂ ρ<sub>A</sub> = 1 біт')}Ентропія сплутаності 1 біт — максимум для двох кубітів.`],
    noSignal: [
      `Korelácia pre |Φ⁺⟩ a osi a, b v rovine xz: ${EQ('E(a, b) = ⟨σ<sub>a</sub> ⊗ σ<sub>b</sub>⟩ = cos(a − b), &nbsp; P(rovnaké) = cos²((a − b)/2)')}Nemožnosť signalizácie: Bobova štatistika závisí len od ρ<sub>B</sub>, a tá sa Aliciným lokálnym meraním nezmení: ${EQ('Σ<sub>k</sub> Tr<sub>A</sub>[(P<sub>k</sub> ⊗ I) ρ] = ρ<sub>B</sub> = I/2')}`,
      `The correlation for |Φ⁺⟩ with axes a, b in the xz plane: ${EQ('E(a, b) = ⟨σ<sub>a</sub> ⊗ σ<sub>b</sub>⟩ = cos(a − b), &nbsp; P(same) = cos²((a − b)/2)')}No-signalling: Bob’s statistics depend only on ρ<sub>B</sub>, which Alice’s local measurement does not change: ${EQ('Σ<sub>k</sub> Tr<sub>A</sub>[(P<sub>k</sub> ⊗ I) ρ] = ρ<sub>B</sub> = I/2')}`,
      `Кореляція для |Φ⁺⟩ з осями a, b у площині xz: ${EQ('E(a, b) = ⟨σ<sub>a</sub> ⊗ σ<sub>b</sub>⟩ = cos(a − b), &nbsp; P(однакові) = cos²((a − b)/2)')}Неможливість сигналізації: статистика Боба залежить лише від ρ<sub>B</sub>, яку локальне вимірювання Аліси не змінює: ${EQ('Σ<sub>k</sub> Tr<sub>A</sub>[(P<sub>k</sub> ⊗ I) ρ] = ρ<sub>B</sub> = I/2')}`],
    chsh: [
      `CHSH výraz: ${EQ('S = E(a₀,b₀) + E(a₀,b₁) + E(a₁,b₀) − E(a₁,b₁)')}Lokálne skryté premenné: |S| ≤ 2. Kvantovo (Cirelsonova hranica 1980): |S| ≤ 2√2 ≈ 2,83. Výhra v hre: ${EQ('P<sub>win</sub> = ½ + S/8 &nbsp;⇒&nbsp; klasicky ≤ 75 %, kvantovo ≤ ½ + √2/4 = cos²(π/8) ≈ 85,4 %')}Optimum: a₀ = 0, a₁ = π/2, b₀ = π/4, b₁ = −π/4.`,
      `The CHSH expression: ${EQ('S = E(a₀,b₀) + E(a₀,b₁) + E(a₁,b₀) − E(a₁,b₁)')}Local hidden variables: |S| ≤ 2. Quantum (Tsirelson’s bound, 1980): |S| ≤ 2√2 ≈ 2.83. Winning the game: ${EQ('P<sub>win</sub> = ½ + S/8 &nbsp;⇒&nbsp; classical ≤ 75 %, quantum ≤ ½ + √2/4 = cos²(π/8) ≈ 85.4 %')}Optimum: a₀ = 0, a₁ = π/2, b₀ = π/4, b₁ = −π/4.`,
      `Вираз CHSH: ${EQ('S = E(a₀,b₀) + E(a₀,b₁) + E(a₁,b₀) − E(a₁,b₁)')}Локальні приховані змінні: |S| ≤ 2. Квантово (межа Цирельсона, 1980): |S| ≤ 2√2 ≈ 2,83. Виграш у грі: ${EQ('P<sub>виграш</sub> = ½ + S/8 &nbsp;⇒&nbsp; класично ≤ 75 %, квантово ≤ ½ + √2/4 = cos²(π/8) ≈ 85,4 %')}Оптимум: a₀ = 0, a₁ = π/2, b₀ = π/4, b₁ = −π/4.`],
  },
  8: {
    views: {},
    core: [
      `Postuláty v skratke: (1) stav = jednotkový vektor |ψ⟩ (alebo ρ), (2) vývoj: ${EQ('iħ ∂|ψ⟩/∂t = H|ψ⟩')}(3) meranie pozorovateľnej A = Σ a P<sub>a</sub>: P(a) = ⟨ψ|P<sub>a</sub>|ψ⟩, stav po meraní P<sub>a</sub>|ψ⟩/√P(a) („kolaps“), (4) zložené systémy: tenzorový súčin.`,
      `The postulates in short: (1) state = a unit vector |ψ⟩ (or ρ), (2) evolution: ${EQ('iħ ∂|ψ⟩/∂t = H|ψ⟩')}(3) measuring an observable A = Σ a P<sub>a</sub>: P(a) = ⟨ψ|P<sub>a</sub>|ψ⟩, the state afterwards P<sub>a</sub>|ψ⟩/√P(a) (“collapse”), (4) composite systems: the tensor product.`,
      `Постулати коротко: (1) стан = одиничний вектор |ψ⟩ (або ρ), (2) еволюція: ${EQ('iħ ∂|ψ⟩/∂t = H|ψ⟩')}(3) вимірювання спостережуваної A = Σ a P<sub>a</sub>: P(a) = ⟨ψ|P<sub>a</sub>|ψ⟩, стан після нього P<sub>a</sub>|ψ⟩/√P(a) («колапс»), (4) складені системи: тензорний добуток.`],
    statues: [
      `Robertsonova relácia neurčitosti: ${EQ('σ<sub>A</sub> σ<sub>B</sub> ≥ ½ |⟨[A, B]⟩|, &nbsp; [x, p] = iħ ⇒ σ<sub>x</sub> σ<sub>p</sub> ≥ ħ/2')}Noetherovej veta: ak [H, G] = 0, potom d⟨G⟩/dt = 0 (symetria generovaná G ⇒ G sa zachováva). Bohmova vodiaca rovnica: dx/dt = (ħ/m) Im(∇ψ/ψ).`,
      `Robertson’s uncertainty relation: ${EQ('σ<sub>A</sub> σ<sub>B</sub> ≥ ½ |⟨[A, B]⟩|, &nbsp; [x, p] = iħ ⇒ σ<sub>x</sub> σ<sub>p</sub> ≥ ħ/2')}Noether’s theorem: if [H, G] = 0 then d⟨G⟩/dt = 0 (a symmetry generated by G ⇒ G is conserved). Bohm’s guidance equation: dx/dt = (ħ/m) Im(∇ψ/ψ).`,
      `Співвідношення невизначеностей Робертсона: ${EQ('σ<sub>A</sub> σ<sub>B</sub> ≥ ½ |⟨[A, B]⟩|, &nbsp; [x, p] = iħ ⇒ σ<sub>x</sub> σ<sub>p</sub> ≥ ħ/2')}Теорема Нетер: якщо [H, G] = 0, то d⟨G⟩/dt = 0 (симетрія, породжена G ⇒ G зберігається). Рівняння ведення Бома: dx/dt = (ħ/m) Im(∇ψ/ψ).`],
    sorting: [
      `Unitárny vývoj je vratný a lineárny; „kolaps“ nie je unitárny. Dekoherencia vysvetľuje, prečo interferencie makro-alternatív nevidno (ρ sa diagonalizuje v „ukazovateľovej“ báze), ale nevyberá jeden výsledok — tu sa interpretácie (Kodaň, Everett, Bohm, QBism…) rozchádzajú, predpovede majú rovnaké.`,
      `Unitary evolution is reversible and linear; “collapse” is not unitary. Decoherence explains why interference between macro-alternatives is not seen (ρ becomes diagonal in the “pointer” basis), but it does not pick a single outcome — that is where interpretations (Copenhagen, Everett, Bohm, QBism…) part ways, while their predictions agree.`,
      `Унітарна еволюція оборотна й лінійна; «колапс» неунітарний. Декогеренція пояснює, чому не видно інтерференції між макроальтернативами (ρ стає діагональною в «стрілочному» базисі), але не вибирає одного результату — саме тут розходяться тлумачення (копенгагенське, Еверетта, Бома, QBism…), хоча їхні передбачення збігаються.`],
  },
};

// extra otázky (ťažká, prastará) — viac poznatkov a rovníc
const TRAPS_HARD = {
  1: [
    [{ q: 'Dve cesty s amplitúdami ½ a ½·e<sup>iπ/3</sup>. Aké je P = |A₁ + A₂|²?', options: ['¾', '½', '1', '¼'], correct: 0, why: 'P = cos²(Δφ/2) = cos²(π/6) = ¾. Interferenčný člen 2 Re(A₁A₂*) = ½ cos(π/3) = ¼.' },
      { q: 'Two paths with amplitudes ½ and ½·e<sup>iπ/3</sup>. What is P = |A₁ + A₂|²?', options: ['¾', '½', '1', '¼'], correct: 0, why: 'P = cos²(Δφ/2) = cos²(π/6) = ¾. The interference term 2 Re(A₁A₂*) = ½ cos(π/3) = ¼.' },
      { q: 'Два шляхи з амплітудами ½ і ½·e<sup>iπ/3</sup>. Чому дорівнює P = |A₁ + A₂|²?', options: ['¾', '½', '1', '¼'], correct: 0, why: 'P = cos²(Δφ/2) = cos²(π/6) = ¾. Інтерференційний доданок 2 Re(A₁A₂*) = ½ cos(π/3) = ¼.' }],
    [{ q: 'Čomu sa rovná i<sup>i</sup> (hlavná hodnota)?', options: ['e<sup>−π/2</sup> ≈ 0,208 — reálne číslo', 'i', '−1', 'nedá sa definovať'], correct: 0, why: 'i = e<sup>iπ/2</sup> ⇒ i<sup>i</sup> = e<sup>i·iπ/2</sup> = e<sup>−π/2</sup>. Euler to zistil v roku 1746.' },
      { q: 'What is i<sup>i</sup> (principal value)?', options: ['e<sup>−π/2</sup> ≈ 0.208 — a real number', 'i', '−1', 'undefined'], correct: 0, why: 'i = e<sup>iπ/2</sup> ⇒ i<sup>i</sup> = e<sup>i·iπ/2</sup> = e<sup>−π/2</sup>. Euler found this in 1746.' },
      { q: 'Чому дорівнює i<sup>i</sup> (головне значення)?', options: ['e<sup>−π/2</sup> ≈ 0,208 — дійсне число', 'i', '−1', 'невизначено'], correct: 0, why: 'i = e<sup>iπ/2</sup> ⇒ i<sup>i</sup> = e<sup>i·iπ/2</sup> = e<sup>−π/2</sup>. Ейлер знайшов це 1746 року.' }],
  ],
  2: [
    [{ q: 'Stav |+z⟩ meriame pozdĺž osi x. Aký je ⟨S<sub>x</sub>⟩ a smerodajná odchýlka σ(S<sub>x</sub>)?', options: ['⟨S<sub>x</sub>⟩ = 0, σ = ħ/2', '⟨S<sub>x</sub>⟩ = ħ/2, σ = 0', '⟨S<sub>x</sub>⟩ = 0, σ = 0'], correct: 0, why: 'Výsledky ±ħ/2 po 50 % ⇒ priemer 0, odchýlka ħ/2. V osi z by bolo σ(S<sub>z</sub>) = 0.' },
      { q: 'The state |+z⟩ is measured along x. What are ⟨S<sub>x</sub>⟩ and the standard deviation σ(S<sub>x</sub>)?', options: ['⟨S<sub>x</sub>⟩ = 0, σ = ħ/2', '⟨S<sub>x</sub>⟩ = ħ/2, σ = 0', '⟨S<sub>x</sub>⟩ = 0, σ = 0'], correct: 0, why: 'Outcomes ±ħ/2 at 50 % each ⇒ mean 0, deviation ħ/2. Along z it would be σ(S<sub>z</sub>) = 0.' },
      { q: 'Стан |+z⟩ вимірюємо вздовж x. Чому дорівнюють ⟨S<sub>x</sub>⟩ і стандартне відхилення σ(S<sub>x</sub>)?', options: ['⟨S<sub>x</sub>⟩ = 0, σ = ħ/2', '⟨S<sub>x</sub>⟩ = ħ/2, σ = 0', '⟨S<sub>x</sub>⟩ = 0, σ = 0'], correct: 0, why: 'Результати ±ħ/2 по 50 % ⇒ середнє 0, відхилення ħ/2. Уздовж z було б σ(S<sub>z</sub>) = 0.' }],
    [{ q: 'Prečo pri spine ½ vystupuje polovičný uhol: P = cos²(ϑ/2)?', options: ['ortogonálne stavy (|+z⟩, |−z⟩) sú na Blochovej sfére protiľahlé, teda 180° = „90° v Hilbertovom priestore“', 'kvôli chybe magnetu', 'lebo spin sa otáča polovičnou rýchlosťou'], correct: 0, why: 'Uhol v Hilbertovom priestore je polovicou uhla na sfére: |⟨+n|+z⟩| = cos(ϑ/2).' },
      { q: 'Why does spin ½ involve the half angle: P = cos²(ϑ/2)?', options: ['orthogonal states (|+z⟩, |−z⟩) are antipodal on the Bloch sphere, so 180° = “90° in Hilbert space”', 'because of a magnet defect', 'because the spin rotates at half speed'], correct: 0, why: 'The angle in Hilbert space is half the angle on the sphere: |⟨+n|+z⟩| = cos(ϑ/2).' },
      { q: 'Чому в спіні ½ фігурує половинний кут: P = cos²(ϑ/2)?', options: ['ортогональні стани (|+z⟩, |−z⟩) на сфері Блоха протилежні, тож 180° = «90° у гільбертовому просторі»', 'через ваду магніту', 'бо спін обертається з половинною швидкістю'], correct: 0, why: 'Кут у гільбертовому просторі — половина кута на сфері: |⟨+n|+z⟩| = cos(ϑ/2).' }],
  ],
  3: [
    [{ q: 'Čomu sa rovná HZH?', options: ['X', 'Z', 'Y', 'I'], correct: 0, why: 'H vymení osi x ↔ z, takže rotácia okolo z sa zmení na rotáciu okolo x. Preto H·Z·H = X (hádanka 5).' },
      { q: 'What is HZH?', options: ['X', 'Z', 'Y', 'I'], correct: 0, why: 'H swaps the axes x ↔ z, so a rotation about z becomes a rotation about x. Hence H·Z·H = X (puzzle 5).' },
      { q: 'Чому дорівнює HZH?', options: ['X', 'Z', 'Y', 'I'], correct: 0, why: 'H міняє осі x ↔ z, тож поворот навколо z стає поворотом навколо x. Звідси H·Z·H = X (головоломка 5).' }],
    [{ q: 'Stav s θ = π/3, φ = 0. Aké je P(0) v Z-báze?', options: ['cos²(π/6) = ¾', 'cos²(π/3) = ¼', '½', 'sin²(π/6) = ¼'], correct: 0, why: 'P(0) = cos²(θ/2) = (1 + cos θ)/2 = (1 + ½)/2 = ¾.' },
      { q: 'A state with θ = π/3, φ = 0. What is P(0) in the Z basis?', options: ['cos²(π/6) = ¾', 'cos²(π/3) = ¼', '½', 'sin²(π/6) = ¼'], correct: 0, why: 'P(0) = cos²(θ/2) = (1 + cos θ)/2 = (1 + ½)/2 = ¾.' },
      { q: 'Стан із θ = π/3, φ = 0. Чому дорівнює P(0) у базисі Z?', options: ['cos²(π/6) = ¾', 'cos²(π/3) = ¼', '½', 'sin²(π/6) = ¼'], correct: 0, why: 'P(0) = cos²(θ/2) = (1 + cos θ)/2 = (1 + ½)/2 = ¾.' }],
  ],
  4: [
    [{ q: 'Aká je čistota Tr ρ² maximálne zmiešaného stavu qubitu I/2?', options: ['½', '1', '0', '¼'], correct: 0, why: 'Tr (I/2)² = Tr I/4 = ½. Všeobecne Tr ρ² = (1 + |r|²)/2 a pre stred sféry r = 0.' },
      { q: 'What is the purity Tr ρ² of the maximally mixed qubit state I/2?', options: ['½', '1', '0', '¼'], correct: 0, why: 'Tr (I/2)² = Tr I/4 = ½. In general Tr ρ² = (1 + |r|²)/2, and r = 0 at the centre.' },
      { q: 'Яка чистота Tr ρ² максимально змішаного стану кубіта I/2?', options: ['½', '1', '0', '¼'], correct: 0, why: 'Tr (I/2)² = Tr I/4 = ½. Загалом Tr ρ² = (1 + |r|²)/2, а в центрі r = 0.' }],
    [{ q: 'Defázovanie p = 0,4 a fázový posun φ = 0. Aké je P(0) na konci H → (prostredie) → H?', options: ['0,8', '0,6', '0,7', '1'], correct: 0, why: 'P(0) = ½(1 + (1 − p) cos φ) = ½(1 + 0,6) = 0,8.' },
      { q: 'Dephasing p = 0.4 and phase shift φ = 0. What is P(0) at the end of H → (environment) → H?', options: ['0.8', '0.6', '0.7', '1'], correct: 0, why: 'P(0) = ½(1 + (1 − p) cos φ) = ½(1 + 0.6) = 0.8.' },
      { q: 'Дефазування p = 0,4 і фазовий зсув φ = 0. Яке P(0) наприкінці H → (довкілля) → H?', options: ['0,8', '0,6', '0,7', '1'], correct: 0, why: 'P(0) = ½(1 + (1 − p) cos φ) = ½(1 + 0,6) = 0,8.' }],
  ],
  5: [
    [{ q: 'Aká je stredná hodnota ⟨+|Z|+⟩?', options: ['0', '1', '−1', '½'], correct: 0, why: '⟨Z⟩ = P(0)·(+1) + P(1)·(−1) = ½ − ½ = 0 — hoci jednotlivé merania dávajú len ±1.' },
      { q: 'What is the expectation value ⟨+|Z|+⟩?', options: ['0', '1', '−1', '½'], correct: 0, why: '⟨Z⟩ = P(0)·(+1) + P(1)·(−1) = ½ − ½ = 0 — although single measurements give only ±1.' },
      { q: 'Яке середнє значення ⟨+|Z|+⟩?', options: ['0', '1', '−1', '½'], correct: 0, why: '⟨Z⟩ = P(0)·(+1) + P(1)·(−1) = ½ − ½ = 0 — хоча окремі вимірювання дають лише ±1.' }],
    [{ q: 'Koľko komplexných amplitúd má zložený stav troch qubitov?', options: ['2³ = 8', '3 × 2 = 6', '3', '2'], correct: 0, why: 'Dimenzie sa pri ⊗ násobia: 2 · 2 · 2 = 8 (exponenciálny rast — preto je klasická simulácia ťažká).' },
      { q: 'How many complex amplitudes does a composite state of three qubits have?', options: ['2³ = 8', '3 × 2 = 6', '3', '2'], correct: 0, why: 'Dimensions multiply under ⊗: 2 · 2 · 2 = 8 (exponential growth — that is why classical simulation is hard).' },
      { q: 'Скільки комплексних амплітуд має складений стан трьох кубітів?', options: ['2³ = 8', '3 × 2 = 6', '3', '2'], correct: 0, why: 'Під ⊗ розмірності перемножуються: 2 · 2 · 2 = 8 (експоненційне зростання — тому класичне моделювання складне).' }],
  ],
  6: [
    [{ q: 'Rabiho frekvencia Ω<sub>R</sub>, rozladenie Δ = Ω<sub>R</sub>. Aké je maximum P(|1⟩)?', options: ['½', '1', '¼', '0'], correct: 0, why: 'P<sub>max</sub> = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + Δ²) = 1/2.' },
      { q: 'Rabi frequency Ω<sub>R</sub>, detuning Δ = Ω<sub>R</sub>. What is the maximum of P(|1⟩)?', options: ['½', '1', '¼', '0'], correct: 0, why: 'P<sub>max</sub> = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + Δ²) = 1/2.' },
      { q: 'Частота Рабі Ω<sub>R</sub>, розстроювання Δ = Ω<sub>R</sub>. Який максимум P(|1⟩)?', options: ['½', '1', '¼', '0'], correct: 0, why: 'P<sub>max</sub> = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + Δ²) = 1/2.' }],
    [{ q: 'Ako dlho trvá, kým priečna magnetizácia klesne na 1/e?', options: ['T₂', 'T₁', '2π/ω₀', 'π/Ω<sub>R</sub>'], correct: 0, why: 'M<sub>⊥</sub>(t) = M<sub>⊥</sub>(0) e<sup>−t/T₂</sup>. T₁ riadi návrat M<sub>z</sub>; vždy T₂ ≤ 2T₁.' },
      { q: 'How long does it take for the transverse magnetisation to fall to 1/e?', options: ['T₂', 'T₁', '2π/ω₀', 'π/Ω<sub>R</sub>'], correct: 0, why: 'M<sub>⊥</sub>(t) = M<sub>⊥</sub>(0) e<sup>−t/T₂</sup>. T₁ governs the return of M<sub>z</sub>; always T₂ ≤ 2T₁.' },
      { q: 'Скільки часу минає, доки поперечна намагніченість спаде до 1/e?', options: ['T₂', 'T₁', '2π/ω₀', 'π/Ω<sub>R</sub>'], correct: 0, why: 'M<sub>⊥</sub>(t) = M<sub>⊥</sub>(0) e<sup>−t/T₂</sup>. T₁ керує поверненням M<sub>z</sub>; завжди T₂ ≤ 2T₁.' }],
  ],
  7: [
    [{ q: 'Aká je kvantová (Cirelsonova) hranica CHSH výrazu S?', options: ['2√2 ≈ 2,83', '2', '4', '√2'], correct: 0, why: 'Lokálne |S| ≤ 2, kvantovo |S| ≤ 2√2, algebraicky by šlo až 4 (PR-boxy) — príroda sa zastaví na 2√2.' },
      { q: 'What is the quantum (Tsirelson) bound of the CHSH expression S?', options: ['2√2 ≈ 2.83', '2', '4', '√2'], correct: 0, why: 'Locally |S| ≤ 2, quantum |S| ≤ 2√2, algebraically up to 4 (PR boxes) — nature stops at 2√2.' },
      { q: 'Яка квантова (Цирельсонова) межа виразу CHSH S?', options: ['2√2 ≈ 2,83', '2', '4', '√2'], correct: 0, why: 'Локально |S| ≤ 2, квантово |S| ≤ 2√2, алгебраїчно аж до 4 (PR-скриньки) — природа зупиняється на 2√2.' }],
    [{ q: 'Je stav ½(|00⟩ + |01⟩ + |10⟩ + |11⟩) previazaný?', options: ['nie — je to |+⟩ ⊗ |+⟩', 'áno, lebo má štyri členy', 'áno, maximálne'], correct: 0, why: 'ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ¼ − ¼ = 0 ⇒ produkt. Počet členov o previazanosti nerozhoduje.' },
      { q: 'Is the state ½(|00⟩ + |01⟩ + |10⟩ + |11⟩) entangled?', options: ['no — it is |+⟩ ⊗ |+⟩', 'yes, because it has four terms', 'yes, maximally'], correct: 0, why: 'ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ¼ − ¼ = 0 ⇒ a product. The number of terms does not decide entanglement.' },
      { q: 'Чи сплутаний стан ½(|00⟩ + |01⟩ + |10⟩ + |11⟩)?', options: ['ні — це |+⟩ ⊗ |+⟩', 'так, бо має чотири доданки', 'так, максимально'], correct: 0, why: 'ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ¼ − ¼ = 0 ⇒ добуток. Кількість доданків про сплутаність не вирішує.' }],
  ],
  8: [
    [{ q: 'Čo vyplýva z [x, p] = iħ?', options: ['σ<sub>x</sub> σ<sub>p</sub> ≥ ħ/2 pre každý stav', 'každé meranie polohy pokazí hybnosť o presne ħ', 'x a p sa nedajú merať vôbec'], correct: 0, why: 'Robertson: σ<sub>A</sub>σ<sub>B</sub> ≥ ½|⟨[A,B]⟩| = ħ/2. Je to vlastnosť stavu (rozptyl výsledkov), nie poruchy prístroja.' },
      { q: 'What follows from [x, p] = iħ?', options: ['σ<sub>x</sub> σ<sub>p</sub> ≥ ħ/2 for every state', 'every position measurement disturbs momentum by exactly ħ', 'x and p cannot be measured at all'], correct: 0, why: 'Robertson: σ<sub>A</sub>σ<sub>B</sub> ≥ ½|⟨[A,B]⟩| = ħ/2. It is a property of the state (the spread of outcomes), not of instrument disturbance.' },
      { q: 'Що випливає з [x, p] = iħ?', options: ['σ<sub>x</sub> σ<sub>p</sub> ≥ ħ/2 для кожного стану', 'кожне вимірювання положення збурює імпульс рівно на ħ', 'x і p взагалі не можна виміряти'], correct: 0, why: 'Робертсон: σ<sub>A</sub>σ<sub>B</sub> ≥ ½|⟨[A,B]⟩| = ħ/2. Це властивість стану (розкид результатів), а не збурення приладом.' }],
    [{ q: 'Čo dekoherencia NEvysvetľuje?', options: ['prečo dostaneme práve tento jeden výsledok', 'prečo makroskopické superpozície neinterferujú', 'prečo mizne mimodiagonála ρ'], correct: 0, why: 'Dekoherencia diagonalizuje ρ, ale výber jedného výsledku (problém merania) nerieši — tu sa interpretácie rozchádzajú.' },
      { q: 'What does decoherence NOT explain?', options: ['why we get this particular single outcome', 'why macroscopic superpositions do not interfere', 'why the off-diagonal of ρ vanishes'], correct: 0, why: 'Decoherence diagonalises ρ but does not pick a single outcome (the measurement problem) — that is where interpretations diverge.' },
      { q: 'Чого декогеренція НЕ пояснює?', options: ['чому ми отримуємо саме цей один результат', 'чому макроскопічні суперпозиції не інтерферують', 'чому зникає позадіагональ ρ'], correct: 0, why: 'Декогеренція діагоналізує ρ, але не вибирає одного результату (проблема вимірювання) — саме тут розходяться тлумачення.' }],
  ],
};

function theoryFor(num, step) {
  const T = THEORY[num];
  if (!T || (Settings.easy && !Settings.eq)) return null; // rovnice najprv: teória vždy, aj v ľahkej
  const parts = [{ h: tr('Jadro levelu', 'Core of the level', 'Ядро рівня'), html: pick(T.core) }];
  if ((Settings.hard || Settings.eq) && T[step]) parts.push({ h: tr('K tejto úlohe', 'For this task', 'До цього завдання'), html: pick(T[step]), view: T.views?.[step] });
  return parts;
}
function hardTraps(num) { return Settings.hard ? (TRAPS_HARD[num] || []).map(pick) : []; }
