import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const TARGET_URL = "https://www.sns.gov.pt/noticias/";
const PROXY = "https://api.allorigins.win/get?url=";

async function scrape() {
  try {
    console.log("A obter notícias do SNS via proxy...");

    const url = PROXY + encodeURIComponent(TARGET_URL);
    const response = await axios.get(url);

    const html = response.data.contents;

    if (!html) {
      throw new Error("Sem HTML");
    }

    console.log("HTML recebido (primeiros 300 chars):");
    console.log(html.substring(0, 300));

    const $ = cheerio.load(html);

    const noticias = [];

    // 🔥 NOVO SELETOR MAIS GENÉRICO
    $("article, .views-row, .card, .node").each((i, el) => {
      const titulo = $(el).find("a").first().text().trim();
      const link = $(el).find("a").first().attr("href");
      const dataPub = $(el).text().match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0];

      if (titulo && link && titulo.length > 10) {
        noticias.push({
          titulo,
          data: dataPub || null,
          link: link.startsWith("http")
            ? link
            : "https://www.sns.gov.pt" + link
        });
      }
    });

    const unicas = Array.from(
      new Map(noticias.map(item => [item.link, item])).values()
    );

    const limitadas = unicas.slice(0, 10);

    fs.writeFileSync("noticias.json", JSON.stringify(limitadas, null, 2));

    console.log(`✅ ${limitadas.length} notícias guardadas!`);

  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

scrape();
