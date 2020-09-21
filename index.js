const request = require("async-request");
const arg = require("minimist")(process.argv.slice(2));
const prompt = require("prompt-async");
const formatter = new Intl.NumberFormat();
const url = "https://www.albion-online-data.com/api/v2/stats/prices";

const base = 9999999999999;
let json = "";
let city = [];

const search = async (item, location, quality,runes = "") => {
	try {
		const response = await request(
			`${url}/${item}${runes}?locations=${location}&qualities=${quality}`
		);
		json = JSON.parse(response.body);
	} catch (e) {
		console.log("Item not found");
		console.error(e);
		process.exit(1);
		return;
	}
	let min = base;
	for (e of json) {
		if (e.sell_price_min > 0)
			city.push({city:e.city,price:formatter.format(e.sell_price_min),quality:e.quality});
	}
	console.table(city);
};

const main = async () => {
	const city = arg.city || arg.c || "";
	const quality = arg.quality || arg.q || "";
	let runes;
	if (arg.runes || arg.r) {
		let r = arg.runes || arg.r;
		runes = `@${r}`;
	}
	if (arg.item || arg.i) {
		const item = arg.item || arg.i;
		await search(item, city, quality,runes);
	} else {
		const item = await list_cat();
		await search(item, city, quality,runes);
	}
};

const list_cat = async () => {
	const url =
		"https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.json";
	const response = await request(url);
	const json = JSON.parse(response.body);
	console.log("Select the category");
	let i = 1;
	let category = [];
	for (cat of Object.keys(json.items)) {
		if (typeof json.items[cat] === "object") {
			console.log(`${i}: ${cat}`);
			category[i] = json.items[cat];
			i++;
		}
	}
	prompt.start();
	const { choice } = await prompt.get(["choice"]);
	console.log(choice);
	const item = await list_item(category[choice]);
	return item;
};

const list_item = async (category) => {
	let i = 1;
	let names = [];
	for (item of category) {
		if (item["@uniquename"]) {
			console.log(`${i} ${item["@uniquename"]}`);
			names[i] = item["@uniquename"];
			i++;
		}
	}
	prompt.start();
	const { choice } = await prompt.get(["choice"]);
	return names[choice];
};

main();
