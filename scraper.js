import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const URL = "https://www.sns.gov.pt/noticias/";

async function scrape() {
  try {
    console.log("A obter notícias do SNS...");

    const response = await axios.get(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-PT,pt;q=0.9",
        "Referer": "https://www.google.com/",
        "Cache-Control": "no-cache"
      },
      maxRedirects: 5,
      validateStatus: status => status < 500 // aceita 403/405 para debug
    });

    if (response.status !== 200) {
      throw new Error(`Status ${response.status}`);
    }

    const $ = cheerio.load(response.data);
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
    console.error("❌ Erro final:", error.message);
  }
}

scrape();
