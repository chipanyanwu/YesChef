import axios from "axios";
// import cheerio from "cheerio";

export async function scrapeWebsite(url : string) {
    try {
        const {data} = await axios.get(url);
        // const webPage = cheerio.load(data);
        // i think data is a string
        console.log(data as string);
        return data as string;

    } catch (err) {
        console.error(`FAILED TO SCRAPE WEBPAGE ${url}, ${err}`);
        return "";
    }
}