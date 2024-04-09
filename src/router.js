import { Router } from "express";
import axios from "axios";
import { load } from "cheerio";
import { MANGA } from "@consumet/extensions";
const router = Router();

const base_url = "https://mangareader.to";

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
        const data = [];
        const body = (await axios.get(`${base_url}/home`)).data
        const $ = load(body);
        $("#manga-trending .trending-list .swiper-container .swiper-wrapper .swiper-slide").each((i, e) => {
            data.push({
                id: $(e).find(".manga-poster a.link-mask").attr("href").trim().slice(1),
                title: $(e).find(".manga-poster img.manga-poster-img").attr("alt").trim(),
                image: $(e).find(".manga-poster img.manga-poster-img").attr("src")
            })
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/recommended", async (req, res) => {
    try {
        const data = [];
        const body = (await axios.get(`${base_url}/home`)).data
        const $ = load(body);
        $("#manga-featured .featured-list .swiper-container .swiper-wrapper .swiper-slide").each((i, e) => {
            data.push({
                id: $(e).find(".manga-poster a.link-mask").attr("href").trim().slice(1),
                title: $(e).find(".manga-poster img.manga-poster-img").attr("alt").trim(),
                image: $(e).find(".manga-poster img.manga-poster-img").attr("src")
            })
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/latest", async (req, res) => {
    try {
        const data = [];
        const body = (await axios.get(`${base_url}/home`)).data
        const $ = load(body);
        $("#main-wrapper #mw-2col #main-content .tab-content #latest-chap .mls-wrap .item").each((i, e) => {
            const chapters = [];
            $(e).find(".manga-detail .fd-list .fdl-item").each((i, element) => {
                chapters.push({
                    id: $(element).find(".chapter a").attr("href").slice(6),
                    title: "Chapter " + $(element).find(".chapter a").text().trim().match(/\d+(\.\d+)?/)[0]
                });
            });
            data.push({
                id: $(e).find("a.manga-poster").attr("href").trim().slice(1),
                title: $(e).find("img.manga-poster-img").attr("alt").trim(),
                image: $(e).find("img.manga-poster-img").attr("src"),
                chapters
            })
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/search/:query", async (req, res) => {
    try {
        const manga = new MANGA.MangaReader();
        const data = await manga.search(req.params.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/info/:id", async (req, res) => {
    try {
        const manga = new MANGA.MangaReader();
        const data = await manga.fetchMangaInfo(req.params.id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/read/:id(*)", async (req, res) => {
    try {
        const manga = new MANGA.MangaReader();
        const data = await manga.fetchChapterPages(req.params.id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router