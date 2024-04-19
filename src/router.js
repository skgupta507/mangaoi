import { Router } from "express";
import axios from "axios";
import { load } from "cheerio";
const router = Router();

router.get("/", async (req, res) => {
    res.status(200).json({
        routes: [
            "/api/trending",
            "/api/recommended",
            "/api/latest",
            "/api/search/{query}",
            "/api/info/{id}",
            "/api/read/{id}"
        ]
    })
});

router.get("/trending", async (req, res) => {
    try {
        const results = [];
        const { data } = (await axios.get(`${process.env.BASE_URL}/home`));
        const $ = load(data);
        $("#manga-trending .trending-list .swiper-container .swiper-wrapper .swiper-slide").each((i, e) => {
            results.push({
                id: $(e).find(".manga-poster a.link-mask").attr("href").trim().slice(1),
                title: $(e).find(".manga-poster img.manga-poster-img").attr("alt").trim(),
                image: $(e).find(".manga-poster img.manga-poster-img").attr("src")
            })
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/recommended", async (req, res) => {
    try {
        const results = [];
        const { data } = (await axios.get(`${process.env.BASE_URL}/home`));
        const $ = load(data);
        $("#manga-featured .featured-list .swiper-container .swiper-wrapper .swiper-slide").each((i, e) => {
            results.push({
                id: $(e).find(".manga-poster a.link-mask").attr("href").trim().slice(1),
                title: $(e).find(".manga-poster img.manga-poster-img").attr("alt").trim(),
                image: $(e).find(".manga-poster img.manga-poster-img").attr("src")
            })
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/latest", async (req, res) => {
    try {
        const results = [];
        const { data } = (await axios.get(`${process.env.BASE_URL}/home`));
        const $ = load(data);
        $("#main-wrapper #mw-2col #main-content .tab-content #latest-chap .mls-wrap .item").each((i, e) => {
            const chapters = [];
            $(e).find(".manga-detail .fd-list .fdl-item").each((i, element) => {
                chapters.push({
                    id: $(element).find(".chapter a").attr("href").slice(6),
                    title: "Chapter " + $(element).find(".chapter a").text().trim().match(/\d+(\.\d+)?/)[0]
                });
            });
            results.push({
                id: $(e).find("a.manga-poster").attr("href").trim().slice(1),
                title: $(e).find("img.manga-poster-img").attr("alt").trim(),
                image: $(e).find("img.manga-poster-img").attr("src"),
                chapters
            })
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/search/:query", async (req, res) => {
    try {
        const results = [];
        const { data } = (await axios.get(`${process.env.BASE_URL}/search?keyword=${req.params.query}`));
        const $ = load(data);
        $("div.manga_list-sbs div.mls-wrap div.item").each((i, e) => {
            const genres = [];
            $(e).find("div.manga-detail div.fd-infor span > a").each((i, element) => {
                genres.push($(element).text());
            });
            results.push({
                id: $(e).find("a.manga-poster").attr("href").split("/")[1],
                title: $(e).find("div.manga-detail h3.manga-name a").text().trim(),
                image: $(e).find("a.manga-poster img").attr("src"),
                genres
            })
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/info/:id", async (req, res) => {
    try {
        const { data } = (await axios.get(`${process.env.BASE_URL}/${req.params.id}`));
        const $ = load(data);
        const genres = [];
        $(".container .sort-desc .genres a").each((i, e) => {
            genres.push($(e).text().trim())
        });
        const chapters = [];
        $(".container .chapters-list-ul ul li").each((i, e) => {
            chapters.push({
                id: $(e).find("a").attr("href").split("/read/")[1],
                title: $(e).find("a").attr("title").trim(),
                chapter: $(e).find("a span.name").text().split("Chapter ")[1].split(":")[0],
            });
        });
        res.status(200).json({
            id: req.params.id,
            title: $(".container .anisc-detail h2.manga-name").text().trim(),
            image: $(".container img.manga-poster-img").attr("src"),
            description: $(".modal-body .description-modal").text().split("\n").join(" ").trim(),
            genres,
            chapters
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/read/:id(*)", async (req, res) => {
    try {
        const results = [];
        const { data } = (await axios.get(`${process.env.BASE_URL}/read/${req.params.id}`));
        const $ = load(data);
        const identifier = $("div#wrapper").attr("data-reading-id");
        if (!identifier) {
            throw new Error("Unable to find manga pages, retry again!");
        }
        const ajax = `https://mangareader.to/ajax/image/list/chap/${identifier}?mode=vertical&quality=high`;
        const { data: pages } = (await axios.get(ajax));
        const $$ = load(pages.html);
        $$("div#main-wrapper div.container-reader-chapter div.iv-card").each((i, e) => {
            results.push($$(e).attr("data-url").replace("&amp;", "&"))
        })
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router