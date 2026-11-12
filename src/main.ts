// Crea una matriz de 8 filas y 10 asientos con ocupación irregular.
function initCinema(): number[][] {
  const cinema: number[][] = [];

  for (let row = 0; row < 8; row += 1) {
    const seats: number[] = [];
    for (let column = 0; column < 10; column += 1) {
      if ((row * 7 + column * 5) % 9 < 3) {
        seats.push(1);
      } else {
        seats.push(0);
      }
    }
    cinema.push(seats);
  }

  return cinema;
}

const lot: number[][] = initCinema();

// Comprueba si una posición está ocupada; las filas y columnas empiezan en 1.
function seatOccupied(row: number, column: number): boolean {
  return lot[row - 1]?.[column - 1] === 1;
}

// Reserva una posición libre usando números de fila y columna desde 1.
function reserveSeats(row: number, column: number): string {
  if (
    row < 1 ||
    row > 8 ||
    row % 1 !== 0 ||
    column < 1 ||
    column > 10 ||
    column % 1 !== 0
  ) {
    return "posición inválida";
  }

  const rowIndex = row - 1;
  const columnIndex = column - 1;
  const rowLabel = String.fromCharCode(64 + row);

  if (seatOccupied(row, column)) {
    return "plaza ya ocupada";
  }

  lot[rowIndex][columnIndex] = 1;
  return `reservada ${rowLabel}${column}`;
}

// Cuenta los asientos ocupados y libres y devuelve ambos totales.
function countSeats(lot: number[][]): string {
  let occupiedSeats = 0;
  let availableSeats = 0;

  for (let row = 0; row < lot.length; row += 1) {
    for (let column = 0; column < lot[row].length; column += 1) {
      if (lot[row][column] === 1) {
        occupiedSeats += 1;
      } else {
        availableSeats += 1;
      }
    }
  }

  return `Asientos ocupados: ${occupiedSeats} · Asientos libres: ${availableSeats}`;
}

// Devuelve el primer par de asientos libres contiguos de la sala.
function findAdjacentSeats(lot: number[][]): number[] {
  for (let row = 0; row < lot.length; row += 1) {
    for (let column = 0; column < lot[row].length - 1; column += 1) {
      if (lot[row][column] === 0 && lot[row][column + 1] === 0) {
        return [row + 1, column + 1, row + 1, column + 2];
      }
    }
  }

  return [];
}

// Muestra el estado de cada asiento en el mapa del gestor.
function displayLot(lot: number[][]): void {
  if (typeof document === "undefined") return;

  import("./style.css").then(() => {
    const seatGrid = document.querySelector<HTMLDivElement>(
      '[role="group"][aria-label="Asientos de la sala, filas A a H"]',
    );

    if (seatGrid) {
      const seatButtons = seatGrid.querySelectorAll<HTMLButtonElement>(
        'button[aria-label^="Fila"]',
      );
      let availableSeats = 0;
      let occupiedSeats = 0;
      let selectedSeatCount = 0;
      let selectedSeatLabels = "";

      for (let index = 0; index < seatButtons.length; index += 1) {
        const row = Math.floor(index / 10);
        const column = index % 10;
        const occupied = lot[row]?.[column] === 1;
        const rowLabel = String.fromCharCode(65 + row);
        const seatButton = seatButtons[index];
        const selected = !occupied && seatButton.getAttribute("aria-pressed") === "true";

        if (occupied) {
          occupiedSeats += 1;
        } else {
          availableSeats += 1;
          if (selected) {
            selectedSeatCount += 1;
            selectedSeatLabels += `${selectedSeatLabels ? ", " : ""}${rowLabel}${column + 1}`;
          }
        }

        seatButton.disabled = occupied;
        seatButton.setAttribute(
          "aria-label",
          `Fila ${rowLabel}, asiento ${column + 1}, ${occupied ? "ocupado" : selected ? "seleccionado" : "libre"}`,
        );
        seatButton.setAttribute("aria-pressed", String(selected));
        seatButton.className = occupied
          ? "size-9 justify-self-center rounded-md border border-rose-200 bg-rose-100 text-xs font-medium text-rose-800 disabled:cursor-not-allowed sm:size-10"
          : selected
            ? "size-9 justify-self-center rounded-md border-2 border-emerald-800 bg-emerald-700 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:size-10"
            : "size-9 justify-self-center rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:size-10";
        seatButton.textContent = occupied ? "X" : "L";
      }

      const availableCount = document.querySelector<HTMLElement>("#available-count");
      const occupiedCount = document.querySelector<HTMLElement>("#occupied-count");
      const selectedCount = document.querySelector<HTMLElement>("#selected-count");
      const selectedSeatList = document.querySelector<HTMLElement>("#selected-seat-list");
      const reserveButton = document.querySelector<HTMLButtonElement>("#reserve-selection");
      const clearButton = document.querySelector<HTMLButtonElement>("#clear-selection");
      if (availableCount) availableCount.textContent = String(availableSeats);
      if (occupiedCount) occupiedCount.textContent = String(occupiedSeats);
      if (selectedCount) {
        selectedCount.textContent = `${selectedSeatCount} ${selectedSeatCount === 1 ? "asiento seleccionado" : "asientos seleccionados"}`;
      }
      if (selectedSeatList) {
        selectedSeatList.textContent = selectedSeatLabels || "Ninguno";
        selectedSeatList.setAttribute(
          "aria-label",
          selectedSeatLabels ? `Asientos seleccionados: ${selectedSeatLabels}` : "No hay asientos seleccionados",
        );
      }
      if (reserveButton) reserveButton.disabled = selectedSeatCount === 0;
      if (clearButton) clearButton.disabled = selectedSeatCount === 0;
    }
  });
}

if (typeof document !== "undefined") {
  const seatGrid = document.querySelector<HTMLDivElement>(
    '[role="group"][aria-label="Asientos de la sala, filas A a H"]',
  );
  const findPairButton = document.querySelector<HTMLButtonElement>("#find-adjacent");
  const reserveButton = document.querySelector<HTMLButtonElement>("#reserve-selection");
  const clearButton = document.querySelector<HTMLButtonElement>("#clear-selection");
  const operationMessages = document.querySelector<HTMLElement>("#operation-messages");

  if (seatGrid) {
    seatGrid.addEventListener("click", (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement) || target.disabled) return;

      const isSelected = target.getAttribute("aria-pressed") === "true";
      target.setAttribute("aria-pressed", String(!isSelected));
      displayLot(lot);
    });
  }

  if (findPairButton && seatGrid) {
    findPairButton.addEventListener("click", () => {
      const seatButtons = seatGrid.querySelectorAll<HTMLButtonElement>(
        'button[aria-label^="Fila"]',
      );
      for (let index = 0; index < seatButtons.length; index += 1) {
        seatButtons[index].setAttribute("aria-pressed", "false");
      }

      const adjacentSeats = findAdjacentSeats(lot);
      if (adjacentSeats.length === 0) {
        if (operationMessages) operationMessages.textContent = "No hay asientos libres contiguos.";
      } else {
        const firstSeatIndex = (adjacentSeats[0] - 1) * 10 + adjacentSeats[1] - 1;
        const secondSeatIndex = (adjacentSeats[2] - 1) * 10 + adjacentSeats[3] - 1;
        seatButtons[firstSeatIndex].setAttribute("aria-pressed", "true");
        seatButtons[secondSeatIndex].setAttribute("aria-pressed", "true");
        const firstRowLabel = String.fromCharCode(64 + adjacentSeats[0]);
        const secondRowLabel = String.fromCharCode(64 + adjacentSeats[2]);
        if (operationMessages) {
          operationMessages.textContent = `Pareja disponible seleccionada: ${firstRowLabel}${adjacentSeats[1]} y ${secondRowLabel}${adjacentSeats[3]}`;
        }
      }

      displayLot(lot);
    });
  }

  if (reserveButton && seatGrid) {
    reserveButton.addEventListener("click", () => {
      const seatButtons = seatGrid.querySelectorAll<HTMLButtonElement>(
        'button[aria-label^="Fila"]',
      );
      let reservationMessages = "";

      for (let index = 0; index < seatButtons.length; index += 1) {
        const seatButton = seatButtons[index];
        if (seatButton.getAttribute("aria-pressed") === "true") {
          const row = Math.floor(index / 10) + 1;
          const column = (index % 10) + 1;
          const reservationMessage = reserveSeats(row, column);
          reservationMessages += `${reservationMessages ? "\n" : ""}${reservationMessage}`;
          seatButton.setAttribute("aria-pressed", "false");
        }
      }

      if (operationMessages) {
        operationMessages.textContent = `${reservationMessages}\n${countSeats(lot)}`;
      }
      displayLot(lot);
    });
  }

  if (clearButton && seatGrid) {
    clearButton.addEventListener("click", () => {
      const seatButtons = seatGrid.querySelectorAll<HTMLButtonElement>(
        'button[aria-label^="Fila"]',
      );
      for (let index = 0; index < seatButtons.length; index += 1) {
        seatButtons[index].setAttribute("aria-pressed", "false");
      }
      if (operationMessages) operationMessages.textContent = "Selección limpiada.";
      displayLot(lot);
    });
  }

  if (operationMessages) operationMessages.textContent = countSeats(lot);
  displayLot(lot);
}

export {};
