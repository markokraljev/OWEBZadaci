document.addEventListener("DOMContentLoaded", () => {
    //Definicija na 10 vozaci so bazicna brzina, veshtina, gumi i vkupno vreme
    const driversData = [
        { name: "Verstappen", speed: 85, skill: 95, classKey: "verstappen", team: "Red Bull", logo: "redbull-logo.png", img: "max_supermax.png" },
        { name: "Piastri", speed: 84, skill: 92, classKey: "piastri", team: "McLaren", logo: "mclaren-logo.png", img: "oscar_piastri.png" },
        { name: "Antonelli", speed: 83, skill: 89, classKey: "antonelli", team: "Mercedes", logo: "mercedes-logo.png", img: "kimi.png" },
        { name: "Hamilton", speed: 84, skill: 93, classKey: "hamilton", team: "Ferrari", logo: "ferrari-logo.png", img: "lewis_hamilton.png" },
        { name: "Leclerc", speed: 85, skill: 94, classKey: "leclerc", team: "Ferrari", logo: "ferrari-logo.png", img: "charcles leclerc.png" },
        { name: "Hulkenberg", speed: 81, skill: 87, classKey: "hulkenberg", team: "Audi", logo: "audi-logo.png", img: "hulkenberg.png" },
        { name: "Alonso", speed: 83, skill: 94, classKey: "alonso", team: "Aston Martin", logo: "astonmartin-logo.png", img: "fernando_alonso.png" },
        { name: "Gasly", speed: 82, skill: 88, classKey: "gasly", team: "Alpine", logo: "alpine-logo.png", img: "pierre.png" },
        { name: "Sainz", speed: 83, skill: 90, classKey: "sainz", team: "Williams", logo: "williams-logo.png", img: "smooth_operator.png" },
        { name: "Stroll", speed: 80, skill: 85, classKey: "stroll", team: "Aston Martin", logo: "astonmartin-logo.png", img: "lance_stroll.png" }
    ];

    // Inicijalizacija na objektite za trkata
    let drivers = driversData.map(d => ({
        ...d,
        totalTime: 0,
        lastLapTime: 0,
        tire: "Medium",       // Poceten tip na gumi
        hasPitStopped: false, // Mora barem ednas da vleze vo box
        pitsCount: 0
    }));

    let currentLap = 0;
    const maxLaps = 10;
    const simulateBtn = document.getElementById("simulate-btn");
    const lapCounter = document.getElementById("lap-counter");
    const tbody = document.querySelector("tbody");

    simulateBtn.addEventListener("click", () => {
        if (currentLap >= maxLaps) {
            alert("Trkata e veke zavrsena! Pobednikot e veke proglasen.");
            return;
        }

        currentLap++;
        lapCounter.textContent = `Lap: ${currentLap} / ${maxLaps}`;

        // Slucajen nastan: Safety Car izleguva so 15% sansa vo krug
        let safetyCarActive = Math.random() < 0.15;
        let globalStatusMsg = safetyCarActive ? "⚠️ Safety Car Deployed!" : "";

        // Pominuvame niz sekoj vozac za da presmetame vreme za ovoj krug
        drivers.forEach(driver => {
            let status = safetyCarActive ? "Safety Car" : "Normal";
            let timeModifier = 0;

            // Logika za vlez vo pit-stop (sekoj mora da vleze najdocna do 8-mi krug ako ne vlegol porano)
            let forcePit = (!driver.hasPitStopped && currentLap >= 7 && Math.random() < 0.5);
            let regularPit = (currentLap >= 3 && currentLap <= 8 && Math.random() < 0.25);

            if (forcePit || regularPit || (!driver.hasPitStopped && currentLap === 9)) {
                driver.hasPitStopped = true;
                driver.pitsCount++;
                // Smena na tip na gumi pomegju Soft i Medium
                driver.tire = driver.tire === "Medium" ? "Soft" : "Medium";
                timeModifier += 2.5; // Gubi vreme vo bokcot (2.5 sekundi)
                status = "Pit Stop (Tires Changed)";
            } else {
                // Performansi zavisno od gumite (Soft se pobrzi, Medium se stabilni)
                if (driver.tire === "Soft") {
                    timeModifier -= 0.6; 
                }
            }

            // Slucajno izvrtuvanje / izletuvanje na pateka (10% sansa)
            if (!safetyCarActive && Math.random() < 0.10) {
                timeModifier += 4.0; // Gubi golema minuta/sekundi poradi izletuvanje
                status = "Spin / Out of Track";
            }

           
            let baseLapTime = 80.0; // 1 minuta i 20 sekundi bazno vreme
            let speedFactor = (100 - driver.speed) * 0.15;
            let skillFactor = (100 - driver.skill) * 0.10;
            let randomVar = (Math.random() * 2.0) - 1.0; // Varijacija od -1 do +1 sekunda

            let lapTimeSeconds = baseLapTime + speedFactor + skillFactor + timeModifier + randomVar;
            if (safetyCarEqualizer(safetyCarAn(safetyCarActive))) {
                lapTimeSeconds += 5.0; // Safety car gi usporuva site
            }

            driver.lastLapTime = lapTimeSeconds;
            driver.totalTime += lapTimeSeconds;
            driver.currentStatus = status;
        });

        // Sortiranje na vozacite spored vkupnoto vreme (najmalo vkupno vreme = 1-va pozicija)
        drivers.sort((a, b) => a.totalTime - b.totalTime);

        // Azuriranje na tabelata na ekran
        updateTable(globalStatusMsg);

        // Proverka dali e kraj na 10-tiot krug
        if (currentLap === maxLaps) {
            simulateBtn.textContent = "Race Finished";
            simulateBtn.style.backgroundColor = "#555";
            simulateBtn.disabled = true;
            
            // Označi pobednik (prviot na listata)
            highlightWinner();
        }
    });

    function safetyCarAn(active) { return active; }
    function safetyCarEqualizer(active) { return active; }

    // Funkcija za formatiranje na sekundi vo format 1:25.432
    function formatTime(seconds) {
        let mins = Math.floor(seconds / 60);
        let secs = (seconds % 60).toFixed(3);
        if (secs < 10) secs = "0" + secs;
        return `${mins}:${secs}`;
    }

    // Funkcija za redraw na tabelata so novite pozicii
    function updateTable(globalMessage) {
        tbody.innerHTML = ""; // Jasneenje na starata sodrzina

        drivers.forEach((driver, index) => {
            let position = index + 1;
            let formattedTime = formatTime(driver.totalTime);
            let displayStatus = globalMessage && driver.currentStatus === "Normal" ? globalMessage : driver.currentStatus;

            let tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="position">${position}</td>
                <td class="driver-cell ${driver.classKey}">
                    <img src="${driver.logo}" alt="${driver.team}" class="team-logo">
                    <img src="${driver.img}" alt="${driver.name}" class="driver-img">
                    <span>${driver.name}</span>
                </td>
                <td>${driver.team}</td>
                <td>${formattedTime}</td>
                <td>${driver.tire}</td>
                <td>${displayStatus}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    // Funkcija za vizuelno oznacuvanje na pobednikot na krajot
    function highlightWinner() {
        let rows = tbody.querySelectorAll("tr");
        if (rows.length > 0) {
            rows[0].style.backgroundColor = "#ffd700"; // Zlatna pozadina za pobednikot
            rows[0].style.color = "#000000";
            let statusTd = rows[0].querySelector("td:last-child");
            statusTd.textContent = "🏆 WINNER!";
            statusTd.style.fontWeight = "bold";
            statusTd.style.color = "#d4af37";
        }
    }
});