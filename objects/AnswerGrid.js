/** Answer grid — ports GameItemView / math / color / memory buttons */

export class AnswerGrid {
  constructor(container, onSelect) {
    this.container = container;
    this.onSelect = onSelect;
    this.enabled = true;
    this.grid = null;
  }

  clear() {
    this.container.replaceChildren();
    this.grid = null;
    this.enabled = true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setDimmed(dimmed) {
    this.container.classList.toggle('dimmed', dimmed);
  }

  /**
   * @param {Array<{index:number, kind:string, label:string, value?:string, color?:string}>} cells
   */
  render(cells) {
    this.clear();
    this.grid = document.createElement('div');
    this.grid.className = 'answer-grid';

    // Shuffle visual grid slots (3x5) like iOS position* methods
    const slots = Array.from({ length: 15 }, (_, i) => i);
    for (let i = slots.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    cells.forEach((cell, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cell pop-in';
      btn.style.animationDelay = `${i * 0.1}s`;
      btn.style.gridArea = slotToGridArea(slots[i]);
      btn.dataset.index = String(cell.index);

      if (cell.kind === 'emoji') {
        btn.classList.add('emoji');
        btn.textContent = cell.label;
      } else if (cell.kind === 'color') {
        btn.classList.add('color-swatch');
        btn.style.background = cell.color;
        if (cell.color === '#FFFFFF' || cell.color === '#FFCC00') {
          btn.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.15)';
        }
      } else {
        btn.textContent = cell.label;
        if (cell.kind === 'memory') {
          btn.style.fontSize = 'clamp(0.75rem, 3vw, 1rem)';
        }
      }

      btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        this.onSelect?.(cell.index, cell);
      });

      this.grid.appendChild(btn);
    });

    this.container.appendChild(this.grid);
  }
}

function slotToGridArea(slotIndex) {
  const col = (slotIndex % 3) + 1;
  const row = Math.floor(slotIndex / 3) + 1;
  return `${row} / ${col}`;
}
