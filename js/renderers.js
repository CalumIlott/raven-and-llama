// Visual Widget Renderers for Maths Masters Dojo (with Exact Matching Icons & Emojis)
class VisualRenderers {
  // 1. Subitising Dots & Dice Patterns
  static renderSubitise(target, layout = 'dice', icon = '🥋') {
    if (layout === 'dice' && target <= 6) {
      return VisualRenderers.renderDiceFace(target);
    }
    let dotsHtml = '';
    for (let i = 0; i < target; i++) {
      dotsHtml += `
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600 shadow-lg flex items-center justify-center text-2xl sm:text-3xl transform hover:scale-110 transition-transform animate-pop select-none">
          ${icon}
        </div>
      `;
    }
    return `
      <div class="p-6 bg-slate-950/80 rounded-2xl border-2 border-slate-700 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto min-h-[140px]">
        ${dotsHtml}
      </div>
    `;
  }

  // Classic Dice Face Pips
  static renderDiceFace(val) {
    const dicePipMap = {
      1: ['center'],
      2: ['top-right', 'bottom-left'],
      3: ['top-right', 'center', 'bottom-left'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };
    const pips = dicePipMap[val] || ['center'];

    return `
      <div class="w-36 h-36 sm:w-44 sm:h-44 bg-slate-100 rounded-3xl p-4 shadow-2xl border-4 border-slate-300 grid grid-cols-3 grid-rows-3 gap-2 mx-auto">
        <div class="flex items-center justify-center">${pips.includes('top-left') ? '<div class="w-6 h-6 rounded-full bg-red-600 shadow"></div>' : ''}</div>
        <div></div>
        <div class="flex items-center justify-center">${pips.includes('top-right') ? '<div class="w-6 h-6 rounded-full bg-red-600 shadow"></div>' : ''}</div>
        <div class="flex items-center justify-center">${pips.includes('middle-left') ? '<div class="w-6 h-6 rounded-full bg-red-600 shadow"></div>' : ''}</div>
        <div class="flex items-center justify-center">${pips.includes('center') ? '<div class="w-7 h-7 rounded-full bg-red-600 shadow"></div>' : ''}</div>
        <div class="flex items-center justify-center">${pips.includes('middle-right') ? '<div class="w-6 h-6 rounded-full bg-red-600 shadow"></div>' : ''}</div>
        <div class="flex items-center justify-center">${pips.includes('bottom-left') ? '<div class="w-6 h-6 rounded-full bg-red-600 shadow"></div>' : ''}</div>
        <div></div>
        <div class="flex items-center justify-center">${pips.includes('bottom-right') ? '<div class="w-6 h-6 rounded-full bg-red-600 shadow"></div>' : ''}</div>
      </div>
    `;
  }

  // 2. Tens Frame (2x5 grid)
  static renderTenFrame(count, total = 10, icon = '⭐') {
    let cells = '';
    for (let i = 0; i < total; i++) {
      const hasDot = i < count;
      cells += `
        <div class="ten-frame-cell">
          ${hasDot ? `<div class="ten-frame-dot flex items-center justify-center text-sm">${icon}</div>` : ''}
        </div>
      `;
    }
    return `
      <div class="max-w-md mx-auto p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-xl">
        <div class="ten-frame-grid">
          ${cells}
        </div>
        <div class="text-xs text-center text-slate-400 mt-2 font-medium">Tens Frame (5 top, 5 bottom)</div>
      </div>
    `;
  }

  // 3. Balance Scale Widget
  static renderBalanceScale(leftA, leftB, rightA, missingValue = '?') {
    return `
      <div class="max-w-md mx-auto p-6 bg-slate-800/90 rounded-2xl border-2 border-slate-700 shadow-2xl">
        <div class="relative w-full h-32 flex flex-col items-center justify-center mb-4">
          <div class="absolute bottom-0 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-amber-600"></div>
          <div class="absolute bottom-11 w-4 h-4 rounded-full bg-amber-400 shadow"></div>

          <div class="scale-beam scale-balanced w-full h-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-full shadow-lg relative flex justify-between items-center px-4">
            <div class="absolute -left-2 top-3 flex flex-col items-center">
              <div class="w-0.5 h-12 bg-amber-200"></div>
              <div class="w-24 min-h-[44px] bg-slate-900 border-2 border-amber-400 rounded-xl px-2 py-1 flex items-center justify-center shadow-lg text-amber-300 font-bold text-base">
                ${leftA} + ${leftB}
              </div>
            </div>

            <div class="absolute -right-2 top-3 flex flex-col items-center">
              <div class="w-0.5 h-12 bg-amber-200"></div>
              <div class="w-24 min-h-[44px] bg-slate-900 border-2 border-sky-400 rounded-xl px-2 py-1 flex items-center justify-center shadow-lg text-sky-300 font-bold text-base">
                ${rightA} + <span class="text-yellow-400 ml-1 text-xl font-ninja animate-pulse">${missingValue}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center font-ninja text-xl text-slate-200 mt-6">
          <span class="text-amber-400 font-bold">${leftA} + ${leftB}</span> = <span class="text-sky-400 font-bold">${rightA} + ❓</span>
        </div>
      </div>
    `;
  }

  // 4. Arrays Grid Renderer (rows x cols)
  static renderArrayGrid(rows, cols, icon = '🗡️') {
    let gridRows = '';
    for (let r = 0; r < rows; r++) {
      let rowDots = '';
      for (let c = 0; c < cols; c++) {
        rowDots += `
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg sm:text-xl shadow animate-pop hover:scale-110 transition-transform">
            ${icon}
          </div>
        `;
      }
      gridRows += `<div class="flex items-center justify-center gap-2">${rowDots}</div>`;
    }
    return `
      <div class="max-w-md mx-auto p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-xl">
        <div class="flex flex-col gap-2 items-center justify-center mb-3">
          ${gridRows}
        </div>
        <div class="flex items-center justify-between text-xs text-amber-300 font-semibold px-4 pt-2 border-t border-slate-700">
          <span>${rows} Rows</span>
          <span>${cols} Columns</span>
        </div>
      </div>
    `;
  }

  // 5. Fraction Visualizer (Bar)
  static renderFractionVisual(numerator, denominator) {
    let segments = '';
    for (let i = 0; i < denominator; i++) {
      const isShaded = i < numerator;
      segments += `
        <div class="flex-1 h-14 border-r-2 last:border-r-0 border-slate-900 transition-all ${isShaded ? 'bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold' : 'bg-slate-700'}">
          ${isShaded ? '✓' : ''}
        </div>
      `;
    }

    return `
      <div class="max-w-md mx-auto p-6 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-xl">
        <div class="text-sm font-semibold text-slate-300 mb-3 text-center">Fraction Bar (${denominator} Equal Parts)</div>
        <div class="w-full flex rounded-xl overflow-hidden border-2 border-slate-600 shadow-inner">
          ${segments}
        </div>
        <div class="text-center text-xs text-emerald-400 mt-3 font-medium">
          ${numerator} of ${denominator} parts shaded
        </div>
      </div>
    `;
  }

  // 6. Partitioning Apples / Baskets
  static renderPartitionBaskets(total, part1, part2, icon = '🍎') {
    let items = '';
    for (let i = 0; i < total; i++) {
      items += `<span class="text-2xl animate-pop">${icon}</span>`;
    }
    return `
      <div class="max-w-md mx-auto p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-xl">
        <div class="text-center mb-3">
          <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">Total Items: ${total}</div>
          <div class="flex flex-wrap items-center justify-center gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-700">
            ${items}
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-3">
          <div class="bg-amber-950/40 border border-amber-600/50 rounded-xl p-3 text-center">
            <div class="text-xs text-amber-400 font-semibold mb-1">Basket 1</div>
            <div class="text-2xl font-bold text-white">${part1}</div>
          </div>
          <div class="bg-sky-950/40 border border-sky-600/50 rounded-xl p-3 text-center">
            <div class="text-xs text-sky-400 font-semibold mb-1">Basket 2</div>
            <div class="text-2xl font-bold text-yellow-400 font-ninja">❓</div>
          </div>
        </div>
      </div>
    `;
  }
}

window.VisualRenderers = VisualRenderers;