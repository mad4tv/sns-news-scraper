import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const TARGET_URL = "https://www.sns.gov.pt/noticias/";
const PROXY = "https://api.allorigins.win/raw?url=";

async function scrape() {
  try {
    console.log("A obter notícias do SNS...");

    const response = await axios.get(PROXY + encodeURIComponent(TARGET_URL));
    const html = response.data;

    const $ = cheerio.load(html);
    const noticias = [];

    // 🔥 cada bloco de notícia
    $("div.views-row, article, .node").each((i, el) => {

      const titulo = $(el).find("h3 a").text().trim();
      const link = $(el).find("h3 a").attr("href");
      const dataPub = $(el).find(".date-display-single").text().trim();
      const resumo = $(el).find("p").first().text().trim();

      if (titulo && link) {
        noticias.push({
          titulo,
          data: dataPub || null,
          resumo: resumo || null,
          link: link.startsWith("http")
            ? link
            : "https://www.sns.gov.pt" + link
        });
      }
    });

    // fallback (caso estrutura mude)
    if (noticias.length === 0) {
      console.log("Fallback ativado...");

      $("h3 a").each((i, el) => {
        const titulo = $(el).text().trim();
        const link = $(el).attr("href");

        if (titulo && link && titulo.length > 15) {
          noticias.push({
            titulo,
            data: null,
            resumo: null,
            link: link.startsWith("http")
              ? link
              : "https://www.sns.gov.pt" + link
          });
        }
      });
    }

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
