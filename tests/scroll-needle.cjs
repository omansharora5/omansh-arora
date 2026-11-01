const assert = require('node:assert/strict');

// Accepts an existing Playwright Page, so the static site needs no browser dependency.
module.exports = async function verifyScrollNeedle(page, baseURL) {
  const results = [];
  for (const width of [1440, 768, 375]) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(baseURL);
    assert(await page.locator('#dialNeedle').isVisible(), 'Needle must be visible');
    assert.equal(await page.getByText('Open to research internships', { exact: true }).count(), 0);
    async function measure(progress) {
      await page.evaluate(p => scrollTo({ top: p * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }), progress);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      return page.evaluate(() => {
        const line = document.querySelector('#dialNeedle line');
        const matrix = line.getScreenCTM();
        const tip = new DOMPoint(line.x2.baseVal.value, line.y2.baseVal.value).matrixTransform(matrix);
        const pivot = new DOMPoint(line.x1.baseVal.value, line.y1.baseVal.value).matrixTransform(matrix);
        const face = document.querySelector('.dial-face').getBoundingClientRect();
        return { dx: tip.x - pivot.x, dy: tip.y - pivot.y, visible: face.top >= 0 && face.bottom <= innerHeight && tip.x >= 0 && tip.x < innerWidth && tip.y >= 0 && tip.y < innerHeight };
      });
    }
    const top = await measure(0);
    const middle = await measure(.5);
    const bottom = await measure(1);
    const back = await measure(.25);
    assert(Math.abs(top.dx) < 2 && top.dy < -20, 'Top must point upward');
    assert(middle.dx > 20 && Math.abs(middle.dy) < 2, 'Midpoint must point right');
    assert(Math.abs(bottom.dx) < 2 && bottom.dy > 20, 'Bottom must point downward');
    assert(back.dx > 10 && back.dy < -10, 'Scrolling back must reverse the needle');
    for (const state of [top, middle, bottom, back]) assert(state.visible, 'Needle must remain on screen');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await measure(.75);
    assert(reduced.dx > 10 && reduced.dy > 10, 'Reduced motion must preserve accurate progress');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No document overflow');
    results.push({ width, passed: true });
  }
  return results;
};
