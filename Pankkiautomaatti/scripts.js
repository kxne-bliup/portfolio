// ============================================================
//  PANKKIAUTOMAATTI — Koko logiikka (TÄYDELLINEN VERSIO)
// ============================================================

// --- ASETUKSET ---
const TEKSTIN_KOKO = "11px";  // <--- MUOKKAA TÄSTÄ!

// --- TILA ---
const TILA = {
    oikeaPin: null,
    korttiSisalla: false,
    saldo: 150.20,
    pinYritykset: 0,
    MAX_PIN_YRITYKSET: 3,
    LUKITUS_KESTO_MS: 10000,
    VIESTI_KESTO_MS: 2500,

    // 🧾 Tapahtumaloki kuittia varten
    tapahtumat: [], 
    UItila: "ALKU", // Seurataan missä näkymässä ollaan (alku, PIN, valikko, jne.)
    edellinenHTML: "" // Tallennetaan näkymä ennen infon avaamista paluuta varten
};

// PIN hashataan heti käynnistyksessä eikä säilytetä selkotekstinä
(async () => {
    TILA.oikeaPin = await hashPin("1234");
})();

// --- DOM-VIITTEET ---
const DOM = {
    modalBody:     () => document.getElementById("modal-body"),
    modal:         () => document.getElementById("welcome-modal"),
    movingCard:    () => document.getElementById("moving-card"),
    pinInput:      () => document.getElementById("pin-input"),
    muuSumma:      () => document.getElementById("muu-summa-input"),
    talletusSumma: () => document.getElementById("talletus-summa-input"),
};

// ============================================================
//  APUFUNKTIOT
// ============================================================

/** Hashataan PIN SHA-256:lla */
async function hashPin(pin) {
    const data    = new TextEncoder().encode(pin);
    const buffer  = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/** Kirjaa tapahtuman talteen kuittia varten */
function lisaaTapahtumaLokiin(tyyppi, maara) {
    const pvm = new Date().toLocaleTimeString("fi-FI", { hour: '2-digit', minute: '2-digit' });
    TILA.tapahtumat.push(`${pvm}  ${tyyppi.padEnd(10, " ")}  ${formatoiRaha(maara)}`);
}

/** Asetetaan modal-body sisältö turvallisesti ja päivitetään tekstien koot */
function asetaSisalto(html) {
    const body = DOM.modalBody();
    if (body) {
        body.innerHTML = html;
        paivitaTekstienKoot();
    }
}

function paivitaTekstienKoot() {
    const luokat = ['.ohje-pieni', '.merkki-cancel', '.merkki-enter'];
    luokat.forEach(luokka => {
        document.querySelectorAll(luokka).forEach(elementti => {
            elementti.style.fontSize = TEKSTIN_KOKO;
        });
    });
}

const odota = ms => new Promise(res => setTimeout(res, ms));
const formatoiRaha = summa => `${summa.toFixed(2)} €`;

// ============================================================
//  NÄKYMÄT
// ============================================================

function naytaKirjautuminen() {
    if (TILA.pinYritykset >= TILA.MAX_PIN_YRITYKSET) {
        naytaLukitusRuutu();
        return;
    }

    TILA.UItila = "PIN";
    const jaljella = TILA.MAX_PIN_YRITYKSET - TILA.pinYritykset;
    const varoitus = TILA.pinYritykset > 0
        ? `<p class="varoitus-teksti">⚠️ Yrityksiä jäljellä: ${jaljella}/${TILA.MAX_PIN_YRITYKSET}</p>`
        : `<p class="ohje-teksti">Syötä 4-numeroinen PIN-koodi</p>`;

    asetaSisalto(`
        <h2>SYÖTÄ PIN</h2>
        ${varoitus}
        <input type="password" id="pin-input" maxlength="4" readonly autocomplete="off" inputmode="none" aria-label="PIN-koodi">
        <p class="ohje-pieni">Paina <span class="merkki-enter">ENTER</span> hyväksyäksesi</p>
    `);
}

function naytaValikko() {
    TILA.UItila = "VALIKKO";
    asetaSisalto(`
        <div class="menu-container">
            <div class="menu-item">SALDO —</div>
            <div class="menu-item">TALLETA —</div>
            <div class="menu-item">NOSTA —</div>
        </div>
    `);
}

function naytaSaldo() {
    TILA.UItila = "SALDO";
    asetaSisalto(`
        <h2>TILIN SALDO</h2>
        <h1>${formatoiRaha(TILA.saldo)}</h1>
        ${takaisinOhje()}
    `);
}

function naytaNosto() {
    TILA.UItila = "NOSTOVALIKKO";
    asetaSisalto(`
        <div class="menu-container" style="margin-top:-10px;">
            <div class="menu-item">20 € —</div>
            <div class="menu-item">40 € —</div>
            <div class="menu-item">MUU SUMMA —</div>
        </div>
        ${takaisinOhje()}
    `);
}

function naytaMuuSumma() {
    TILA.UItila = "MUUSUMMA";
    asetaSisalto(`
        <h2>SYÖTÄ SUMMA</h2>
        <p class="ohje-teksti">Vain 10 € tai 20 € jaolliset summat</p>
        ${summaKentta("muu-summa-input")}
        <p class="ohje-pieni">Paina <span class="merkki-enter">ENTER</span> hyväksyäksesi</p>
        ${takaisinOhje()}
    `);
}

function naytaTalletus() {
    TILA.UItila = "TALLETUS";
    asetaSisalto(`
        <h2>TALLETUS</h2>
        <p class="ohje-teksti">Syötä talletettava summa</p>
        ${summaKentta("talletus-summa-input")}
        <p class="ohje-pieni">Paina <span class="merkki-enter">ENTER</span> hyväksyäksesi</p>
        ${takaisinOhje()}
    `);
}

function naytaOnnistuminen(otsikko, viesti) {
    asetaSisalto(`
        <div class="palaute-ruutu palaute-ok">
            <h2>✅ ${otsikko}</h2>
            <p>${viesti}</p>
        </div>
    `);
}

function naytaVirhe(otsikko, viesti) {
    asetaSisalto(`
        <div class="palaute-ruutu palaute-virhe">
            <h2>❌ ${otsikko}</h2>
            <p>${viesti}</p>
        </div>
    `);
}

async function naytaLukitusRuutu() {
    TILA.UItila = "LUKITUS";
    asetaSisalto(`
        <div class="palaute-ruutu palaute-virhe">
            <h2>🔒 KORTTI LUKITTU</h2>
            <p>Syötit PIN-koodin ${TILA.MAX_PIN_YRITYKSET} kertaa väärin.</p>
            <p class="ohje-teksti">Automaatti palauttaa kortin ${TILA.LUKITUS_KESTO_MS / 1000} sekunnin kuluttua.</p>
        </div>
    `);
    await odota(TILA.LUKITUS_KESTO_MS);
    resetoiTila();
}

function summaKentta(id) {
    return `
        <div style="display:flex;align-items:center;justify-content:center;margin:10px 0 15px;">
            <input type="text" id="${id}" readonly maxlength="5" autocomplete="off" inputmode="none" aria-label="Summa euroina"
                   style="width:130px;height:40px;font-size:24px;text-align:center;border:3px solid #000;border-radius:5px;font-family:monospace;font-weight:bold;">
            <span style="font-size:24px;font-weight:bold;margin-left:8px;">€</span>
        </div>
    `;
}

function takaisinOhje() {
    return `
        <p class="ohje-pieni" style="margin-top:15px;">
            Paina <span class="merkki-cancel">CANCEL</span> palataksesi päävalikkoon
        </p>
    `;
}

// ============================================================
//  TOIMINNOT
// ============================================================

async function tarkistaPin() {
    const input = DOM.pinInput();
    if (!input || input.value.length !== 4) {
        naytaVirhe("LIIAN LYHYT PIN", "Syötä täysi 4-numeroinen PIN.");
        await odota(TILA.VIESTI_KESTO_MS);
        naytaKirjautuminen();
        return;
    }

    const syotettyHash = await hashPin(input.value);

    if (syotettyHash === TILA.oikeaPin) {
        TILA.pinYritykset = 0;
        naytaOnnistuminen("KIRJAUTUMINEN ONNISTUI", "Tervetuloa!");
        await odota(1200);
        naytaValikko();
    } else {
        TILA.pinYritykset++;
        if (TILA.pinYritykset >= TILA.MAX_PIN_YRITYKSET) {
            naytaLukitusRuutu();
        } else {
            naytaVirhe("VÄÄRÄ PIN", `Yrityksiä jäljellä: ${TILA.MAX_PIN_YRITYKSET - TILA.pinYritykset}`);
            await odota(TILA.VIESTI_KESTO_MS);
            naytaKirjautuminen();
        }
    }
}

async function tarkistaNosto(maara) {
    if (isNaN(maara) || maara <= 0 || maara % 10 !== 0) {
        naytaVirhe("VIRHEELLINEN SUMMA", "Vain 10 € tai 20 € jaolliset summat.");
        await odota(TILA.VIESTI_KESTO_MS);
        naytaMuuSumma();
        return;
    }
    await suoritaNosto(maara);
}

async function tarkistaTalletus() {
    const input = DOM.talletusSumma();
    if (!input || input.value === "") return;

    const maara = parseInt(input.value, 10);

    if (isNaN(maara) || maara <= 0) {
        naytaVirhe("VIRHEELLINEN SUMMA", "Syötä kelvollinen positiivinen summa.");
        await odota(TILA.VIESTI_KESTO_MS);
        naytaTalletus();
        return;
    }

    TILA.saldo += maara;
    lisaaTapahtumaLokiin("TALLETUS", maara);

    naytaOnnistuminen("TALLETUS ONNISTUI", `Tilillesi lisätty: ${formatoiRaha(maara)}`);
    await odota(TILA.VIESTI_KESTO_MS);
    naytaValikko();
}

async function suoritaNosto(maara) {
    if (TILA.saldo >= maara) {
        TILA.saldo -= maara;
        lisaaTapahtumaLokiin("NOSTO", maara);
        naytaOnnistuminen("NOSTO ONNISTUI", `Ole hyvä ja ota ${formatoiRaha(maara)}`);
    } else {
        naytaVirhe("EI KATETTA", `Tililläsi on vain ${formatoiRaha(TILA.saldo)}.`);
    }
    await odota(TILA.VIESTI_KESTO_MS);
    naytaValikko();
}

// ============================================================
//  KORTIN KÄSITTELY
// ============================================================

async function processCard() {
    if (TILA.korttiSisalla) return;

    const kortti = DOM.movingCard();
    if (!kortti) {
        console.error("Elementtiä 'moving-card' ei löydy.");
        return;
    }

    TILA.korttiSisalla = true;

    kortti.style.transition = "none";
    kortti.style.display    = "block";
    kortti.style.opacity    = "1";
    kortti.style.bottom     = "-140px";

    await odota(50);
    kortti.style.transition = "bottom 1.8s ease-in-out, opacity 1.2s ease-in-out";
    kortti.style.bottom     = "70px";

    await odota(1000);
    kortti.style.opacity = "0";

    await odota(1000);
    kortti.style.display = "none";

    const modal = DOM.modal();
    if (modal) modal.style.display = "flex";
    naytaKirjautuminen();
}

function resetoiTila() {
    TILA.korttiSisalla = false;
    TILA.pinYritykset  = 0;
    TILA.tapahtumat    = [];
    TILA.UItila        = "ALKU";

    const modal = DOM.modal();
    if (modal) modal.style.display = "none";
}

// ============================================================
//  NÄPPÄIMISTÖ
// ============================================================

function handlePinButton(arvo) {
    // Jos ollaan infonäytössä, CANCEL sulkee sen ja palauttaa edellisen näkymän
    if (TILA.UItila === "INFO") {
        if (arvo === "CANCEL") {
            const body = DOM.modalBody();
            if (body) {
                body.innerHTML = TILA.edellinenHTML;
                // Palautetaan oikea UI-tilan seuranta tekstisisällön perusteella
                if (body.innerText.includes("SYÖTÄ PIN")) TILA.UItila = "PIN";
                else if (body.innerText.includes("SALDO —")) TILA.UItila = "VALIKKO";
                else if (body.innerText.includes("TILIN SALDO")) TILA.UItila = "SALDO";
                else if (body.innerText.includes("20 € —")) TILA.UItila = "NOSTOVALIKKO";
                else if (body.innerText.includes("TALLETUS")) TILA.UItila = "TALLETUS";
                else if (body.innerText.includes("Vain 10 €")) TILA.UItila = "MUUSUMMA";
                else {
                    // Jos korttia ei oltu edes syötetty, suljetaan modal kokonaan
                    resetoiTila();
                }
                paivitaTekstienKoot();
            }
        }
        return;
    }

    const pin      = DOM.pinInput();
    const muuSumma = DOM.muuSumma();
    const talletus = DOM.talletusSumma();

    const activeScreen = DOM.modalBody()?.innerText ?? "";
    if (activeScreen.includes("ONNISTUI") || activeScreen.includes("VIRHE") || activeScreen.includes("KATETTA") || activeScreen.includes("TULOSTUS")) {
        return; 
    }

    if (arvo === "CANCEL") {
        if (pin)      { pin.value = ""; }
        else if (muuSumma)  { naytaNosto(); }
        else                { naytaValikko(); }
        return;
    }

    const kentta = pin ?? muuSumma ?? talletus;
    if (!kentta) return;

    const maxPituus = kentta === pin ? 4 : 5;

    if (arvo === "CLEAR") {
        kentta.value = kentta.value.slice(0, -1);
    } else if (arvo === "ENTER") {
        if (kentta === pin)           tarkistaPin();
        else if (kentta === muuSumma)  tarkistaNosto(parseInt(muuSumma.value, 10));
        else if (kentta === talletus)  tarkistaTalletus();
    } else if (/^\d$/.test(arvo) && kentta.value.length < maxPituus) {
        kentta.value += arvo;
    }
}

// ============================================================
//  KLIKKIALUEET & SIVUNAPIT
// ============================================================

function handleAction(alue, event) {
    if (alue === "SIVUNAPIT" && event) {
        _kasitteleSivunapit(event.offsetY);
        return;
    }
    if (alue === "NÄPPÄIMISTÖ" && event) {
        _kasitteleNappaimisto(event.offsetX, event.offsetY);
    }
}

function _kasitteleSivunapit(y) {
    if (!TILA.korttiSisalla || DOM.pinInput() || TILA.UItila === "INFO") return;

    const teksti        = DOM.modalBody()?.innerText ?? "";
    const onNosto       = teksti.includes("20 €") || teksti.includes("MUU SUMMA");
    const onSaldoRuutu  = teksti.includes("TILIN SALDO");
    const onPalaute     = teksti.includes("ONNISTUI") || teksti.includes("KATETTA") || teksti.includes("VIRHEELLINEN") || teksti.includes("KUITTI") || teksti.includes("TULOSTUS");

    if (onPalaute) return;

    if (y < 100) {
        if (onNosto) tarkistaNosto(20);
        else if (!onSaldoRuutu) naytaSaldo();
    } 
    else if (y < 200) {
        if (onNosto) tarkistaNosto(40);
        else if (!onSaldoRuutu) naytaTalletus();
    } 
    else {
        if (onNosto) naytaMuuSumma();
        else if (!onSaldoRuutu) naytaNosto();
    }
}

function _kasitteleNappaimisto(x, y) {
    const rivi = y < 50 ? 0 : y < 100 ? 1 : y < 150 ? 2 : 3;
    const sarake = x < 40 ? 0 : x < 80 ? 1 : x < 120 ? 2 : 3;

    const kartta = [
        ["1", "2", "3", "CANCEL"],
        ["4", "5", "6", "CLEAR"],
        ["7", "8", "9", "ENTER"],
        [null, "0", null, null],
    ];

    const nappi = kartta[rivi]?.[sarake];
    if (nappi) handlePinButton(nappi);
}

// ============================================================
//  🧾 PAPERIKUITTI
// ============================================================

async function signOut() {
    if (!TILA.korttiSisalla || DOM.pinInput() || TILA.UItila === "INFO") return;

    let kuittiTeksti = `  AUTOMAATTI\n`;
    kuittiTeksti += `${new Date().toLocaleDateString("fi-FI")}\n`;
    kuittiTeksti += `-----------\n`;
    
    if (TILA.tapahtumat.length === 0) {
        kuittiTeksti += `Ei tapahtumia\n`;
    } else {
        TILA.tapahtumat.forEach(t => {
            const osat = t.split("  ");
            kuittiTeksti += `${osat[1] || ""} ${osat[2] || ""}\n`;
        });
    }
    kuittiTeksti += `-----------\n`;
    kuittiTeksti += `SALDO: ${TILA.saldo.toFixed(2)}€\n\n`;
    kuittiTeksti += `KIITOS!`;

    const kuittiAukko = document.getElementById("receipt-slot");
    if (!kuittiAukko) return;

    const vanhaKuitti = document.getElementById("tulostettu-kuitti");
    if (vanhaKuitti) vanhaKuitti.remove();

    const kuittiElementti = document.createElement("pre");
    kuittiElementti.id = "tulostettu-kuitti";
    kuittiElementti.innerText = kuittiTeksti;
    kuittiAukko.appendChild(kuittiElementti);

    asetaSisalto(`
        <h2>TULOSTUS</h2>
        <p>Ota kuitti kuittiraosta.</p>
        <p class="ohje-pieni" style="color: #0045a1; font-weight: bold;">Tulostetaan...</p>
    `);

    await odota(50);
    kuittiElementti.classList.add("tulostaa");

    await odota(4000);

    naytaOnnistuminen("ULOSKIRJAUTUMINEN", "Kiitos asioinnista!<br>Ole hyvä ja ota korttisi.");
    await odota(2500); 

    kuittiElementti.classList.remove("tulostaa");
    setTimeout(() => { if (kuittiElementti) kuittiElementti.remove(); }, 1000);

    resetoiTila();
    const screen = document.getElementById("screen-content");
    if (screen) screen.innerHTML = "";
    naytaKirjautuminen();
}

// ============================================================
// ℹ️ INFO-NAPIN TOIMINNALLISUUS (AUKI AINA JA KAIKKIALLA)
// ============================================================

/** Näyttää automaatin vaiheittaiset ohjeet käyttäjälle */
function naytaInfoRuutu() {
    // Estetään aukaisemasta infoa jos ollaan jo infossa tai tulostuksessa
    const nykyinenTeksti = DOM.modalBody()?.innerText ?? "";
    if (TILA.UItila === "INFO" || nykyinenTeksti.includes("TULOSTUS")) return;

    // Jos kortti ei ole sisällä, avataan modal-ruutu näkyviin infoa varten
    const modal = DOM.modal();
    if (modal && modal.style.display !== "flex") {
        modal.style.display = "flex";
    }

    // Tallennetaan mitä ruudulla oli ennen infon klikkausta, jotta osataan palata takaisin
    TILA.edellinenHTML = DOM.modalBody()?.innerHTML ?? "";
    TILA.UItila = "INFO";

    asetaSisalto(`
        <h2 style="margin-bottom:5px; font-size:14px;">ℹ️ KÄYTTÖOHJEET</h2>
        <div style="text-align:left; font-size:9px; line-height:1.2; padding:0 5px; color:#111;">
            <p><strong>1.</strong> Paina kortinlukijaa.</p>
            <p><strong>2.</strong> Näppäile 1234 PIN-koodi ja paina ENTER.</p>
            <p><strong>3.</strong> Valitse sivunapeilla SALDO, TALLETUS tai NOSTA.</p>
            <p><strong>4.</strong> Voit palata takaisin painamalla CANCEL-nappia.</p>
            <p><strong>5.</strong> Voit  kirjautua ulos painamalla punaista SIGN OUT-nappia.</p>
        </div>
        <p class="ohje-pieni" style="margin-top:8px; font-weight:bold; color:#d32f2f;">
            Sulje ohje painamalla näppäimistön <span class="merkki-cancel">CANCEL</span>-nappia
        </p>
    `);
}

// Odotetaan, että sivu on latautunut, ja sidotaan toiminto kiinni CSS-ID:hen
document.addEventListener("DOMContentLoaded", () => {
    const infoNappi = document.getElementById("info-btn");

    if (infoNappi) {
        infoNappi.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            naytaInfoRuutu();
        });
        console.log("✅ Info-nappi aktivoitu kaikille näkymille!");
    } else {
        console.warn("⚠️ Info-nappia ei löytynyt tunnuksella '#info-btn'.");
    }
});

console.log("✅ Pankkiautomaatin logiikka päivitetty ja korjattu.");