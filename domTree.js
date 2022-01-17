const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const TARGET_URL = 'https://www.netflix.com/kr-en/'
const WIDTH = 1024
const HEIGHT = 1366

const OUTPUT_PATH = './src/sample';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  })
  const page = await browser.newPage()
  await page.goto(TARGET_URL)
  await page.setViewport({
    width: WIDTH,
    height: HEIGHT,
  });


  await delay(4000)

  const tree = await page.evaluate(() => {
    const uuidv4 = () => {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }

    const getRect = (dom) => {
      const children = [...dom.children].map((child) => getRect(child)).filter((node) => node != null)
      const rect = dom.getBoundingClientRect()
      
      return (rect) ? {
        id: uuidv4(),
        name: dom.localName,
        ...rect.toJSON(),
        children,
      } : null
    }
    return getRect(document.body)
  })

  const filename = `${TARGET_URL.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${WIDTH}_${HEIGHT}.json`
  const filepath = path.join(OUTPUT_PATH, filename)

  if (!fs.existsSync(OUTPUT_PATH)) fs.mkdirSync(OUTPUT_PATH, { recursive: true })

  fs.writeFileSync(filepath, JSON.stringify(tree, null, 2))

  // await browser.close()
})()

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}