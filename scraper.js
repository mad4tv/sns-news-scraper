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

    let html = response.data.contents;

    if (!html) {
      throw new Error("Sem conteúdo");
    }

    // 🔥 DETETAR E DECODIFICAR BASE64
    if (!html.includes("<html")) {
      console.log("Conteúdo em Base64 detetado → a descodificar...");
      html = Buffer.from(html, "base64").toString("utf-8");
    }

    const $ = cheerio.load(html);
    const noticias = [];

    $(".views-row").each((i, el) => {
      const titulo = $(el).find("h3 a").text().trim();
      const link = $(el).find("h3 a").attr("href");
      const dataPub = $(el).find(".date-display-single").text().trim();

      if (titulo && link) {
        noticias.push({
          titulo,
          data: dataPub || null,
          link: "https://www.sns.gov.pt" + link
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
