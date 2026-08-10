// ========================================
// FOTOGRAFIE
// ========================================

const mista = [
    {
        foto: "fotky/01.jpg",
        lat: 50.7804792,
        lng: 15.0832603
    },
    {
        foto: "fotky/02.jpg",
        lat: 50.7637114,
        lng: 15.0652561
    },
    {
        foto: "fotky/03.jpg",
        lat: 50.7518517,
        lng: 15.0643269
    },
    {
        foto: "fotky/04.jpg",
        lat: 50.7706022,
        lng: 15.0580956
    },
    {
        foto: "fotky/05.jpg",
        lat: 50.7426642,
        lng: 15.0589222
    },
    {
        foto: "fotky/06.jpg",
        lat: 50.7600583,
        lng: 15.0700569
    },
    {
        foto: "fotky/07.jpg",
        lat: 50.7611903,
        lng: 15.0956367
    },
    {
        foto: "fotky/08.jpg",
        lat: 50.7941397,
        lng: 15.0884750
    },
    {
        foto: "fotky/09.jpg",
        lat: 50.7623692,
        lng: 15.0498803
    },
    {
        foto: "fotky/10.jpg",
        lat: 50.7636708,
        lng: 15.0469358
    },
    {
        foto: "fotky/11.jpg",
        lat: 50.7507828,
        lng: 15.0327925
    },
    {
        foto: "fotky/12.jpg",
        lat: 50.7510283,
        lng: 15.0340239
    },
    {
        foto: "fotky/13.jpg",
        lat: 50.7534103,
        lng: 15.0331458
    },
    {
        foto: "fotky/14.jpg",
        lat: 50.7736722,
        lng: 14.9836494
    },
    {
        foto: "fotky/15.jpg",
        lat: 50.7355914,
        lng: 15.0010286
    },
    {
        foto: "fotky/16.jpg",
        lat: 50.7811128,
        lng: 15.0693658
    }
];

// ========================================
// NASTAVENÍ HRY
// ========================================

const POCET_KOL = 5;

const VYCHOZI_LAT = 50.7671;
const VYCHOZI_LON = 15.0562;
const VYCHOZI_ZOOM = 13;


// ========================================
// PROMĚNNÉ HRY
// ========================================

let aktualniKolo = 1;
let celkoveSkore = 0;

let dostupnaMista = [...mista];

let misto = null;

let hracuvMarker = null;
let spravnyMarker = null;
let cara = null;

let odpovezeno = false;

let tipLat = null;
let tipLon = null;
let vysledkyKol = [];


// ========================================
// VYTVOŘENÍ MAPY
// ========================================

const map = L.map("map").setView(
    [VYCHOZI_LAT, VYCHOZI_LON],
    VYCHOZI_ZOOM
);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);


// ========================================
// NOVÉ KOLO
// ========================================

function noveKolo() {

    odpovezeno = false;

    tipLat = null;
    tipLon = null;


    // Pokud už nejsou žádná místa,
    // hra začne znovu s celým seznamem.
    if (dostupnaMista.length === 0) {
        dostupnaMista = [...mista];
    }


    // Náhodné místo
    const index = Math.floor(
        Math.random() * dostupnaMista.length
    );


    misto = dostupnaMista[index];


    // Odstraníme ho ze seznamu,
    // aby se v této hře neopakovalo.
    dostupnaMista.splice(index, 1);


    // Zobrazíme fotografii
    document
        .getElementById("fotografie")
        .src = misto.foto;


    // Aktualizujeme číslo kola
    document
        .getElementById("kolo")
        .textContent =
        `Kolo ${aktualniKolo} / ${POCET_KOL}`;


    // Aktualizujeme celkové skóre
    document
        .getElementById("celkoveSkore")
        .textContent =
        `${celkoveSkore.toLocaleString("cs-CZ")} bodů`;


    // Vrátíme mapu na Liberec
    map.setView(
        [VYCHOZI_LAT, VYCHOZI_LON],
        VYCHOZI_ZOOM
    );


    // Odstraníme staré značky
    if (hracuvMarker) {
        map.removeLayer(hracuvMarker);
        hracuvMarker = null;
    }

    if (spravnyMarker) {
        map.removeLayer(spravnyMarker);
        spravnyMarker = null;
    }

    if (cara) {
        map.removeLayer(cara);
        cara = null;
    }


    // Schováme výsledek
    document
        .getElementById("vysledek")
        .classList.add("skryty");


    // Znovu zobrazíme potvrzení
    document
        .getElementById("potvrditTip")
        .classList.remove("skryty");
}


// ========================================
// KLIKNUTÍ NA MAPU
// ========================================

map.on("click", function (e) {

    if (odpovezeno) {
        return;
    }


    tipLat = e.latlng.lat;
    tipLon = e.latlng.lng;


    // Přesuneme hráčův marker
    if (hracuvMarker) {
        map.removeLayer(hracuvMarker);
    }


    hracuvMarker = L.marker([
        tipLat,
        tipLon
    ]).addTo(map);
});


// ========================================
// POTVRZENÍ TIPU
// ========================================

document
    .getElementById("potvrditTip")
    .addEventListener("click", function () {

        if (tipLat === null || tipLon === null) {

            alert("Nejdříve klikni na mapu.");

            return;
        }


        odpovezeno = true;


        // Správné místo
      spravnyMarker = L.marker([
    misto.lat,
    misto.lng
]).addTo(map);


        // Spojovací čára
        cara = L.polyline([
            [tipLat, tipLon],
            [misto.lat, misto.lng]
        ]).addTo(map);


        // Vzdálenost
        const vzdalenost =
            spocitejVzdalenost(
                misto.lat,
                misto.lng,
                tipLat,
                tipLon
            );


        // Body
        const body =
            spocitejBody(vzdalenost);


        // Přidáme body do celkového skóre
        celkoveSkore += body;
vysledkyKol.push(body);

        // Zobrazíme výsledek
        document
            .getElementById("vzdalenost")
            .textContent =
            formatujVzdalenost(vzdalenost);


        document
            .getElementById("skore")
            .textContent =
            body.toLocaleString("cs-CZ");


        document
            .getElementById("celkoveSkore")
            .textContent =
            `${celkoveSkore.toLocaleString("cs-CZ")} bodů`;


        document
            .getElementById("vysledek")
            .classList.remove("skryty");


        // Schováme potvrzení
        document
            .getElementById("potvrditTip")
            .classList.add("skryty");


        // Přiblíží mapu na oba body
        map.fitBounds([
            [tipLat, tipLon],
            [misto.lat, misto.lng]
        ], {
            padding: [50, 50]
        });
    });


// ========================================
// DALŠÍ KOLO
// ========================================

document
    .getElementById("dalsiKolo")
    .addEventListener("click", function () {

        aktualniKolo++;


        // ========================================
        // KONEC HRY
        // ========================================

        if (aktualniKolo > POCET_KOL) {

            zobrazKonecHry();

            return;
        }


        // ========================================
        // DALŠÍ KOLO
        // ========================================

        noveKolo();
    });

    function zobrazKonecHry() {

    // Schováme herní plochu
    document
        .querySelector(".herni-plocha")
        .classList.add("skryty");


    // Zobrazíme závěrečnou obrazovku
    document
        .getElementById("konecHry")
        .classList.remove("skryty");


    // Finální skóre
    document
        .getElementById("finalniSkore")
        .textContent =
        celkoveSkore.toLocaleString("cs-CZ");


    // Maximální skóre
    document
        .getElementById("maxSkore")
        .textContent =
        `/ ${POCET_KOL * 1000}`;


    // Průměr
    const prumer =
        Math.round(
            celkoveSkore / POCET_KOL
        );

    document
        .getElementById("prumerSkore")
        .textContent =
        prumer.toLocaleString("cs-CZ");


    // Přehled kol
    const prehled =
        document.getElementById("prehledKol");

    prehled.innerHTML = "";


    vysledkyKol.forEach(function (body, index) {

        const radek =
            document.createElement("div");

        radek.className = "prehled-kolo";

        radek.innerHTML = `
            <span>Kolo ${index + 1}</span>
            <strong>
                ${body.toLocaleString("cs-CZ")} bodů
            </strong>
        `;

        prehled.appendChild(radek);
    });
}

document
    .getElementById("novaHra")
    .addEventListener("click", function () {

        aktualniKolo = 1;
        celkoveSkore = 0;
        vysledkyKol = [];

        dostupnaMista = [...mista];


        document
            .getElementById("konecHry")
            .classList.add("skryty");


        document
            .querySelector(".herni-plocha")
            .classList.remove("skryty");


        noveKolo();
    });


// ========================================
// VÝPOČET VZDÁLENOSTI
// ========================================

function spocitejVzdalenost(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const radLat1 =
        lat1 * Math.PI / 180;

    const radLat2 =
        lat2 * Math.PI / 180;

    const rozdilLat =
        (lat2 - lat1) * Math.PI / 180;

    const rozdilLon =
        (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(rozdilLat / 2) ** 2 +
        Math.cos(radLat1) *
        Math.cos(radLat2) *
        Math.sin(rozdilLon / 2) ** 2;


    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


// ========================================
// VÝPOČET BODŮ
// ========================================

function spocitejBody(vzdalenost) {

    if (vzdalenost <= 50) {
        return 1000;
    }

    if (vzdalenost <= 250) {
        return 800;
    }

    if (vzdalenost <= 500) {
        return 600;
    }

    if (vzdalenost <= 1000) {
        return 500;
    }

    if (vzdalenost <= 2000) {
        return 400;
    }

    if (vzdalenost <= 3000) {
        return 300;
    }

    if (vzdalenost <= 5000) {
        return 200;
    }

    if (vzdalenost <= 10000) {
        return 100;
    }

    return 0;
}


// ========================================
// FORMÁTOVÁNÍ VZDÁLENOSTI
// ========================================

function formatujVzdalenost(vzdalenost) {

    if (vzdalenost < 1000) {

        return (
            Math.round(vzdalenost)
            + " m"
        );
    }


    return (
        (vzdalenost / 1000)
            .toFixed(2)
            .replace(".", ",")
        + " km"
    );
}


// ========================================
// SPUŠTĚNÍ HRY
// ========================================

noveKolo();