import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

const URL = "https://www.sns.gov.pt/noticias/";

async function scrape() {
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
        data: dataPub,
        link: "https://www.sns.gov.pt" + link
      });
    }
  });

  fs.writeFileSync("noticias.json", JSON.stringify(noticias, null, 2));
}

scrape();
