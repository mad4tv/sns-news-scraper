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
      throw new Error("Sem conteúdo recebido do proxy");
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

    // remover duplicados
    const unicas = Array.from(
      new Map(noticias.map(item => [item.link, item])).values()
    );

    // limitar a 10
    const limitadas = unicas.slice(0, 10);

    fs.writeFileSync("noticias.json", JSON.stringify(limitadas, null, 2));

    console.log(`✅ ${limitadas.length} notícias guardadas com sucesso!`);

  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

scrape();
