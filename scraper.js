import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const URL = "https://www.sns.gov.pt/noticias/";

async function scrape() {
  try {
    console.log("A obter notícias do SNS...");

    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

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

    // remover duplicados (por link)
    const unicas = Array.from(
      new Map(noticias.map(item => [item.link, item])).values()
    );

    // limitar a 10 notícias
    const limitadas = unicas.slice(0, 10);

    fs.writeFileSync("noticias.json", JSON.stringify(limitadas, null, 2));

    console.log(`✅ ${limitadas.length} notícias guardadas com sucesso!`);

  } catch (error) {
    console.error("❌ Erro ao fazer scraping:", error.message);
  }
}

scrape();
